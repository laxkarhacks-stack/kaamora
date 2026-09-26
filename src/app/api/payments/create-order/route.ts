import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  getPaymentGateway,
  CREDIT_PACKAGES,
} from "@/lib/payments/gateway";
import { rateLimit, clientKeyFromHeaders } from "@/lib/security/rate-limit";

const Schema = z.object({
  packageId: z.enum(["starter", "pro", "power"]),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(`pay:${clientKeyFromHeaders(request.headers)}`, 20);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

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
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const pkg = CREDIT_PACKAGES.find((p) => p.id === parsed.data.packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const gateway = getPaymentGateway();
    const order = await gateway.createOrder({
      userId: user.id,
      amount: pkg.priceInr,
      credits: pkg.credits,
      packageId: pkg.id,
    });

    const service = createServiceClient();
    const { error } = await service.from("payments").insert({
      order_id: order.orderId,
      user_id: user.id,
      amount: pkg.priceInr,
      credits: pkg.credits,
      gateway: order.gateway,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.orderId,
      amount: order.amount,
      credits: pkg.credits,
      currency: order.currency,
      gateway: order.gateway,
      clientPayload: order.clientPayload,
    });
  } catch (err) {
    console.error("[create-order]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
