import { PLANS } from "./themes";

export type StripeCheckoutParams = {
  planId: string;
  userId: string;
  email: string;
  origin: string;
};

export async function createStripeCheckoutSession({
  planId,
  userId,
  email,
  origin,
}: StripeCheckoutParams): Promise<{ url: string }> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const plan = PLANS.find((p) => p.id === planId);

  // If a real Stripe secret key is present in environment, call the Stripe API
  if (secretKey && plan) {
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("customer_email", email);
    params.append("client_reference_id", userId);
    params.append("success_url", `${origin}/admin/account?upgraded=${plan.id}&session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/admin/account?canceled=true`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][product_data][name]", `Linktree ${plan.name} Plan`);
    params.append("line_items[0][price_data][recurring][interval]", "month");
    const priceCents = plan.id === "starter" ? 500 : plan.id === "pro" ? 900 : 2000;
    params.append("line_items[0][price_data][unit_amount]", String(priceCents));

    try {
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      const data = await response.json();
      if (data.url) return { url: data.url };
    } catch {
      // Fall through to self-hosted checkout simulation
    }
  }

  // Self-hosted / local test checkout flow
  return { url: `/checkout?plan=${encodeURIComponent(planId)}` };
}
