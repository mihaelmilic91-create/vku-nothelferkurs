import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { listKantone } from "@/lib/verzeichnis.functions";

export const Route = createFileRoute("/nothelferkurs/")({
  loader: () => listKantone(),
  head: () => ({
    meta: [
      { title: "Nothelferkurs nach Kanton finden | vku-nothelferkurs.ch" },
      {
        name: "description",
        content:
          "Übersicht aller 26 Kantone: Nothelferkurse (10 Stunden) in deiner Region finden und Anbieter vergleichen.",
      },
      { property: "og:title", content: "Nothelferkurs nach Kanton finden" },
      {
        property: "og:description",
        content: "Alle Nothelferkurs-Anbieter der Schweiz, geordnet nach Kanton.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NothelferUebersicht,
  errorComponent: () => <SiteShell>Kantone konnten nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Seite nicht gefunden.</SiteShell>,
});

function NothelferUebersicht() {
  const kantone = Route.useLoaderData();

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Pflichtkurs für den Lernfahrausweis"
        title="Nothelferkurs nach Kanton"
        lead="Der Nothelferkurs dauert 10 Stunden und ist zwei Jahre gültig. Wähle deinen Kanton."
      />
      <div className="grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 lg:grid-cols-4">
        {kantone.map((k) => (
          <Link
            key={k.kuerzel}
            to="/nothelferkurs/$kanton"
            params={{ kanton: k.kuerzel.toLowerCase() }}
            className="rounded-2xl bg-card px-4 py-3 font-display text-sm font-semibold shadow-[0_10px_30px_-24px_rgba(51,43,56,0.7)] transition-transform hover:-translate-y-0.5"
          >
            <span className="text-teal">{k.kuerzel}</span> · {k.name}
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
