import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum — vku-nothelferkurs.ch" },
      {
        name: "description",
        content: "Angaben zum Betreiber von vku-nothelferkurs.ch gemäss Schweizer Recht.",
      },
      { property: "og:title", content: "Impressum" },
      { property: "og:description", content: "Betreiberangaben und Haftungshinweis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impressum,
});

function Impressum() {
  return (
    <SiteShell>
      <PageHeader title="Impressum" />
      <div className="max-w-2xl space-y-4 pb-6 text-sm text-muted-foreground">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Betreiber</h2>
          <p className="mt-1">
            vku-nothelferkurs.ch
            <br />
            [Firmenname]
            <br />
            [Strasse Nr.], [PLZ Ort], Schweiz
            <br />
            E-Mail: hallo@vku-nothelferkurs.ch
          </p>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Haftungsausschluss</h2>
          <p className="mt-1">
            Alle Angaben zu Kursen, Preisen und Terminen stammen von den jeweiligen Anbietern. Wir
            prüfen sie sorgfältig, können jedoch keine Gewähr für Richtigkeit und Aktualität
            übernehmen. Massgebend sind immer die Angaben des Anbieters.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
