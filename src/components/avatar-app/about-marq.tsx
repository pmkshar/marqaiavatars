'use client';

import { useState } from 'react';
import { Building2, X, ExternalLink, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { COMPANY } from '@/lib/company';

/**
 * AboutMARQ — a modal dialog that shows detailed information about
 * MARQ AI Tech Pvt Ltd: mission, vision, products, services, values,
 * upcoming releases, group companies, stats, and contact details.
 */
export function AboutMARQ() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
      >
        <Building2 className="h-3 w-3" />
        About
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close about dialog"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with logo */}
            <div className="flex items-center gap-3 pb-4">
              <img
                src="/marq-logo.png"
                alt="MARQ AI Tech logo"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{COMPANY.legalName}</h2>
                <p className="text-xs text-muted-foreground">{COMPANY.tagline}</p>
              </div>
            </div>

            {/* About */}
            <Section title="About Us">
              <p className="text-sm leading-relaxed text-foreground/90">{COMPANY.about}</p>
            </Section>

            {/* Stats */}
            {COMPANY.stats.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {COMPANY.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-border/70 bg-muted/30 p-2 text-center"
                  >
                    <div className="text-base font-bold text-primary">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Mission & Vision */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Section title="Mission">
                <p className="text-sm leading-relaxed text-foreground/90">{COMPANY.mission}</p>
              </Section>
              <Section title="Vision">
                <p className="text-sm leading-relaxed text-foreground/90">{COMPANY.vision}</p>
              </Section>
            </div>

            {/* Products */}
            <Section title="Our Products">
              <div className="grid gap-2">
                {COMPANY.products.map((p) => (
                  <div
                    key={p.name}
                    className="rounded-lg border border-border/70 bg-muted/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {p.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      {p.url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </Section>

            {/* Upcoming Products */}
            {COMPANY.upcomingProducts.length > 0 && (
              <Section title="Coming Soon">
                <div className="grid gap-2">
                  {COMPANY.upcomingProducts.map((p) => (
                    <div
                      key={p.name}
                      className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {p.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        {p.url.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Group Companies */}
            {COMPANY.groupCompanies.length > 0 && (
              <Section title="Group Companies">
                <div className="grid gap-2 sm:grid-cols-2">
                  {COMPANY.groupCompanies.map((g) => (
                    <a
                      key={g.name}
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border/70 bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="text-sm font-semibold">{g.name}</div>
                      <div className="text-[10px] text-muted-foreground">{g.division}</div>
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Values */}
            <Section title="Our Values">
              <ul className="space-y-1.5">
                {COMPANY.values.map((v) => (
                  <li key={v} className="flex items-start gap-2 text-xs text-foreground/90">
                    <span className="mt-0.5 text-primary">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Contact */}
            <Section title="Contact & Links">
              <div className="space-y-1.5 text-xs">
                <a
                  href={COMPANY.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {COMPANY.contact.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`mailto:${COMPANY.contact.email}`}
                  className="flex items-center gap-2 text-foreground/90 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {COMPANY.contact.email}
                </a>
                <p className="flex items-center gap-2 text-foreground/90">
                  <Phone className="h-3.5 w-3.5" />
                  {COMPANY.contact.phone}
                </p>
                <p className="flex items-center gap-2 text-foreground/90">
                  <MapPin className="h-3.5 w-3.5" />
                  {COMPANY.headquarters} · Founded {COMPANY.founded}
                </p>
              </div>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
