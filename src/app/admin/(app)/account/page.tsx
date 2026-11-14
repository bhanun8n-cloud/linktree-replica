export const instant = false;

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  Download,
  ExternalLink,
  KeyRound,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { DeleteAccountForm, PasswordForm, PersonalForm } from "@/components/admin/AccountForms";
import { MockButton } from "@/components/admin/MockButton";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Form";
import { upgradePlanAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { getLinkCount, getViewCount } from "@/lib/data";
import { PLANS, planName } from "@/lib/themes";

export const metadata = { title: "Account" };

const SECTIONS = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "privacy", label: "Data and privacy", icon: ShieldCheck },
  { id: "security", label: "Account management", icon: KeyRound },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "plans", label: "Plans", icon: Wallet },
  { id: "invoices", label: "Invoices", icon: Download },
  { id: "integrations", label: "Integrations", icon: ExternalLink },
  { id: "danger", label: "Delete account", icon: Trash2 },
];

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const upgraded = PLANS.find((plan) => plan.id === params.upgraded);
  const links = getLinkCount(user.id);
  const views = getViewCount(user.id, 30);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-shade/45 hover:text-shade">
            <ArrowLeft className="h-3 w-3" /> Back to app
          </Link>
          <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Account
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/45">Manage your details, security, plan and data.</p>
        </div>
        <Link
          href={`/${user.username}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-shade/15 bg-white px-3.5 py-2 text-[12px] font-semibold text-shade/70 transition hover:border-shade/30 hover:text-shade"
        >
          View my page <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {upgraded ? (
        <div className="flex items-center gap-2 rounded-2xl border border-forest/20 bg-forest/[0.06] px-4 py-3 text-[12.5px] font-medium text-forest">
          <Check className="h-4 w-4" /> You&apos;re now on the {upgraded.name} plan. Your new features are unlocked.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-0.5 rounded-2xl border border-shade/10 bg-white p-2" aria-label="Account sections">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium text-shade/55 transition hover:bg-chalk hover:text-shade"
              >
                <Icon className="h-3.5 w-3.5 text-shade/35" /> {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <section id="personal" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatar || undefined} size={52} />
                <div>
                  <h2 className="font-display text-[18px] font-bold text-shade">Personal</h2>
                  <p className="text-[11.5px] text-shade/45">Manage your personal details and account information.</p>
                </div>
              </div>
              <span className="inline-flex self-start rounded-full bg-grape/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-grape">
                {planName(user.plan)}
              </span>
            </div>
            <div className="mt-5">
              <PersonalForm name={user.name} email={user.email} />
            </div>
            <div className="mt-5 grid gap-3 border-t border-shade/10 pt-4 sm:grid-cols-3">
              {[
                { label: "Username", value: `@${user.username}` },
                { label: "Links", value: links.toLocaleString() },
                { label: "Views (30d)", value: views.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-chalk/60 px-3 py-2.5">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-shade/35">{item.label}</p>
                  <p className="mt-1 truncate text-[12.5px] font-semibold text-shade">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="privacy" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Data and privacy</h2>
            <p className="mt-1 text-[11.5px] text-shade/45">Control your data and how your page appears.</p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Export analytics", description: "Download views and clicks as a CSV.", href: "/api/analytics/export?range=30" },
                { label: "Export contacts", description: "Download your audience list as a CSV.", href: "/api/analytics/export?type=contacts" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12.5px] font-semibold text-shade">{item.label}</p>
                    <p className="text-[11px] text-shade/40">{item.description}</p>
                  </div>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-1.5 self-start rounded-full bg-chalk px-2.5 py-1.5 text-[10.5px] font-semibold text-shade/60 transition hover:bg-shade hover:text-white"
                  >
                    <Download className="h-3 w-3" /> Download
                  </a>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-shade/10 px-3.5 py-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-shade">Personalized recommendations</p>
                  <p className="text-[11px] text-shade/40">Use your activity to suggest links and designs.</p>
                </div>
                <Switch name="recommendations" label="" defaultChecked />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-shade/10 px-3.5 py-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-shade">Search engine visibility</p>
                  <p className="text-[11px] text-shade/40">Let search engines index your public page.</p>
                </div>
                <Switch name="searchable" label="" defaultChecked />
              </div>
            </div>
            <p className="mt-3 text-[10.5px] text-shade/30">Preferences in this demo are visual only.</p>
          </section>

          <section id="security" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Account management</h2>
            <p className="mt-1 text-[11.5px] text-shade/45">Keep your account secure.</p>

            <div className="mt-5">
              <h3 className="text-[12.5px] font-bold text-shade">Password</h3>
              <p className="mt-0.5 text-[11px] text-shade/40">Use at least 8 characters you don&apos;t use anywhere else.</p>
              <div className="mt-3">
                <PasswordForm />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-shade">Multi-factor authentication (MFA)</p>
                <p className="text-[11px] text-shade/40">Add an extra layer of security with a text message code.</p>
              </div>
              <MockButton
                title="Multi-factor authentication"
                message="MFA is mocked in this clone. A production build would send a verification code by SMS or an authenticator app and require it at login."
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Enable
              </MockButton>
            </div>

            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-shade">Login email</p>
                <p className="text-[11px] text-shade/40">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest">
                <Check className="h-3 w-3" /> Verified
              </span>
            </div>
          </section>

          <section id="plans" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-[18px] font-bold text-shade">Plans</h2>
                <p className="mt-1 text-[11.5px] text-shade/45">
                  You&apos;re on <span className="font-semibold text-shade">{planName(user.plan)}</span>. Upgrade any time.
                </p>
              </div>
              <Link href="/pricing" className="text-[11.5px] font-semibold text-grape hover:underline">
                Compare plans
              </Link>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {PLANS.map((plan) => {
                const current = plan.id === user.plan;
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-2xl border p-4 ${
                      current ? "border-grape bg-grape/[0.04]" : "border-shade/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-bold text-shade">{plan.name}</h3>
                      {current ? (
                        <span className="rounded-full bg-grape px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 font-display text-[22px] font-extrabold leading-none text-shade">
                      {plan.price}
                      <span className="ml-0.5 text-[10px] font-medium text-shade/35">/mo</span>
                    </p>
                    <p className="mt-1 text-[10px] text-shade/35">{plan.tagline}</p>
                    <ul className="mt-3 flex-1 space-y-1">
                      {plan.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex gap-1.5 text-[10.5px] leading-relaxed text-shade/55">
                          <Check className="mt-0.5 h-2.5 w-2.5 flex-none text-forest" /> {feature}
                        </li>
                      ))}
                    </ul>
                    {current ? (
                      <span className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-chalk text-[10.5px] font-semibold text-shade/40">
                        Your plan
                      </span>
                    ) : plan.id === "free" ? (
                      <form action={upgradePlanAction} className="mt-3">
                        <input type="hidden" name="plan" value={plan.id} />
                        <button
                          type="submit"
                          className={buttonClasses("outline", "sm", "w-full")}
                        >
                          Downgrade to Free
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={`/checkout?plan=${plan.id}`}
                        className={`mt-3 ${buttonClasses(plan.highlight ? "primary" : "outline", "sm", "w-full")}`}
                      >
                        Upgrade with Stripe
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section id="billing" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Billing</h2>
            <p className="mt-1 text-[11.5px] text-shade/45">Payment method and billing details.</p>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-shade/10 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-12 place-items-center rounded-md bg-shade text-[9px] font-bold tracking-wider text-white">
                  VISA
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-shade">No payment method</p>
                  <p className="text-[11px] text-shade/40">Add a card to upgrade to a paid plan.</p>
                </div>
              </div>
              <MockButton
                title="Payment method"
                message="Billing is mocked in this clone. A production build would open a secure Stripe checkout and store the payment method for renewals."
              >
                <CreditCard className="h-3.5 w-3.5" /> Add card
              </MockButton>
            </div>
          </section>

          <section id="invoices" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Invoices</h2>
            <p className="mt-1 text-[11.5px] text-shade/45">Your billing history.</p>
            <div className="mt-4 rounded-xl border border-shade/10">
              {[
                { date: "Nov 1, 2026", plan: `${planName(user.plan)} plan`, amount: user.plan === "free" ? "$0.00" : "$6.00", status: "Paid" },
                { date: "Oct 1, 2026", plan: `${planName(user.plan)} plan`, amount: user.plan === "free" ? "$0.00" : "$6.00", status: "Paid" },
                { date: "Sep 1, 2026", plan: "Free plan", amount: "$0.00", status: "Paid" },
              ].map((invoice, index) => (
                <div
                  key={invoice.date}
                  className={`flex items-center gap-3 px-3.5 py-3 text-[11.5px] ${index > 0 ? "border-t border-shade/10" : ""}`}
                >
                  <span className="w-24 text-shade/45">{invoice.date}</span>
                  <span className="flex-1 font-semibold text-shade">{invoice.plan}</span>
                  <span className="inline-flex rounded-full bg-forest/10 px-2 py-0.5 text-[9.5px] font-bold text-forest">
                    {invoice.status}
                  </span>
                  <span className="w-14 text-right font-semibold text-shade">{invoice.amount}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-shade/30">Sample invoices for demo purposes.</p>
          </section>

          <section id="integrations" className="scroll-mt-24 rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-bold text-shade">Integrations</h2>
            <p className="mt-1 text-[11.5px] text-shade/45">Connect the tools you already use.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { name: "Instagram", note: "Sync follower counts and DMs.", icon: "instagram" },
                { name: "TikTok", note: "Show your follower growth.", icon: "tiktok" },
                { name: "YouTube", note: "Embed your latest videos.", icon: "youtube" },
                { name: "Spotify", note: "Share playlists and podcast episodes.", icon: "spotify" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between gap-2 rounded-xl border border-shade/10 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-shade">{integration.name}</p>
                    <p className="truncate text-[10.5px] text-shade/40">{integration.note}</p>
                  </div>
                  <MockButton
                    title={`Connect ${integration.name}`}
                    message={`${integration.name} OAuth is mocked in this clone. In production, this would open the platform's authorization flow and store an access token.`}
                  >
                    Connect
                  </MockButton>
                </div>
              ))}
            </div>
          </section>

          <section id="danger" className="scroll-mt-24 rounded-3xl border border-[#c43333]/20 bg-white p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-[18px] font-bold text-shade">
              <Trash2 className="h-4 w-4 text-[#c43333]" /> Delete account
            </h2>
            <p className="mt-1 max-w-[560px] text-[11.5px] leading-relaxed text-shade/45">
              Permanently remove your Linktree, links, contacts and analytics. This action cannot be undone.
            </p>
            <div className="mt-3">
              <DeleteAccountForm />
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-[11px] text-shade/35">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Need help? Contact support.
            </span>
            <Link href="/" className="font-semibold text-grape hover:underline">
              Visit help center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
