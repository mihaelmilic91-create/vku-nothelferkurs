import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { AnbieterKarte, LeereListe } from "@/components/anbieter-karte";
import { listAnbieter, listKantone } from "@/lib/verzeichnis.functions";

export const Route = createFileRoute("/nothelferkurs/$kanton")({
  loader: async ({ params }) => {
    const [kantone, anbieter] = await Promise.all([
      listKantone(),
      listAnbieter({ data: { kanton: params.kanton, kurstyp: "nothelferkurs" } }),
    ]);
    const kanton = kantone.find((k) => k.kuerzel.toLowerCase() === params.kanton.toLowerCase());
    return { kanton, anbieter };
  },
  head: ({ params, loaderData }) => {
    const name = loaderData?.kanton?.name ?? params.kanton.toUpperCase();
    const title = `Nothelferkurs im Kanton ${name} — Anbieter & Termine`;
    const description = `Nothelferkurse im Kanton ${name}: Anbieter, Preise und Kursbeginn im neutralen Vergleich.`;
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
  component: NothelferKanton,
  errorComponent: () => <SiteShell>Anbieter konnten nicht geladen werden.</SiteShell>,
  notFoundComponent: () => <SiteShell>Kanton nicht gefunden.</SiteShell>,
});

function NothelferKanton() {
  const { kanton, anbieter } = Route.useLoaderData();
  const name = kanton?.name ?? "Unbekannt";

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Nothelferkurs"
        title={`Nothelferkurs im Kanton ${name}`}
        lead={`${anbieter.length} freigeschaltete Anbieter.`}
      />
      <div className="grid gap-4 pb-6 md:grid-cols-2">
        {anbieter.map((a) => (
          <AnbieterKarte key={a.id} anbieter={a} />
        ))}
      </div>
      {anbieter.length === 0 ? (
        <LeereListe text="Für diesen Kanton sind noch keine Anbieter freigeschaltet." />
      ) : null}
      <Link to="/nothelferkurs" className="mt-6 inline-block text-sm font-semibold text-coral">
        ← Alle Kantone
      </Link>
    </SiteShell>
  );
}
