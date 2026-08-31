import { Link } from "@tanstack/react-router";

export type UnbeanspruchtDaten = {
  id: string;
  name: string;
  plz?: string | null;
  ort?: string | null;
  kanton?: string | null;
};

export function UnbeanspruchtBadge({ klein = false }: { klein?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-muted font-display font-bold text-muted-foreground ${
        klein ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
      title="Recherchierter Eintrag ohne Vereinbarung mit dem Anbieter"
    >
      Unbeansprucht
    </span>
  );
}

export function WebsiteLink({ url, klein = false }: { url: string | null; klein?: boolean }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`rounded-full bg-foreground font-display font-semibold text-primary-foreground transition-colors hover:bg-coral ${
        klein ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
      }`}
    >
      Website des Anbieters ↗
    </a>
  );
}

export function BeanspruchenLink({
  anbieter,
  klein = false,
}: {
  anbieter: UnbeanspruchtDaten;
  klein?: boolean;
}) {
  return (
    <Link
      to="/fahrschulen-partner"
      search={{
        id: anbieter.id,
        name: anbieter.name,
        plz: anbieter.plz ?? undefined,
        ort: anbieter.ort ?? undefined,
        kanton: anbieter.kanton ?? undefined,
      }}
      className={`rounded-full bg-sun font-display font-semibold text-foreground transition-transform hover:-translate-y-0.5 ${
        klein ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm"
      }`}
    >
      Diesen Eintrag beanspruchen
    </Link>
  );
}
