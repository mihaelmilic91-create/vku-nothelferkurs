import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung — vku-nothelferkurs.ch" },
      {
        name: "description",
        content:
          "Wie vku-nothelferkurs.ch mit Personendaten von Besucher:innen und Anbietern umgeht.",
      },
      { property: "og:title", content: "Datenschutzerklärung" },
      { property: "og:description", content: "Umgang mit Personendaten auf vku-nothelferkurs.ch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Datenschutz,
});

function Datenschutz() {
  return (
    <SiteShell>
      <PageHeader title="Datenschutzerklärung" />
      <div className="max-w-2xl space-y-4 pb-6 text-sm text-muted-foreground">
        <p>
          Wir bearbeiten Personendaten im Rahmen des Schweizer Datenschutzgesetzes (revDSG) und nur
          soweit dies für den Betrieb dieses Verzeichnisses nötig ist.
        </p>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Anbieterangaben</h2>
          <p className="mt-1">
            Wenn sich ein Anbieter anmeldet, speichern wir die im Formular angegebenen Kontakt- und
            Kursdaten. Diese werden nach der Freischaltung öffentlich im Verzeichnis angezeigt.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Anbieterkonten</h2>
          <p className="mt-1">
            Für den Login speichern wir E-Mail-Adresse und ein verschlüsseltes Passwort. Ein Konto
            kann jederzeit per E-Mail gelöscht werden.
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Kontakt</h2>
          <p className="mt-1">Fragen zum Datenschutz: hallo@vku-nothelferkurs.ch</p>
        </div>
      </div>
    </SiteShell>
  );
}
