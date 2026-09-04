import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo";

const NAV = [
  { to: "/vku", label: "VKU" },
  { to: "/nothelferkurs", label: "Nothelferkurs" },
  { to: "/kombi-planer", label: "Kombi-Planer" },
  { to: "/kombiangebote", label: "Kombiangebote" },
  { to: "/ratgeber", label: "Ratgeber" },
] as const;

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-6">
      <Link to="/" className="flex items-center gap-2.5">
        <LogoMark className="size-10" />
        <div className="leading-tight">
          <div className="font-display text-lg font-bold">vku-nothelferkurs.ch</div>
          <div className="text-[11px] font-medium text-muted-foreground">
            Der neutrale Kursführer
          </div>
        </div>
      </Link>
      <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-muted-foreground">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "text-coral" }}
            className="transition-colors hover:text-coral"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/auth" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-coral">
          Login
        </Link>
        <Link
          to="/fahrschulen-partner"
          className="rounded-full bg-card px-5 py-2.5 font-display text-sm font-semibold text-foreground shadow-[0_6px_16px_-8px_rgba(51,43,56,0.4)] transition-transform hover:-translate-y-0.5"
        >
          Für Kursanbieter
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border py-10 text-sm text-muted-foreground">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/ueber-uns" className="hover:text-coral">
          Über uns
        </Link>
        <Link to="/kontakt" className="hover:text-coral">
          Kontakt
        </Link>
        <Link to="/fahrschulen-partner" className="hover:text-coral">
          Anbieter-Partner
        </Link>
        <Link to="/auth" className="hover:text-coral">
          Anbieter-Login
        </Link>
        <Link to="/impressum" className="hover:text-coral">
          Impressum
        </Link>
        <Link to="/datenschutz" className="hover:text-coral">
          Datenschutz
        </Link>
      </div>
      <p className="mt-4 text-xs">
        © {new Date().getFullYear()} vku-nothelferkurs.ch — neutrales Verzeichnis für
        Pflichtkurse in der Schweiz.
      </p>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="py-8">
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-1.5 font-display text-xs font-bold tracking-wide text-teal">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {lead ? <p className="mt-3 max-w-2xl text-muted-foreground">{lead}</p> : null}
    </div>
  );
}
