import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type TerminFenster = { von: string | null; bis: string | null };

export type TerminInfo = {
  /** Erster (nächster) Kurstag je Anbieter, unabhängig vom Filterfenster. */
  erstTermin: Record<string, string>;
  /** Anbieter, die überhaupt strukturierte Termine erfasst haben. */
  hatTermine: Set<string>;
  /** Anbieter, deren erster Kurstag im Filterfenster liegt. */
  imFenster: Set<string>;
};

export function heuteIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Liest je Anbieter den ersten kommenden Kurstag (kursbeginn) und prüft,
 * ob dieser im gewünschten Zeitfenster liegt.
 */
export async function ladeTerminInfo(
  supabase: SupabaseClient<Database>,
  anbieterIds: string[],
  fenster: TerminFenster,
): Promise<TerminInfo> {
  const info: TerminInfo = { erstTermin: {}, hatTermine: new Set(), imFenster: new Set() };
  if (anbieterIds.length === 0) return info;

  const { data, error } = await supabase
    .from("kurstermine")
    .select("anbieter_id, kursbeginn")
    .in("anbieter_id", anbieterIds)
    .gte("kursbeginn", heuteIso())
    .order("kursbeginn");
  if (error) throw error;

  for (const t of data ?? []) {
    info.hatTermine.add(t.anbieter_id);
    if (!info.erstTermin[t.anbieter_id]) info.erstTermin[t.anbieter_id] = t.kursbeginn;
  }

  for (const [id, ersterTag] of Object.entries(info.erstTermin)) {
    if (fenster.von && ersterTag < fenster.von) continue;
    if (fenster.bis && ersterTag > fenster.bis) continue;
    info.imFenster.add(id);
  }

  return info;
}

/**
 * Anbieter ohne erfasste Termine bleiben sichtbar (Fallback auf Website-Link).
 */
export function terminPasst(id: string, info: TerminInfo, aktiv: boolean) {
  if (!aktiv) return true;
  if (!info.hatTermine.has(id)) return true;
  return info.imFenster.has(id);
}
