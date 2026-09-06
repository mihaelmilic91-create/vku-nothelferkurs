import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/agb")({
  head: () => ({
    meta: [
      { title: "AGB — vku-nothelferkurs.ch" },
      {
        name: "description",
        content: "Allgemeine Geschäftsbedingungen für Kursanbieter auf vku-nothelferkurs.ch.",
      },
      { property: "og:title", content: "AGB" },
      {
        property: "og:description",
        content: "Bedingungen für den kostenlosen Verzeichniseintrag.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Agb,
});

function Agb() {
  return (
    <SiteShell>
      <PageHeader title="Allgemeine Geschäftsbedingungen" />
      <div className="max-w-2xl space-y-4 pb-6 text-sm text-muted-foreground">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Geltungsbereich</h2>
          <p className="mt-1">
            Diese Bedingungen gelten für Kursanbieter, die sich über vku-nothelferkurs.ch für
            einen Eintrag im Verzeichnis anmelden.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Leistung</h2>
          <p className="mt-1">
            Der Verzeichniseintrag ist kostenlos. Wir behalten uns vor, Einträge vor der
            Veröffentlichung zu prüfen, abzulehnen oder nachträglich zu entfernen, insbesondere
            bei falschen, veralteten oder missbräuchlichen Angaben.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Pflichten des Anbieters
          </h2>
          <p className="mt-1">
            Der Anbieter sichert zu, dass die eingegebenen Angaben (Kontaktdaten, Kurse, Preise,
            Termine) wahrheitsgemäss und aktuell sind, und ist für deren Pflege über sein Konto
            selbst verantwortlich.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Haftung</h2>
          <p className="mt-1">
            Wir übernehmen keine Gewähr für die Richtigkeit der von Anbietern gemachten Angaben
            und haften nicht für entgangene Anfragen, Buchungen oder sonstige wirtschaftliche
            Nachteile im Zusammenhang mit dem Verzeichniseintrag.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Kontobeendigung</h2>
          <p className="mt-1">
            Anbieter können ihr Konto und ihren Eintrag jederzeit per E-Mail an
            hallo@vku-nothelferkurs.ch löschen lassen. Wir können Einträge bei Verstössen gegen
            diese Bedingungen ohne Vorankündigung entfernen.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Anwendbares Recht</h2>
          <p className="mt-1">
            Es gilt Schweizer Recht. Gerichtsstand ist der Sitz des Betreibers.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
