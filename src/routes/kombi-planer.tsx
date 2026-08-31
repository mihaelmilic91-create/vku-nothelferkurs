import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BeanspruchenLink, UnbeanspruchtBadge, WebsiteLink } from "@/components/unbeansprucht";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { planeKombi } from "@/lib/verzeichnis.functions";
import { formatiereOevZeit, useOevZeiten } from "@/lib/oev-client";
import { useTerminFilter } from "@/components/termin-filter";
import { preisAnzeige } from "@/lib/anbieter";

export const Route = createFileRoute("/kombi-planer")({
  head: () => ({
    meta: [
      { title: "Kombi-Planer: VKU & Nothelferkurs schnell kombinieren" },
      {
        name: "description",
        content:
          "Plane beide Pflichtkurse in deiner Nähe: Kombianbieter mit VKU und Nothelferkurs an einem Ort — oder die beste Kombination aus zwei Anbietern im Umkreis.",
      },
      { property: "og:title", content: "Kombi-Planer für VKU & Nothelferkurs" },
      {
        property: "og:description",
        content:
          "Wie schaffe ich VKU und Nothelferkurs am schnellsten in meiner Nähe? Der neutrale Planer über alle Anbieter hinweg.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KombiPlaner,
  errorComponent: () => <SiteShell>Der Planer konnte nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Seite nicht gefunden.</SiteShell>,
});

const RADIEN = [5, 10, 20, 50];

function useDebounced<T>(wert: T, ms: number) {
  const [debounced, setDebounced] = useState(wert);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(wert), ms);
    return () => clearTimeout(t);
  }, [wert, ms]);
  return debounced;
}

type PlanerAnbieter = {
  id: string;
  slug: string;
  name: string;
  plz: string | null;
  ort: string | null;
  kanton: string | null;
  kurstyp: string;
  preis_chf: number | null;
  preis_nothelferkurs_chf: number | null;
  distanz_km: number | null;
  beansprucht: boolean;
  website_url: string | null;
  naechster_termin: string | null;
  lat?: number | null;
  lng?: number | null;
};

function datum(iso: string | null) {
  if (!iso) return "Termine auf Anfrage";
  const d = new Date(iso);
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" });
}

function PlanerKarte({
  a,
  badge,
  oevMinuten,
}: {
  a: PlanerAnbieter;
  badge: string;
  oevMinuten?: number | undefined;
}) {
  return (
    <article className="rounded-[26px] bg-card p-6 shadow-[0_18px_40px_-24px_rgba(51,43,56,0.4)] transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-lav/25 px-3 py-1.5 font-display text-xs font-bold tracking-wide text-foreground">
          {badge}
        </span>
        {a.distanz_km != null ? (
          <span className="flex flex-col items-end gap-1 text-right">
            <span className="whitespace-nowrap rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-teal">
              {a.distanz_km.toFixed(1)} km entfernt
            </span>
            {oevMinuten != null ? (
              <span className="whitespace-nowrap text-[11px] font-semibold text-muted-foreground">
                🚈 {formatiereOevZeit(oevMinuten)}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold leading-snug">{a.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {[a.plz, a.ort].filter(Boolean).join(" ")}
        {a.kanton ? ` · ${a.kanton}` : ""}
      </p>
      {a.beansprucht ? (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Nächster Termin:{" "}
          <span className="font-bold text-foreground">{datum(a.naechster_termin)}</span>
        </p>
      ) : null}
      {a.beansprucht ? null : (
        <div className="mt-3">
          <UnbeanspruchtBadge klein />
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <span className="font-display text-lg font-bold text-coral">
          {preisAnzeige(a) ?? "Preis auf Anfrage"}
        </span>
        {a.beansprucht ? (
          <Link
            to="/anbieter/$slug"
            params={{ slug: a.slug }}
            className="rounded-full bg-foreground px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral"
          >
            Profil ansehen
          </Link>
        ) : (
          <div className="flex flex-wrap gap-2">
            <WebsiteLink url={a.website_url} klein />
            <BeanspruchenLink anbieter={a} klein />
          </div>
        )}
      </div>
    </article>
  );
}

function KombiPlaner() {
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(20);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "laden" | "fehler">("idle");
  const termin = useTerminFilter();

  const plane = useServerFn(planeKombi);
  const debouncedQuery = useDebounced(query.trim(), 350);

  const { data, isLoading } = useQuery({
    queryKey: ["kombi-planer", debouncedQuery, geo, radius, termin.fenster],
    queryFn: () =>
      plane({
        data: {
          ort: debouncedQuery || undefined,
          lat: geo?.lat,
          lng: geo?.lng,
          radiusKm: radius,
          terminVon: termin.fenster.von,
          terminBis: termin.fenster.bis,
        },
      }),
    placeholderData: (prev: unknown) => prev as never,
  });


  const standortVerwenden = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("fehler");
      return;
    }
    setGeoStatus("laden");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setQuery("");
        setGeoStatus("idle");
      },
      () => setGeoStatus("fehler"),
      { timeout: 10000 },
    );
  };

  const punkt = data?.punkt ?? null;
  const kombi = (data?.kombi ?? []) as PlanerAnbieter[];
  const vku = (data?.getrennt.vku ?? null) as PlanerAnbieter | null;
  const nothelfer = (data?.getrennt.nothelferkurs ?? null) as PlanerAnbieter | null;

  const oevZeiten = useOevZeiten(
    punkt,
    [...kombi, vku, nothelfer]
      .filter((a): a is PlanerAnbieter => Boolean(a))
      .map((a) => ({ id: a.id, lat: a.lat ?? null, lng: a.lng ?? null })),
  );

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Beide Pflichtkurse planen"
        title="Kombi-Planer"
        lead="Wie schaffst du VKU und Nothelferkurs am schnellsten in deiner Nähe? Wir kombinieren neutral über alle Anbieter hinweg — an einem Ort oder aus zwei unterschiedlichen Anbietern."
      />

      <div className="rounded-[28px] bg-card p-3 shadow-[0_24px_50px_-24px_rgba(51,43,56,0.45)]">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
              📍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (geo) setGeo(null);
              }}
              placeholder="PLZ oder Ort"
              className="w-full min-w-0 rounded-2xl bg-background/70 py-3.5 pl-11 pr-4 text-base font-medium outline-none placeholder:text-muted-foreground/70 focus:bg-background"
            />
          </div>
          <button
            type="button"
            onClick={standortVerwenden}
            disabled={geoStatus === "laden"}
            className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3.5 font-display text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
              geo ? "bg-mint text-teal" : "bg-background text-teal hover:bg-mint"
            }`}
          >
            {geoStatus === "laden"
              ? "Ortung …"
              : geo
                ? "📍 Standort aktiv"
                : "🧭 Standort verwenden"}
          </button>
        </div>
        {geoStatus === "fehler" ? (
          <p className="mt-2 px-1 text-xs font-medium text-coral">
            Standort konnte nicht ermittelt werden — bitte PLZ oder Ort eingeben.
          </p>
        ) : null}
        {geo ? (
          <p className="mt-2 px-1 text-xs font-medium text-teal">
            Dein Standort wird verwendet.{" "}
            <button
              type="button"
              onClick={() => setGeo(null)}
              className="underline hover:text-foreground"
            >
              Zurücksetzen
            </button>
          </p>
        ) : null}

        <div className="mt-4 px-1 pb-1">
          <div className="flex items-center justify-between">
            <label htmlFor="radius" className="text-xs font-semibold text-muted-foreground">
              Umkreis
            </label>
            <span className="font-display text-sm font-bold text-teal">{radius} km</span>
          </div>
          <input
            id="radius"
            type="range"
            min={0}
            max={RADIEN.length - 1}
            step={1}
            value={RADIEN.indexOf(radius)}
            onChange={(e) => setRadius(RADIEN[Number(e.target.value)] ?? 20)}
            className="mt-2 w-full [accent-color:#FF6B8A]"
          />
          <div className="mt-1 flex justify-between text-[11px] font-medium text-muted-foreground">
            {RADIEN.map((r) => (
              <button key={r} type="button" onClick={() => setRadius(r)}>
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {punkt ? (
        <p className="mt-4 text-sm font-semibold text-teal">
          Ergebnisse rund um {punkt.label} · Umkreis {radius} km
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Gib eine PLZ oder einen Ort ein — oder nutze deinen Standort, um deine schnellste
          Kurs-Kombination zu sehen.
        </p>
      )}

      {isLoading ? (
        <div className="mt-8 rounded-[28px] bg-card p-10 text-center">
          <p className="font-display text-xl font-bold">Planung läuft …</p>
        </div>
      ) : (
        <>
          {/* Block 1 */}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">Alles an einem Ort</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Anbieter, die VKU und Nothelferkurs zusammen durchführen — die bequemste Variante.
            </p>
            {data?.kombiAusserhalbRadius && kombi.length > 0 ? (
              <div className="mt-4 rounded-2xl bg-sun/25 px-5 py-4 text-sm font-medium">
                Im Umkreis von {radius} km gibt es keinen Kombianbieter — hier sind die
                nächstgelegenen ausserhalb.
              </div>
            ) : null}
            {kombi.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Kein Kombianbieter gefunden — kombiniere unten zwei Anbieter.
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {kombi.map((a) => (
                  <PlanerKarte
                    key={a.id}
                    a={a}
                    badge="VKU + Nothelferkurs"
                    oevMinuten={oevZeiten[a.id]?.minuten}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Block 2 */}
          <section className="mt-12 pb-6">
            <h2 className="font-display text-2xl font-bold">Getrennt kombiniert</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Die beste Kombination aus zwei Anbietern in deiner Nähe — je einer für VKU und einer
              für den Nothelferkurs.
            </p>
            {!vku && !nothelfer ? (
              <div className="mt-4 rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                Noch keine passende Kombination gefunden — versuche einen grösseren Umkreis.
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {vku ? (
                  <PlanerKarte a={vku} badge="VKU" oevMinuten={oevZeiten[vku.id]?.minuten} />
                ) : (
                  <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    Kein separater VKU-Anbieter gefunden.
                  </div>
                )}
                {nothelfer ? (
                  <PlanerKarte
                    a={nothelfer}
                    badge="Nothelferkurs"
                    oevMinuten={oevZeiten[nothelfer.id]?.minuten}
                  />
                ) : (
                  <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    Kein separater Nothelferkurs-Anbieter gefunden.
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </SiteShell>
  );
}
