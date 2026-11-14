export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PLANS } from "@/lib/themes";
import { upgradePlanAction } from "@/app/actions";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Stripe Checkout",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const planId = params.plan ?? "pro";
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[2]; // Default to Pro

  const priceFormatted = plan.id === "starter" ? "$5.00" : plan.id === "pro" ? "$9.00" : "$20.00";

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-shade">
      <header className="border-b border-shade/10 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/account"
              className="grid h-8 w-8 place-items-center rounded-full text-shade/50 transition hover:bg-shade/5 hover:text-shade"
              aria-label="Back to Linktree"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Logo className="text-shade" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-chartreuse/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">
              <Sparkles className="h-3 w-3" /> Stripe Test Mode
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Order Summary */}
          <div className="space-y-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-shade/40">Subscribe to</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold text-shade sm:text-4xl">
                Linktree {plan.name}
              </h1>
              <p className="mt-2 text-2xl font-extrabold text-shade">
                {priceFormatted} <span className="text-sm font-normal text-shade/50">per month</span>
              </p>
            </div>

            <div className="rounded-2xl border border-shade/10 bg-white p-5 shadow-sm space-y-3">
              <p className="text-[12px] font-bold uppercase tracking-wider text-shade/50">What&apos;s included</p>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] text-shade/75">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-forest" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-shade/50">
              <ShieldCheck className="h-4 w-4 text-forest" />
              <span>Guaranteed safe & secure checkout powered by Stripe.</span>
            </div>
          </div>

          {/* Payment Details Form */}
          <div className="rounded-3xl border border-shade/10 bg-white p-6 shadow-md sm:p-8">
            <h2 className="text-lg font-bold text-shade">Payment details</h2>
            <p className="mt-1 text-[12.5px] text-shade/50">Enter card details to complete your subscription.</p>

            <form action={upgradePlanAction} className="mt-6 space-y-4">
              <input type="hidden" name="plan" value={plan.id} />

              <div>
                <label htmlFor="card-email" className="block text-[12.5px] font-semibold text-shade">
                  Email
                </label>
                <input
                  id="card-email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="mt-1.5 h-11 w-full rounded-xl border border-shade/15 bg-shade/[0.03] px-3.5 text-[14px] text-shade/70"
                />
              </div>

              <div>
                <label htmlFor="card-number" className="block text-[12.5px] font-semibold text-shade">
                  Card information
                </label>
                <div className="mt-1.5 overflow-hidden rounded-xl border border-shade/15 bg-white focus-within:border-shade/40 focus-within:ring-4 focus-within:ring-shade/[0.06]">
                  <div className="flex items-center px-3.5 py-2.5">
                    <CreditCard className="mr-2 h-4 w-4 text-shade/40" />
                    <input
                      id="card-number"
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      defaultValue="4242 4242 4242 4242"
                      className="w-full bg-transparent text-[14px] text-shade outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 border-t border-shade/10">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      defaultValue="12/28"
                      className="border-r border-shade/10 px-3.5 py-2.5 text-[14px] text-shade outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      defaultValue="123"
                      className="px-3.5 py-2.5 text-[14px] text-shade outline-none"
                    />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-shade/45">
                  Test card pre-filled. No real credit card will be charged.
                </p>
              </div>

              <div>
                <label htmlFor="card-name" className="block text-[12.5px] font-semibold text-shade">
                  Name on card
                </label>
                <input
                  id="card-name"
                  type="text"
                  defaultValue={user.name}
                  className="mt-1.5 h-11 w-full rounded-xl border border-shade/15 bg-white px-3.5 text-[14px] text-shade outline-none focus:border-shade/40 focus:ring-4 focus:ring-shade/[0.06]"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  <Lock className="h-4 w-4" /> Subscribe for {priceFormatted}/mo
                </Button>
              </div>

              <p className="text-center text-[11.5px] text-shade/45">
                By confirming, you agree to our Terms of Service and Privacy Policy. You can cancel anytime in Account settings.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
