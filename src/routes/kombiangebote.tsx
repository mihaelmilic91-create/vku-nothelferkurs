import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { AnbieterKarte, LeereListe } from "@/components/anbieter-karte";
import { listAnbieter } from "@/lib/verzeichnis.functions";

export const Route = createFileRoute("/kombiangebote")({
  loader: () => listAnbieter({ data: { kurstyp: "beide" } }),
  head: () => ({
    meta: [
      { title: "Kombiangebote: VKU & Nothelferkurs bei einem Anbieter" },
      {
        name: "description",
        content:
          "Anbieter, die VKU und Nothelferkurs gemeinsam anbieten — beide Pflichtkurse aus einer Hand.",
      },
      { property: "og:title", content: "Kombiangebote für VKU & Nothelferkurs" },
      {
        property: "og:description",
        content: "Beide Pflichtkurse bei einer Fahrschule buchen — Übersicht aller Kombianbieter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Kombiangebote,
  errorComponent: () => <SiteShell>Angebote konnten nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Seite nicht gefunden.</SiteShell>,
});

function Kombiangebote() {
  const anbieter = Route.useLoaderData();

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Beide Kurse aus einer Hand"
        title="Kombiangebote"
        lead="Diese Anbieter führen sowohl den Verkehrskundeunterricht als auch den Nothelferkurs durch."
      />
      <div className="grid gap-4 pb-6 md:grid-cols-2">
        {anbieter.map((a) => (
          <AnbieterKarte key={a.id} anbieter={a} />
        ))}
      </div>
      {anbieter.length === 0 ? (
        <LeereListe text="Noch keine Kombiangebote freigeschaltet." />
      ) : null}
    </SiteShell>
  );
}
