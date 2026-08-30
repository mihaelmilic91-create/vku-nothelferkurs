/**
 * Öffentlicher Verkehr: Reisezeiten über die offene Schweizer Fahrplan-API
 * transport.opendata.ch (gleiche Fahrplandaten wie SBB, kein API-Key nötig).
 */

function parseDauerMinuten(duration: unknown): number | null {
  if (typeof duration !== "string") return null;
  const m = /^(\d+)d(\d{2}):(\d{2}):(\d{2})$/.exec(duration.trim());
  if (!m) return null;
  const tage = Number(m[1]);
  const stunden = Number(m[2]);
  const minuten = Number(m[3]);
  const total = tage * 1440 + stunden * 60 + minuten;
  return Number.isFinite(total) && total > 0 ? total : null;
}

export interface OevVerbindung {
  minuten: number;
  abfahrt: string | null;
}

/** Nächste ÖV-Verbindung zwischen zwei Koordinaten. Bei Fehlern: null. */
export async function oevVerbindung(
  von: { lat: number; lng: number },
  nach: { lat: number; lng: number },
): Promise<OevVerbindung | null> {
  try {
    const url = new URL("https://transport.opendata.ch/v1/connections");
    url.searchParams.set("from", `${von.lat},${von.lng}`);
    url.searchParams.set("to", `${nach.lat},${nach.lng}`);
    url.searchParams.set("limit", "1");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      connections?: Array<{ duration?: string; from?: { departure?: string | null } }>;
    };
    const verbindung = json.connections?.[0];
    const minuten = parseDauerMinuten(verbindung?.duration);
    if (minuten == null) return null;
    return { minuten, abfahrt: verbindung?.from?.departure ?? null };
  } catch {
    return null;
  }
}
