import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt — vku-nothelferkurs.ch" },
      {
        name: "description",
        content:
          "Fragen, Korrekturen oder Hinweise zu einem Kursanbieter? So erreichst du das Team von vku-nothelferkurs.ch.",
      },
      { property: "og:title", content: "Kontakt aufnehmen" },
      { property: "og:description", content: "Hinweise und Korrekturen zum Kursverzeichnis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Kontakt,
});

function Kontakt() {
  return (
    <SiteShell>
      <PageHeader eyebrow="Wir hören zu" title="Kontakt" />
      <div className="max-w-xl rounded-3xl bg-card p-6 text-sm shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
        <p className="text-muted-foreground">
          Für Fragen, Korrekturen und Hinweise zu Anbietern:
        </p>
        <p className="mt-3 font-display text-lg font-bold">
          <a href="mailto:hallo@vku-nothelferkurs.ch" className="text-coral">
            hallo@vku-nothelferkurs.ch
          </a>
        </p>
        <p className="mt-4 text-muted-foreground">
          Fahrschulen melden sich am besten direkt über das Partnerformular an.
        </p>
      </div>
    </SiteShell>
  );
}
