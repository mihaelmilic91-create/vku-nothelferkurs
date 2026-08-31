import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function requireAdmin(context: { supabase: any; userId: string }) {
  // Erlaubte E-Mail-Adressen schalten sich beim ersten Besuch selbst frei.
  await context.supabase.rpc("claim_admin_role");
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden");
}

export const adminUebersicht = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);

    const { data: anbieter, error } = await context.supabase
      .from("anbieter")
      .select(
        "id, name, slug, adresse, plz, ort, kanton, kurstyp, preis_chf, termine_url, website_url, kontakt_email, kontakt_telefon, status, created_at, ersetzt_anbieter_id",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: klicks, error: klickError } = await context.supabase
      .from("gutschein_klicks")
      .select("id, anbieter_id, email, zeitpunkt")
      .order("zeitpunkt", { ascending: false });
    if (klickError) throw klickError;

    const { data: termine, error: termineError } = await context.supabase
      .from("kurstermine")
      .select("id, anbieter_id, kursbeginn, plaetze_frei")
      .order("kursbeginn");
    if (termineError) throw termineError;

    const namen = new Map((anbieter ?? []).map((a: any) => [a.id, a.name as string]));
    const gruppen = new Map<
      string,
      { anbieter_id: string; name: string; anzahl: number; emails: string[]; letzter: string }
    >();
    for (const k of klicks ?? []) {
      const key = (k.anbieter_id as string | null) ?? "allgemein";
      const eintrag = gruppen.get(key) ?? {
        anbieter_id: key,
        name: !k.anbieter_id
          ? "Allgemein (Startseite)"
          : ((namen.get(key) as string) ?? "Unbekannter Anbieter"),
        anzahl: 0,
        emails: [] as string[],
        letzter: k.zeitpunkt as string,
      };
      eintrag.anzahl += 1;
      if (k.email && !eintrag.emails.includes(k.email)) eintrag.emails.push(k.email as string);
      gruppen.set(key, eintrag);
    }

    const leads = [...gruppen.values()].sort((a, b) => b.anzahl - a.anzahl);
    const gesamt = anbieter?.length ?? 0;
    const aktiv = (anbieter ?? []).filter((a: any) => a.status === "aktiv").length;

    return {
      anbieter: (anbieter ?? []) as any[],
      leads,
      termine: (termine ?? []) as any[],
      kennzahlen: { gesamt, aktiv, inaktiv: gesamt - aktiv, leadsGesamt: klicks?.length ?? 0 },
    };
  });

export const adminFuegeTerminHinzu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        anbieter_id: z.string().uuid(),
        kursbeginn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        plaetze_frei: z.number().int().nonnegative().max(999).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("kurstermine").insert({
      anbieter_id: data.anbieter_id,
      kursbeginn: data.kursbeginn,
      plaetze_frei: data.plaetze_frei ?? null,
    });
    if (error) throw error;
    return { ok: true as const };
  });

export const adminLoescheTermin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("kurstermine").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const setzeAnbieterStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["aktiv", "inaktiv"]) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("anbieter")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const adminAktualisiereAnbieter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(2).max(160),
        adresse: z.string().max(200).optional().or(z.literal("")),
        plz: z.string().max(10).optional().or(z.literal("")),
        ort: z.string().max(120).optional().or(z.literal("")),
        kanton: z.string().max(4).optional().or(z.literal("")),
        kurstyp: z.enum(["vku", "nothelferkurs", "beide"]),
        preis_chf: z.number().nonnegative().max(10000).nullable().optional(),
        termine_url: z.string().url().max(300).optional().or(z.literal("")),
        website_url: z.string().url().max(300).optional().or(z.literal("")),
        kontakt_email: z.string().email().max(160).optional().or(z.literal("")),
        kontakt_telefon: z.string().max(40).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("anbieter")
      .update({
        name: data.name,
        adresse: data.adresse || null,
        plz: data.plz || null,
        ort: data.ort || null,
        kanton: data.kanton || null,
        kurstyp: data.kurstyp,
        preis_chf: data.preis_chf ?? null,
        termine_url: data.termine_url || null,
        website_url: data.website_url || null,
        kontakt_email: data.kontakt_email || null,
        kontakt_telefon: data.kontakt_telefon || null,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const loescheAnbieter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("anbieter").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });
