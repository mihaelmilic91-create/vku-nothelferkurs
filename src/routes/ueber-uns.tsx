import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/ueber-uns")({
  head: () => ({
    meta: [
      { title: "Über uns — neutrales Kursverzeichnis für die Schweiz" },
      {
        name: "description",
        content:
          "Wer hinter vku-nothelferkurs.ch steht: ein unabhängiges Verzeichnis für VKU- und Nothelferkurse in der ganzen Schweiz.",
      },
      { property: "og:title", content: "Über vku-nothelferkurs.ch" },
      { property: "og:description", content: "Unabhängig, kostenlos und für alle Kantone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UeberUns,
});

function UeberUns() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Unabhängig" title="Über uns" />
      <div className="max-w-2xl space-y-4 pb-6 text-muted-foreground">
        <p>
          vku-nothelferkurs.ch ist ein neutrales Verzeichnis für die beiden Pflichtkurse auf dem Weg
          zum Führerausweis: den Verkehrskundeunterricht (VKU) und den Nothelferkurs.
        </p>
        <p>
          Wir verkaufen keine Kurse und vermitteln keine Buchungen. Die Buchung erfolgt immer direkt
          beim jeweiligen Anbieter. Unser Ziel ist es, Fahrschüler:innen und Eltern eine vollständige,
          verständliche und aktuelle Übersicht über alle Kantone zu geben.
        </p>
        <p>
          Anbieter werden manuell geprüft, bevor sie im Verzeichnis erscheinen. Fehlt ein Anbieter
          oder stimmt eine Angabe nicht? Wir freuen uns über jeden Hinweis.
        </p>
      </div>
    </SiteShell>
  );
}
