"use client";

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CREDIT_PACKAGES } from "@/lib/payments/gateway";

export default function BuyCreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packageId: "starter" | "pro" | "power") {
    setLoading(packageId);
    setError(null);
    setMessage(null);
    try {
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const order = await createRes.json();
      if (!createRes.ok) {
        setError(order.error || "Could not create order");
        return;
      }

      // Mock gateway: client must still call verify with correct signature.
      // Real Razorpay would open checkout widget here.
      const signature = `mock_ok_${order.orderId}`;
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          gatewayPaymentId: `pay_${order.orderId}`,
          gatewaySignature: signature,
        }),
      });
      const verified = await verifyRes.json();
      if (!verifyRes.ok || !verified.success) {
        setError(verified.reason || verified.error || "Payment failed");
        return;
      }
      setMessage(
        `Success! +${verified.credits} credits. Balance: ${verified.balanceAfter}`
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold">Buy credits</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Payments are verified server-side. Client cannot fake success.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle className="text-base">{pkg.label}</CardTitle>
                <CardDescription>₹{pkg.priceInr}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  loading={loading === pkg.id}
                  onClick={() => buy(pkg.id)}
                >
                  Buy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {message && (
          <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
      </div>
    </Shell>
  );
}
