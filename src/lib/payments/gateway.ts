/**
 * Payment gateway abstraction.
 * Success is ALWAYS verified server-side. Never trust client claims.
 */

export interface CreateOrderInput {
  userId: string;
  amount: number; // INR major units
  credits: number;
  packageId?: string;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  gateway: string;
  clientPayload: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  orderId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  raw?: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  success: boolean;
  orderId: string;
  gatewayPaymentId?: string;
  reason?: string;
}

export interface PaymentGateway {
  name: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
}

/** Stub / mock gateway for local + until real keys are set */
export class MockGateway implements PaymentGateway {
  name = "mock";

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const orderId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      orderId,
      amount: input.amount,
      currency: "INR",
      gateway: this.name,
      clientPayload: {
        orderId,
        amount: input.amount,
        credits: input.credits,
        // Client must still hit verify endpoint — never auto-credit
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    // Mock: only succeed if signature matches deterministic pattern
    if (input.gatewaySignature === `mock_ok_${input.orderId}`) {
      return {
        success: true,
        orderId: input.orderId,
        gatewayPaymentId: input.gatewayPaymentId || `pay_${input.orderId}`,
      };
    }
    return {
      success: false,
      orderId: input.orderId,
      reason: "Invalid signature or payment not completed",
    };
  }
}

export function getPaymentGateway(): PaymentGateway {
  const name = process.env.PAYMENT_GATEWAY || "mock";
  // Future: RazorpayGateway, StripeGateway when keys present
  if (name === "razorpay" && process.env.PAYMENT_KEY_SECRET) {
    // return new RazorpayGateway(...)
  }
  return new MockGateway();
}

/** Default credit packages (admin can override via DB later) */
export const CREDIT_PACKAGES = [
  { id: "starter", credits: 50, priceInr: 49, label: "Starter · 50 credits" },
  { id: "pro", credits: 150, priceInr: 129, label: "Pro · 150 credits" },
  { id: "power", credits: 500, priceInr: 349, label: "Power · 500 credits" },
] as const;
