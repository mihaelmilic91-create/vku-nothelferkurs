import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/ratgeber")({
  head: () => ({
    meta: [
      { title: "Ratgeber zu VKU, Nothelferkurs & Theorieprüfung" },
      {
        name: "description",
        content:
          "Artikel und Tipps rund um VKU, Nothelferkurs, Lernfahrausweis und Theorieprüfung in der Schweiz — in Kürze verfügbar.",
      },
      { property: "og:title", content: "Ratgeber für Fahrschüler:innen" },
      {
        property: "og:description",
        content: "Wissenswertes zu den Pflichtkursen auf dem Weg zum Führerausweis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ratgeber,
});

function Ratgeber() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Wissen"
        title="Ratgeber"
        lead="Hier entstehen Artikel zu VKU, Nothelferkurs, Lernfahrausweis und Theorieprüfung."
      />
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Die ersten Beiträge erscheinen in Kürze.
      </div>
    </SiteShell>
  );
}
