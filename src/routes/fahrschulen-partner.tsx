import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { listKantone, registriereAnbieter } from "@/lib/verzeichnis.functions";

export const Route = createFileRoute("/fahrschulen-partner")({
  loader: () => listKantone(),
  head: () => ({
    meta: [
      { title: "Für Fahrschulen: kostenlos ins Verzeichnis eintragen" },
      {
        name: "description",
        content:
          "Fahrschulen und Kursanbieter können sich kostenlos für das neutrale VKU- und Nothelferkurs-Verzeichnis anmelden.",
      },
      { property: "og:title", content: "Fahrschulen-Partner werden" },
      {
        property: "og:description",
        content: "Kostenloser Eintrag im neutralen Schweizer Kursverzeichnis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Partner,
  errorComponent: () => <SiteShell>Formular konnte nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Seite nicht gefunden.</SiteShell>,
});

const feldKlasse =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Partner() {
  const kantone = Route.useLoaderData();
  const registrieren = useServerFn(registriereAnbieter);
  const [status, setStatus] = useState<"idle" | "senden" | "ok" | "fehler">("idle");
  const [fehler, setFehler] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const preis = String(form.get("preis_chf") ?? "").trim();
    setStatus("senden");
    setFehler(null);
    try {
      await registrieren({
        data: {
          name: String(form.get("name") ?? ""),
          adresse: String(form.get("adresse") ?? ""),
          plz: String(form.get("plz") ?? ""),
          ort: String(form.get("ort") ?? ""),
          kanton: String(form.get("kanton") ?? ""),
          kurstyp: String(form.get("kurstyp") ?? "vku") as "vku" | "nothelferkurs" | "beide",
          preis_chf: preis ? Number(preis) : undefined,
          termine_url: String(form.get("termine_url") ?? ""),
          website_url: String(form.get("website_url") ?? ""),
          kontakt_email: String(form.get("kontakt_email") ?? ""),
          kontakt_telefon: String(form.get("kontakt_telefon") ?? ""),
        },
      });
      setStatus("ok");
    } catch (error) {
      console.error(error);
      setFehler("Bitte prüfe deine Angaben (gültige E-Mail, vollständige URLs mit https://).");
      setStatus("fehler");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Kostenlos & neutral"
        title="Fahrschulen-Partner werden"
        lead="Trage deine Fahrschule oder Kursorganisation ein. Wir prüfen jeden Eintrag manuell und schalten ihn danach frei. Danach kannst du deine Angaben und deine Termine-Seite selbst verwalten."
      />

      {status === "ok" ? (
        <div className="rounded-3xl bg-mint p-8 text-teal">
          <h2 className="font-display text-lg font-bold">Danke für deine Anmeldung!</h2>
          <p className="mt-2 text-sm">
            Dein Eintrag ist erfasst und noch inaktiv. Wir prüfen ihn und melden uns per E-Mail.
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)] md:grid-cols-2"
        >
          <Feld label="Name der Fahrschule *">
            <input name="name" required className={feldKlasse} />
          </Feld>
          <Feld label="Kursart *">
            <select name="kurstyp" className={feldKlasse} defaultValue="vku">
              <option value="vku">VKU</option>
              <option value="nothelferkurs">Nothelferkurs</option>
              <option value="beide">Beide</option>
            </select>
          </Feld>
          <Feld label="Adresse">
            <input name="adresse" className={feldKlasse} />
          </Feld>
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <Feld label="PLZ">
              <input name="plz" className={feldKlasse} />
            </Feld>
            <Feld label="Ort">
              <input name="ort" className={feldKlasse} />
            </Feld>
          </div>
          <Feld label="Kanton *">
            <select name="kanton" required className={feldKlasse} defaultValue="">
              <option value="" disabled>
                Bitte wählen
              </option>
              {kantone.map((k) => (
                <option key={k.kuerzel} value={k.kuerzel}>
                  {k.kuerzel} · {k.name}
                </option>
              ))}
            </select>
          </Feld>
          <Feld label="Preis in CHF">
            <input name="preis_chf" type="number" min="0" step="1" className={feldKlasse} />
          </Feld>
          <Feld label="Termine-Seite (URL)">
            <input name="termine_url" type="url" placeholder="https://" className={feldKlasse} />
          </Feld>
          <Feld label="Website (URL)">
            <input name="website_url" type="url" placeholder="https://" className={feldKlasse} />
          </Feld>
          <Feld label="Kontakt-E-Mail *">
            <input name="kontakt_email" type="email" required className={feldKlasse} />
          </Feld>
          <Feld label="Telefon">
            <input name="kontakt_telefon" className={feldKlasse} />
          </Feld>

          {fehler ? <p className="text-sm text-destructive md:col-span-2">{fehler}</p> : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={status === "senden"}
              className="rounded-full bg-coral px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "senden" ? "Wird gesendet …" : "Eintrag einreichen"}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Neue Einträge sind bis zur manuellen Freischaltung inaktiv.
            </p>
          </div>
        </form>
      )}
    </SiteShell>
  );
}
