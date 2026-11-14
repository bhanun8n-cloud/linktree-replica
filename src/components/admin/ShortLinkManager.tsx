"use client";

import { Check, Copy, ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { createShortLinkAction, deleteShortLinkAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import type { ShortLink } from "@/lib/types";

export function ShortLinkManager({ shortLinks }: { shortLinks: ShortLink[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/s/${code}`);
      setCopied(code);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-shade/10 bg-white p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-shade">
          <Link2 className="h-4 w-4 text-grape" /> Create a short link
        </h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-shade/45">
          Turn a long URL into a clean, trackable link you can share anywhere.
        </p>
        <form
          action={async (formData) => {
            await createShortLinkAction(formData);
          }}
          className="mt-4 space-y-3"
        >
          <Field label="Destination URL" htmlFor="short-target">
            <Input id="short-target" name="target" placeholder="https://example.com/very/long/link" required />
          </Field>
          <Field label="Custom code" htmlFor="short-code" hint="Letters, numbers, dashes. Leave blank to auto-generate.">
            <div className="flex items-center overflow-hidden rounded-xl border border-shade/15 bg-white focus-within:border-shade/40">
              <span className="border-r border-shade/10 px-2.5 text-[12px] text-shade/35">/s/</span>
              <input
                id="short-code"
                name="code"
                placeholder="creator-kit"
                className="h-11 w-full bg-transparent px-3 text-[14px] text-shade outline-none placeholder:text-shade/25"
              />
            </div>
          </Field>
          <Button type="submit" variant="primary" size="md" className="w-full">
            <Plus className="h-4 w-4" /> Create short link
          </Button>
        </form>
        <p className="mt-3 text-[10.5px] leading-relaxed text-shade/30">
          Short links redirect through this app and count clicks automatically.
        </p>
      </section>

      <section>
        {shortLinks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-shade/20 bg-white px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-chartreuse/40 text-forest">
              <Link2 className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-[18px] font-bold text-shade">No short links yet</h2>
            <p className="mt-1 text-[12.5px] text-shade/45">Create one on the left and it will show up here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shortLinks.map((link) => (
              <li key={link.id} className="rounded-2xl border border-shade/10 bg-white p-3.5">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-chartreuse/35 text-forest">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-shade">/s/{link.code}</p>
                    <p className="mt-0.5 truncate text-[11px] text-shade/55">{link.target}</p>
                    <p className="mt-1.5 text-[10.5px] font-semibold text-shade/60">
                      {link.clicks} click{link.clicks === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-none items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copy(link.code)}
                      className={`grid h-8 w-8 place-items-center rounded-full transition ${
                        copied === link.code ? "bg-forest/10 text-forest" : "text-shade/50 hover:bg-chalk hover:text-shade"
                      }`}
                      aria-label="Copy short link"
                    >
                      {copied === link.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={`/s/${link.code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full text-shade/50 transition hover:bg-chalk hover:text-shade"
                      aria-label="Open short link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <form
                      action={deleteShortLinkAction}
                      onSubmit={(event) => {
                        if (!window.confirm(`Delete /s/${link.code}?`)) event.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={link.id} />
                      <button
                        type="submit"
                        className="grid h-8 w-8 place-items-center rounded-full text-shade/30 transition hover:bg-[#c43333]/10 hover:text-[#c43333]"
                        aria-label="Delete short link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
