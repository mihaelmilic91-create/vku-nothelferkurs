export interface GeoPunkt {
  label: string;
  lat: number;
  lng: number;
}

/** Distanz in km (Haversine). */
export function distanzKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function bereinigeLabel(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Geocoding über die offene Geo-API des Bundes (geo.admin.ch, kein API-Key nötig).
 */
export async function geocodeSchweiz(suche: string): Promise<GeoPunkt | null> {
  const url = new URL("https://api3.geo.admin.ch/rest/services/api/SearchServer");
  url.searchParams.set("searchText", suche);
  url.searchParams.set("type", "locations");
  url.searchParams.set("origins", "zipcode,gg25,kantone");
  url.searchParams.set("sr", "4326");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    results?: Array<{ attrs?: { label?: string; lat?: number; lon?: number } }>;
  };
  const attrs = json.results?.[0]?.attrs;
  if (!attrs || typeof attrs.lat !== "number" || typeof attrs.lon !== "number") return null;

  return { label: bereinigeLabel(attrs.label ?? suche), lat: attrs.lat, lng: attrs.lon };
}
