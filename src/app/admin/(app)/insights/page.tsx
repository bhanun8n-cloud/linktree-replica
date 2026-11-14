export const instant = false;

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Download, ExternalLink, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { BarChart } from "@/components/admin/BarChart";
import { ButtonLink } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getAnalytics, getCountries, getReferrers, getTopLinks } from "@/lib/data";

export const metadata = { title: "Insights" };

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
];

const COUNTRIES: Record<string, { name: string; flag: string }> = {
  IN: { name: "India", flag: "🇮🇳" },
  US: { name: "United States", flag: "🇺🇸" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  AU: { name: "Australia", flag: "🇦🇺" },
};

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function referrerLabel(value: string) {
  if (value === "direct") return "Direct";
  return value.replace(/^www\./, "").replace(/\.com$/, "").replace(/^\w/, (char) => char.toUpperCase());
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const requested = Number(params.range);
  const days = RANGES.some((range) => range.days === requested) ? requested : 7;

  const analytics = getAnalytics(user.id, days);
  const topLinks = getTopLinks(user.id, days).filter((link) => link.clicks > 0);
  const referrers = getReferrers(user.id, days);
  const countries = getCountries(user.id, days);
  const totalRef = referrers.reduce((sum, row) => sum + row.count, 0);
  const maxLinkClicks = topLinks[0]?.clicks ?? 1;
  const viewsDelta = pctChange(analytics.views, analytics.prevViews);
  const clicksDelta = pctChange(analytics.clicks, analytics.prevClicks);

  const stats = [
    {
      label: "Profile views",
      value: analytics.views.toLocaleString(),
      delta: viewsDelta,
      icon: Users,
      note: "vs previous period",
    },
    {
      label: "Link clicks",
      value: analytics.clicks.toLocaleString(),
      delta: clicksDelta,
      icon: MousePointerClick,
      note: "vs previous period",
    },
    {
      label: "Click-through rate",
      value: `${analytics.ctr}%`,
      delta: null,
      icon: TrendingUp,
      note: "clicks ÷ views",
    },
    {
      label: "Top source",
      value: referrers[0] ? referrerLabel(referrers[0].referrer) : "—",
      delta: null,
      icon: ExternalLink,
      note: referrers[0] ? `${Math.round((referrers[0].count / Math.max(totalRef, 1)) * 100)}% of traffic` : "No traffic yet",
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/40">Insights</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            What&apos;s working
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/45">
            Track views, clicks and traffic for linktr.ee/{user.username}.
          </p>
        </div>
        <ButtonLink href={`/api/analytics/export?range=${days}`} external variant="outline" size="sm">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </ButtonLink>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-shade/10 bg-white p-1">
          {RANGES.map((range) => (
            <Link
              key={range.days}
              href={`/admin/insights?range=${range.days}`}
              aria-current={days === range.days ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition ${
                days === range.days ? "bg-shade text-white" : "text-shade/50 hover:text-shade"
              }`}
            >
              {range.label}
            </Link>
          ))}
        </div>
        <span className="rounded-full bg-chartreuse/40 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-forest">
          Updated just now
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon, note }) => (
          <div key={label} className="rounded-2xl border border-shade/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-shade/40">
                <Icon className="h-3.5 w-3.5" /> {label}
              </span>
              {delta !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    delta >= 0 ? "bg-forest/10 text-forest" : "bg-[#c43333]/10 text-[#c43333]"
                  }`}
                >
                  {delta >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {delta >= 0 ? "+" : ""}
                  {delta}%
                </span>
              ) : null}
            </div>
            <p className="tabular mt-2 truncate font-display text-[27px] font-extrabold leading-none tracking-tight text-shade">
              {value}
            </p>
            <p className="mt-1.5 text-[10.5px] text-shade/35">{note}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-bold text-shade">Views & clicks</h2>
            <p className="text-[11.5px] text-shade/40">Last {days} days</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-[11px] text-shade/40">
              <span className="tabular mr-1 font-display text-[18px] font-extrabold text-shade">{analytics.views}</span>
              views
            </span>
            <span className="text-[11px] text-shade/40">
              <span className="tabular mr-1 font-display text-[18px] font-extrabold text-shade">{analytics.clicks}</span>
              clicks
            </span>
          </div>
        </div>
        <div className="mt-6">
          <BarChart points={analytics.points} height={220} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-bold text-shade">Top links</h2>
              <p className="text-[11.5px] text-shade/40">Ranked by clicks</p>
            </div>
            <Link href="/admin/links" className="text-[11.5px] font-semibold text-grape hover:underline">
              Edit links
            </Link>
          </div>

          {topLinks.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-shade/15 px-4 py-8 text-center text-[12px] text-shade/45">
              No clicks in this period. Share your page to get started.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {topLinks.map((link, index) => (
                <li key={link.id}>
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="w-4 text-[10px] font-bold text-shade/30">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-shade">{link.title}</span>
                    <span className="tabular font-bold text-shade/55">{link.clicks}</span>
                  </div>
                  <div className="ml-6 mt-1.5 h-1.5 overflow-hidden rounded-full bg-chalk">
                    <div
                      className="h-full rounded-full bg-grape"
                      style={{ width: `${Math.max((link.clicks / maxLinkClicks) * 100, 3)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
          <h2 className="text-[14px] font-bold text-shade">Traffic sources</h2>
          <p className="text-[11.5px] text-shade/40">Where visitors come from</p>
          <ul className="mt-4 space-y-3.5">
            {referrers.map((row) => {
              const pct = Math.round((row.count / Math.max(totalRef, 1)) * 100);
              return (
                <li key={row.referrer}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-shade/70">{referrerLabel(row.referrer)}</span>
                    <span className="tabular text-[11px] text-shade/40">
                      {row.count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-chalk">
                    <div className="h-full rounded-full bg-cobalt" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </li>
              );
            })}
            {referrers.length === 0 ? <li className="text-[12px] text-shade/40">No traffic yet.</li> : null}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
        <h2 className="text-[14px] font-bold text-shade">Top locations</h2>
        <p className="text-[11.5px] text-shade/40">Countries in the last {days} days</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((row) => {
            const meta = COUNTRIES[row.country] ?? { name: row.country, flag: "🌐" };
            return (
              <div key={row.country} className="flex items-center gap-3 rounded-xl bg-chalk/60 px-3 py-2.5">
                <span className="text-lg">{meta.flag}</span>
                <span className="flex-1 text-[12px] font-semibold text-shade">{meta.name}</span>
                <span className="tabular text-[11.5px] font-bold text-shade/50">{row.count}</span>
              </div>
            );
          })}
          {countries.length === 0 ? <p className="text-[12px] text-shade/40">No location data yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
