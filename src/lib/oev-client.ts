import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { oevReisezeiten } from "./oev.functions";

export type OevZiel = { id: string; lat: number | null; lng: number | null };

export function formatiereOevZeit(minuten: number) {
  if (minuten < 60) return `ca. ${minuten} Min. mit dem ÖV`;
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return m === 0 ? `ca. ${h} Std. mit dem ÖV` : `ca. ${h} Std. ${m} Min. mit dem ÖV`;
}

/**
 * Lädt ÖV-Reisezeiten ab dem Suchpunkt zu den angezeigten Anbietern.
 * Schlägt die Berechnung fehl, bleibt die Karte einfach ohne ÖV-Zeile.
 */
export function useOevZeiten(
  punkt: { lat: number; lng: number } | null | undefined,
  ziele: OevZiel[],
) {
  const laden = useServerFn(oevReisezeiten);
  const gueltige = ziele
    .filter((z) => z.lat != null && z.lng != null)
    .slice(0, 12)
    .map((z) => ({ id: z.id, lat: z.lat as number, lng: z.lng as number }));

  const { data } = useQuery({
    queryKey: [
      "oev",
      punkt?.lat ?? null,
      punkt?.lng ?? null,
      gueltige.map((z) => z.id).join(","),
    ],
    enabled: Boolean(punkt) && gueltige.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      laden({ data: { lat: punkt!.lat, lng: punkt!.lng, ziele: gueltige } }).catch(
        () => ({}) as Record<string, { minuten: number; abfahrt: string | null }>,
      ),
  });

  return (data ?? {}) as Record<string, { minuten: number; abfahrt: string | null }>;
}
