import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getPaymentGateway } from "@/lib/payments/gateway";
import { addCredits } from "@/lib/engine/credits";
import { telegramPayment } from "@/lib/telegram/notify";
import { emitEvent } from "@/lib/engine/events";

const Schema = z.object({
  orderId: z.string().min(4),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
});

/**
 * Server-side payment verification.
 * Credits added ONLY after gateway confirms success.
 * Client cannot fake success.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const service = createServiceClient();
    const { data: payment, error } = await service
      .from("payments")
      .select("*")
      .eq("order_id", parsed.data.orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        credits: payment.credits,
      });
    }

    if (payment.status === "refunded") {
      return NextResponse.json({ error: "Order refunded" }, { status: 400 });
    }

    const gateway = getPaymentGateway();
    const verified = await gateway.verifyPayment({
      orderId: parsed.data.orderId,
      gatewayPaymentId: parsed.data.gatewayPaymentId,
      gatewaySignature: parsed.data.gatewaySignature,
    });

    if (!verified.success) {
      await service
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("order_id", payment.order_id);

      return NextResponse.json(
        { success: false, reason: verified.reason },
        { status: 402 }
      );
    }

    // Mark success then credit atomically (idempotent via transaction_id)
    await service
      .from("payments")
      .update({ status: "success", updated_at: new Date().toISOString() })
      .eq("order_id", payment.order_id)
      .eq("status", "pending");

    const { balanceAfter } = await addCredits({
      userId: user.id,
      amount: payment.credits,
      transactionId: `purchase_${payment.order_id}`,
      type: "purchase",
    });

    void telegramPayment(payment.order_id, Number(payment.amount), payment.credits);
    void emitEvent({
      type: "payment",
      userId: user.id,
      credits: payment.credits,
      metadata: { orderId: payment.order_id },
    });

    return NextResponse.json({
      success: true,
      credits: payment.credits,
      balanceAfter,
    });
  } catch (err) {
    console.error("[verify]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
