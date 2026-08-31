import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const meinAnbieter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("anbieter")
      .select(
        "id, name, slug, adresse, plz, ort, kanton, kurstyp, preis_chf, termine_url, website_url, kontakt_email, kontakt_telefon, status",
      )
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const aktualisiereMeinAnbieter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        termine_url: z.string().url().max(300).optional().or(z.literal("")),
        website_url: z.string().url().max(300).optional().or(z.literal("")),
        kontakt_email: z.string().email().max(160),
        kontakt_telefon: z.string().max(40).optional().or(z.literal("")),
        preis_chf: z.number().nonnegative().max(10000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("anbieter")
      .update({
        termine_url: data.termine_url || null,
        website_url: data.website_url || null,
        kontakt_email: data.kontakt_email,
        kontakt_telefon: data.kontakt_telefon || null,
        preis_chf: data.preis_chf ?? null,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true as const };
  });

export const meineTermine = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: anbieter, error: anbieterError } = await context.supabase
      .from("anbieter")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (anbieterError) throw anbieterError;
    if (!anbieter) return [];

    const { data, error } = await context.supabase
      .from("kurstermine")
      .select("id, kursbeginn, plaetze_frei")
      .eq("anbieter_id", anbieter.id)
      .order("kursbeginn");
    if (error) throw error;
    return data ?? [];
  });

export const fuegeTerminHinzu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        kursbeginn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        plaetze_frei: z.number().int().nonnegative().max(999).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: anbieter, error: anbieterError } = await context.supabase
      .from("anbieter")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (anbieterError) throw anbieterError;
    if (!anbieter) throw new Error("Kein Anbieter für dieses Konto gefunden.");

    const { error } = await context.supabase.from("kurstermine").insert({
      anbieter_id: anbieter.id,
      kursbeginn: data.kursbeginn,
      plaetze_frei: data.plaetze_frei ?? null,
    });
    if (error) throw error;
    return { ok: true as const };
  });

export const loescheTermin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("kurstermine").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });
