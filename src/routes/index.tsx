import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { LogoMark } from "@/components/logo";
import { BeanspruchenLink, UnbeanspruchtBadge, WebsiteLink } from "@/components/unbeansprucht";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KANTONE } from "@/lib/anbieter";
import { sucheAnbieterUmkreis } from "@/lib/verzeichnis.functions";
import { formatiereOevZeit, useOevZeiten } from "@/lib/oev-client";
import { useTerminFilter } from "@/components/termin-filter";
import { GUTSCHEIN_CODE, GUTSCHEIN_TEXT, trackGutscheinKlick } from "@/lib/gutschein.functions";
import swissMap from "@/assets/swiss-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "vku-nothelferkurs.ch — VKU & Nothelferkurs in deiner Region" },
      {
        name: "description",
        content:
          "Neutrales Schweizer Verzeichnis für Verkehrskundeunterricht (VKU) und Nothelferkurse. Pflichtkurse vor der Theorieprüfung nach Kanton und Ort suchen — mit Preisen, Terminen und Bewertungen.",
      },
      { property: "og:title", content: "vku-nothelferkurs.ch — VKU & Nothelferkurs finden" },
      {
        property: "og:description",
        content:
          "Alle Pflichtkurse für Fahrschüler:innen vor der Theorieprüfung — durchsuchbar nach Kanton und Ort. Neutral, aktuell, kostenlos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type KursartFilter = "alle" | "vku" | "nothelferkurs";

const KURSART_FILTERS: Array<{ wert: KursartFilter; label: string }> = [
  { wert: "alle", label: "Alle" },
  { wert: "vku", label: "VKU" },
  { wert: "nothelferkurs", label: "Nothelferkurs" },
];

const KURSTYP_LABEL: Record<string, string> = {
  vku: "VKU",
  nothelferkurs: "Nothelferkurs",
  beide: "VKU + Nothelfer",
};

const RADIEN = [5, 10, 20, 50];

function useDebounced<T>(wert: T, ms: number) {
  const [debounced, setDebounced] = useState(wert);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(wert), ms);
    return () => clearTimeout(t);
  }, [wert, ms]);
  return debounced;
}

const QUICK_REGIONS = ["Zürich", "Bern", "Basel", "Luzern"];

const CHIP_STYLE = "bg-mint text-teal hover:bg-teal/15";

function Index() {
  const [query, setQuery] = useState("");
  const [kursart, setKursart] = useState<KursartFilter>("alle");
  const [radius, setRadius] = useState(20);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "laden" | "fehler">("idle");
  const termin = useTerminFilter();

  const gutscheinTracken = useServerFn(trackGutscheinKlick);
  const [gutscheinEmail, setGutscheinEmail] = useState("");
  const [gutscheinStatus, setGutscheinStatus] = useState<"idle" | "sende" | "ok" | "fehler">(
    "idle",
  );
  const [gutscheinKopiert, setGutscheinKopiert] = useState(false);

  const suche = useServerFn(sucheAnbieterUmkreis);
  const debouncedQuery = useDebounced(query.trim(), 350);

  const { data, isLoading } = useQuery({
    queryKey: ["umkreis", debouncedQuery, geo, radius, kursart, termin.fenster],
    queryFn: () =>
      suche({
        data: {
          ort: debouncedQuery || undefined,
          lat: geo?.lat,
          lng: geo?.lng,
          radiusKm: radius,
          kurstyp: kursart === "alle" ? undefined : kursart,
          terminVon: termin.fenster.von,
          terminBis: termin.fenster.bis,
        },
      }),
    placeholderData: (prev: unknown) => prev as never,
  });


  const erstesLaden = isLoading && !data;
  const results = data?.treffer ?? [];
  const kantonAnzahl = new Set(results.map((a) => a.kanton).filter(Boolean)).size;
  const punkt = data?.punkt ?? null;
  const ausserhalbRadius = data?.ausserhalbRadius ?? false;
  const oevZeiten = useOevZeiten(
    punkt,
    results.map((a) => ({ id: a.id, lat: a.lat ?? null, lng: a.lng ?? null })),
  );

  const gutscheinSichern = async (event: React.FormEvent) => {
    event.preventDefault();
    const wert = gutscheinEmail.trim();
    if (!wert) return;
    setGutscheinStatus("sende");
    try {
      const res = await gutscheinTracken({ data: { email: wert } });
      setGutscheinStatus(res.ok ? "ok" : "fehler");
    } catch {
      setGutscheinStatus("fehler");
    }
  };

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
        document.getElementById("anbieter")?.scrollIntoView({ behavior: "smooth" });
      },
      () => setGeoStatus("fehler"),
      { timeout: 10000 },
    );
  };

  const headingRegion = punkt
    ? `${punkt.label} (${radius} km)`
    : query.trim().length > 0
      ? `«${query.trim()}»`
      : "der ganzen Schweiz";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="size-10" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold">vku-nothelferkurs.ch</div>
              <div className="text-[11px] font-medium text-muted-foreground">
                Der neutrale Kursführer
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
            <button
              onClick={() => {
                setKursart("vku");
                document.getElementById("anbieter")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="transition-colors hover:text-coral"
            >
              VKU
            </button>
            <button
              onClick={() => {
                setKursart("nothelferkurs");
                document.getElementById("anbieter")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="transition-colors hover:text-coral"
            >
              Nothelferkurs
            </button>
            <Link to="/kombi-planer" className="transition-colors hover:text-coral">
              Kombi-Planer
            </Link>
            <a href="#anbieter" className="transition-colors hover:text-coral">
              Anbieter
            </a>
          </nav>
          <Link
            to="/fahrschulen-partner"
            className="rounded-full bg-card px-5 py-2.5 font-display text-sm font-semibold text-foreground shadow-[0_6px_16px_-8px_rgba(51,43,56,0.4)] transition-transform hover:-translate-y-0.5"
          >
            Anbieter eintragen
          </Link>
        </header>

        {/* Hero + Search */}
        <section className="grid items-center gap-10 pb-14 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-1.5 font-display text-xs font-bold tracking-wide text-teal">
              <span className="size-2 rounded-full bg-teal"></span> Neutrales Verzeichnis · Schweiz
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Find deinen{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-coral">VKU- &amp; Nothelferkurs</span>
                <span className="absolute inset-x-0 bottom-1.5 -z-0 h-4 rounded-full bg-sun/60"></span>
              </span>{" "}
              in deiner Region.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Alle Pflichtkurse für Fahrschüler:innen vor der Theorieprüfung — durchsuchbar nach
              Kanton und Ort. Neutral, aktuell, kostenlos.
            </p>

            <div className="mt-7 rounded-[28px] bg-card p-3 shadow-[0_24px_50px_-24px_rgba(51,43,56,0.45)]">
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
                  title="Aktuellen Standort per Browser abfragen"
                  className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3.5 font-display text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60 ${
                    geo
                      ? "bg-mint text-teal"
                      : "bg-background text-teal shadow-[inset_0_0_0_2px_hsl(var(--mint,180_50%_90%))] hover:bg-mint"
                  }`}
                >
                  {geoStatus === "laden"
                    ? "Ortung …"
                    : geo
                      ? "📍 Standort aktiv"
                      : "🧭 Standort verwenden"}
                </button>
                <button
                  onClick={() =>
                    document.getElementById("anbieter")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="rounded-2xl bg-coral px-7 py-3.5 font-display text-base font-semibold text-primary-foreground shadow-[0_10px_22px_-8px_rgba(255,107,138,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  Suchen
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
              <div className="mt-3 flex flex-wrap gap-2 px-1">
                {QUICK_REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setQuery(region)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${CHIP_STYLE}`}
                  >
                    {region}
                  </button>
                ))}
              </div>

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
                  className="mt-2 w-full accent-[hsl(var(--coral,0_0%_0%))] [accent-color:#FF6B8A]"
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
          </div>

          {/* Map card */}
          <div className="relative">
            <div className="rounded-[32px] bg-card p-3 shadow-[0_28px_56px_-26px_rgba(51,43,56,0.4)]">
              <img
                src={swissMap}
                alt="Stilisierte Schweizer Karte mit Kursregionen"
                width={1024}
                height={900}
                className="aspect-[16/13] w-full rounded-[24px] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[0_16px_36px_-16px_rgba(51,43,56,0.5)]">
              <div className="grid size-9 place-items-center rounded-full bg-mint font-display text-sm font-bold text-teal">
                {erstesLaden ? "…" : results.length}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">Kursorte</div>
                <div className="text-[11px] text-muted-foreground">
                  {erstesLaden
                    ? "wird geladen …"
                    : `in ${kantonAnzahl} ${kantonAnzahl === 1 ? "Kanton" : "Kantonen"}`}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Providers */}
        <section id="anbieter" className="scroll-mt-6 pb-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Verfügbare Kurse in <span className="text-coral">{headingRegion}</span>
            </h2>
            <span className="text-sm font-semibold text-teal">
              {erstesLaden ? "Suche läuft …" : `${results.length} Anbieter gefunden`}
              {!erstesLaden && punkt ? ` · sortiert nach Distanz zu ${punkt.label}` : ""}
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {KURSART_FILTERS.map((f) => (
              <button
                key={f.wert}
                onClick={() => setKursart(f.wert)}
                className={`rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors ${
                  kursart === f.wert
                    ? "bg-foreground text-primary-foreground"
                    : "bg-card text-muted-foreground shadow-[0_6px_16px_-10px_rgba(51,43,56,0.4)] hover:text-coral"
                }`}
              >
                {f.label}
              </button>
            ))}
            {(query || kursart !== "alle" || geo || termin.option !== "jederzeit") && (
              <button
                onClick={() => {
                  setQuery("");
                  setKursart("alle");
                  setGeo(null);
                  termin.setOption("jederzeit");
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-coral transition-colors hover:text-foreground"
              >
                Zurücksetzen ✕
              </button>
            )}
          </div>

          {ausserhalbRadius && results.length > 0 ? (
            <div className="mb-5 rounded-2xl bg-sun/25 px-5 py-4 text-sm font-medium text-foreground">
              Im Umkreis von {radius} km gibt es noch keine Anbieter — hier sind die nächstgelegenen
              Treffer ausserhalb des Radius.
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-[28px] bg-card p-10 text-center shadow-[0_18px_40px_-24px_rgba(51,43,56,0.4)]">
              <p className="font-display text-xl font-bold">Suche läuft …</p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-[28px] bg-card p-10 text-center shadow-[0_18px_40px_-24px_rgba(51,43,56,0.4)]">
              <p className="font-display text-xl font-bold">Keine Anbieter gefunden</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Versuche es mit einer anderen PLZ oder einem anderen Ort — oder setze die Filter
                zurück.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <article
                  key={a.id}
                  className="rounded-[26px] bg-card p-6 shadow-[0_18px_40px_-24px_rgba(51,43,56,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(255,107,138,0.5)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 font-display text-xs font-bold tracking-wide ${
                        a.kurstyp === "beide"
                          ? "bg-lav/25 text-foreground"
                          : a.kurstyp === "vku"
                            ? "bg-bubble text-coral"
                            : "bg-mint text-teal"
                      }`}
                    >
                      {KURSTYP_LABEL[a.kurstyp]}
                    </span>
                    {a.distanz_km != null ? (
                      <span className="flex flex-col items-end gap-1 text-right">
                        <span className="whitespace-nowrap rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-teal">
                          {a.distanz_km.toFixed(1)} km entfernt
                        </span>
                        {oevZeiten[a.id] ? (
                          <span className="whitespace-nowrap text-[11px] font-semibold text-muted-foreground">
                            🚈 {formatiereOevZeit(oevZeiten[a.id]!.minuten)}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-snug">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.plz} {a.ort} · {a.kanton}
                  </p>
                  {a.beansprucht ? (
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      Sprachen:{" "}
                      <span className="font-bold text-foreground">{a.sprache.join(", ")}</span>
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {a.naechster_termin ? (
                      <>
                        Nächster Kursbeginn:{" "}
                        <span className="font-bold text-foreground">
                          {new Date(a.naechster_termin).toLocaleDateString("de-CH", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    ) : a.termine_url || a.website_url ? (
                      <a
                        href={(a.termine_url ?? a.website_url)!}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-semibold text-teal underline"
                      >
                        Termine auf der Anbieter-Website
                      </a>
                    ) : (
                      "Termine auf Anfrage"
                    )}
                  </p>

                  {a.beansprucht ? null : (
                    <div className="mt-3">
                      <UnbeanspruchtBadge klein />
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                    <span className="font-display text-lg font-bold text-coral">
                      {a.preis_chf != null ? `CHF ${a.preis_chf}` : "Preis auf Anfrage"}
                    </span>
                    {a.beansprucht ? (
                      <Link
                        to="/anbieter/$slug"
                        params={{ slug: a.slug }}
                        className="rounded-full bg-foreground px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral"
                      >
                        Ansehen
                      </Link>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <WebsiteLink url={a.website_url} klein />
                        <BeanspruchenLink anbieter={a} klein />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Gutschein-Banner */}
        <section className="pb-20">
          <div className="rounded-[32px] bg-mint p-8 sm:p-10">
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                  Gratis Gutschein für deine Theorieprüfung 🎁
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{GUTSCHEIN_TEXT}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-2xl bg-card px-5 py-3 font-display text-2xl font-bold tracking-widest text-teal">
                    {GUTSCHEIN_CODE}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(GUTSCHEIN_CODE);
                      setGutscheinKopiert(true);
                    }}
                    className="rounded-full bg-card px-4 py-2 font-display text-sm font-semibold text-foreground"
                  >
                    {gutscheinKopiert ? "Kopiert ✓" : "Code kopieren"}
                  </button>
                  <a
                    href="https://onlinedrivecoach.ch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-foreground px-4 py-2 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral"
                  >
                    Zu onlinedrivecoach.ch
                  </a>
                </div>
              </div>

              <form
                onSubmit={gutscheinSichern}
                className="rounded-[24px] bg-card p-5 shadow-[0_18px_40px_-24px_rgba(51,43,56,0.4)]"
              >
                <label htmlFor="gutschein-email-home" className="text-sm font-semibold">
                  Optional: Code per E-Mail sichern
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Freiwillig — der Code oben gilt auch ohne E-Mail.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="gutschein-email-home"
                    type="email"
                    value={gutscheinEmail}
                    onChange={(e) => setGutscheinEmail(e.target.value)}
                    placeholder="name@beispiel.ch"
                    className="flex-1 rounded-2xl bg-background/70 px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/70 focus:bg-background"
                  />
                  <button
                    type="submit"
                    disabled={gutscheinStatus === "sende"}
                    className="rounded-full bg-teal px-4 py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {gutscheinStatus === "sende" ? "…" : "Sichern"}
                  </button>
                </div>
                {gutscheinStatus === "ok" ? (
                  <p className="mt-2 text-xs font-medium text-teal">
                    Gespeichert — wir schicken dir den Code an {gutscheinEmail.trim()}.
                  </p>
                ) : null}
                {gutscheinStatus === "fehler" ? (
                  <p className="mt-2 text-xs font-medium text-coral">
                    Das hat nicht geklappt. Der Code oben bleibt gültig.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </section>

        {/* Regions strip */}
        <section className="pb-20">
          <div className="rounded-[32px] bg-card p-8 shadow-[0_24px_50px_-28px_rgba(51,43,56,0.45)] sm:p-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold">Nach Region stöbern</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {KANTONE.length} Regionen · laufend aktualisiert
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {KANTONE.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setQuery(k);
                    document.getElementById("anbieter")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`rounded-full px-4 py-2.5 font-display text-sm font-semibold transition-colors ${CHIP_STYLE}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Was ist der VKU? */}
        <section className="pb-20">
          <div className="rounded-[32px] bg-mint p-8 sm:p-10">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Was ist der VKU — und was der Nothelferkurs?</h2>
            <div className="mt-4 grid gap-6 text-[15px] leading-relaxed text-foreground/80 md:grid-cols-2">
              <p>
                Der Verkehrskundeunterricht (VKU) ist in der Schweiz obligatorisch, bevor du zur
                praktischen Fahrprüfung zugelassen wirst. Er umfasst 8 Lektionen zu Themen wie
                Verkehrsumgebung, Fahrzeugtechnik und ökologischem Fahren.
              </p>
              <p>
                Der Nothelferkurs dauert 10 Stunden und vermittelt die Grundlagen der Ersten Hilfe.
                Er ist Voraussetzung für das Lernfahrausweis-Gesuch — beide Kurse findest du hier in
                deiner Region.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                VKU: 8 Lektionen
              </span>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                Nothelferkurs: 10 Stunden
              </span>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                Keine Vorkenntnisse nötig
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-border pb-10 pt-8 text-sm text-muted-foreground sm:flex-row">
          <div className="font-display font-bold text-foreground">vku-nothelferkurs.ch</div>
          <div className="flex gap-6">
            <Link to="/impressum" className="transition-colors hover:text-coral">
              Impressum
            </Link>
            <Link to="/datenschutz" className="transition-colors hover:text-coral">
              Datenschutz
            </Link>
            <a
              href="mailto:hallo@vku-nothelferkurs.ch"
              className="transition-colors hover:text-coral"
            >
              Kontakt
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
