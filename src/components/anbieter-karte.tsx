import { Link } from "@tanstack/react-router";
import { preisAnzeige } from "@/lib/anbieter";

export interface AnbieterKarteDaten {
  slug: string;
  name: string;
  ort: string | null;
  plz: string | null;
  kanton: string | null;
  kurstyp: string;
  preis_chf: number | null;
  preis_nothelferkurs_chf?: number | null;
  termine_url: string | null;
}

const KURSTYP_LABEL: Record<string, string> = {
  vku: "VKU",
  nothelferkurs: "Nothelferkurs",
  beide: "VKU + Nothelferkurs",
};

export function AnbieterKarte({ anbieter }: { anbieter: AnbieterKarteDaten }) {
  return (
    <article className="rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">{anbieter.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {[anbieter.plz, anbieter.ort].filter(Boolean).join(" ")}
            {anbieter.kanton ? ` · ${anbieter.kanton}` : ""}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-mint px-3 py-1 font-display text-xs font-bold text-teal">
          {KURSTYP_LABEL[anbieter.kurstyp] ?? anbieter.kurstyp}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-display text-sm font-semibold">
          {preisAnzeige(anbieter) ?? "Preis auf Anfrage"}
        </span>
        <Link
          to="/anbieter/$slug"
          params={{ slug: anbieter.slug }}
          className="rounded-full bg-coral px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Details ansehen
        </Link>
      </div>
    </article>
  );
}

export function LeereListe({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
      {text}
    </div>
  );
}
