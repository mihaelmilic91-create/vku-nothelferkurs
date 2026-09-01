import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { getAnbieterBySlug } from "@/lib/verzeichnis.functions";
import { GutscheinModal } from "@/components/gutschein-modal";
import { BeanspruchenLink, UnbeanspruchtBadge, WebsiteLink } from "@/components/unbeansprucht";
import { preisAnzeige } from "@/lib/anbieter";

const KURSTYP_LABEL: Record<string, string> = {
  vku: "VKU",
  nothelferkurs: "Nothelferkurs",
  beide: "VKU + Nothelferkurs",
};

export const Route = createFileRoute("/anbieter/$slug")({
  loader: async ({ params }) => {
    const anbieter = await getAnbieterBySlug({ data: { slug: params.slug } });
    if (!anbieter) throw notFound();
    return anbieter;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Anbieter nicht gefunden" }, { name: "robots", content: "noindex" }],
      };
    }
    const ort = [loaderData.plz, loaderData.ort].filter(Boolean).join(" ");
    const title = `${loaderData.name} — VKU & Nothelferkurs in ${loaderData.ort ?? "der Schweiz"}`;
    const description = `${loaderData.name}${ort ? `, ${ort}` : ""}: Kursangebot, Preis und Kontaktangaben im neutralen Verzeichnis.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: AnbieterDetail,
  errorComponent: () => <SiteShell>Anbieter konnte nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Dieser Anbieter existiert nicht.</SiteShell>,
});

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function AnbieterDetail() {
  const a = Route.useLoaderData();
  const [von, setVon] = useState("");
  const [gutscheinOffen, setGutscheinOffen] = useState(false);

  const ziel =
    [a.adresse, [a.plz, a.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ") || a.name;
  const start = von.trim();
  const sbbUrl = `https://fahrplan.sbb.ch/bin/query.exe/dn?start=1&S=${encodeURIComponent(
    start || "",
  )}&Z=${encodeURIComponent(ziel)}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ziel)}${
    start ? `&origin=${encodeURIComponent(start)}` : ""
  }&travelmode=driving`;

  return (
    <SiteShell>
      <PageHeader
        eyebrow={KURSTYP_LABEL[a.kurstyp] ?? a.kurstyp}
        title={a.name}
        lead={
          a.beansprucht
            ? [a.adresse, [a.plz, a.ort].filter(Boolean).join(" ")].filter(Boolean).join(", ")
            : [[a.plz, a.ort].filter(Boolean).join(" "), a.kanton].filter(Boolean).join(" · ")
        }
      />
      {a.beansprucht ? (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setGutscheinOffen(true)}
              className="rounded-full bg-coral px-6 py-3 font-display text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Kontakt aufnehmen / anmelden
            </button>
            <span className="text-sm text-muted-foreground">
              Inkl. Rabattcode für deine Theorie-Vorbereitung.
            </span>
          </div>
          <GutscheinModal
            offen={gutscheinOffen}
            onClose={() => setGutscheinOffen(false)}
            anbieterId={a.id}
            anbieterName={a.name}
            kontaktHref={
              a.termine_url ??
              a.website_url ??
              (a.kontakt_email ? `mailto:${a.kontakt_email}` : null)
            }
          />
        </>
      ) : (
        <div className="mb-6 rounded-3xl bg-muted p-6">
          <div className="flex flex-wrap items-center gap-3">
            <UnbeanspruchtBadge />
            <p className="text-sm text-muted-foreground">
              Recherchierter Eintrag — dieser Anbieter ist (noch) kein Partner von uns. Wir zeigen
              deshalb keine Kontaktdaten.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <WebsiteLink url={a.website_url} />
            <BeanspruchenLink anbieter={a} />
          </div>
        </div>
      )}
      {a.beansprucht ? (
        <div className="mb-6 rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
          <h2 className="font-display text-lg font-bold">Anreise</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gib deinen Startort an, damit die Route direkt vorausgefüllt ist.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={von}
              onChange={(e) => setVon(e.target.value)}
              placeholder="Startort — z. B. 8005 Zürich"
              className="flex-1 rounded-2xl bg-muted px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/70"
            />
            <div className="flex flex-wrap gap-2">
              <a
                href={sbbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-foreground px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-coral"
              >
                🚈 Verbindung anzeigen
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-mint px-4 py-2.5 font-display text-sm font-semibold text-teal transition-transform hover:-translate-y-0.5"
              >
                🚗 Route mit Auto
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 pb-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
          <h2 className="font-display text-lg font-bold">Angaben</h2>
          <div className="mt-3">
            <Zeile label="Kursart">{KURSTYP_LABEL[a.kurstyp] ?? a.kurstyp}</Zeile>
            <Zeile label="Kanton">{a.kanton ?? "—"}</Zeile>
            <Zeile label="Preis">
              {preisAnzeige(a) ?? "auf Anfrage"}
            </Zeile>
            {a.beansprucht ? (
              <>
                <Zeile label="Kurssprachen">{(a.sprache ?? []).join(", ") || "—"}</Zeile>
                <Zeile label="E-Mail">{a.kontakt_email ?? "—"}</Zeile>
                <Zeile label="Telefon">{a.kontakt_telefon ?? "—"}</Zeile>
              </>
            ) : null}
            <Zeile label="Website">
              {a.website_url ? (
                <a
                  href={a.website_url}
                  className="text-coral"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {a.website_url}
                </a>
              ) : (
                "—"
              )}
            </Zeile>
            {a.beansprucht ? (
              <Zeile label="Termine beim Anbieter">
                {a.termine_url ? (
                  <a
                    href={a.termine_url}
                    className="text-coral"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Termine ansehen
                  </a>
                ) : (
                  "—"
                )}
              </Zeile>
            ) : null}
          </div>
        </div>

        {a.beansprucht ? (
          <div className="rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
            <h2 className="font-display text-lg font-bold">Nächste Kursdaten</h2>
            {a.termine.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Noch keine strukturierten Kursdaten erfasst.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {a.termine.map((t) => (
                  <li key={t.id} className="flex justify-between rounded-2xl bg-muted px-4 py-2">
                    <span className="font-medium">
                      {new Date(t.kursbeginn).toLocaleDateString("de-CH", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {t.plaetze_frei != null ? `${t.plaetze_frei} Plätze frei` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </SiteShell>
  );
}
