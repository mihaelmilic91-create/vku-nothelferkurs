import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { distanzKm, geocodeSchweiz } from "./geo.server";
import { ladeTerminInfo, terminPasst } from "./termine.server";
import { oeffentlicherAnbieter } from "./anbieter-sichtbarkeit";

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const ANBIETER_FELDER =
  "id, user_id, name, slug, adresse, plz, ort, kanton, kurstyp, preis_chf, preis_nothelferkurs_chf, bevorzugt, sprache, termine_url, website_url, kontakt_email, kontakt_telefon, created_at";

export const listKantone = createServerFn({ method: "GET" }).handler(async () => {
  const DEUTSCHSCHWEIZ = ["AG", "AI", "AR", "BE", "BL", "BS", "GL", "GR", "LU", "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "UR", "ZG", "ZH"];
  const { data, error } = await publicClient()
    .from("kantone")
    .select("kuerzel, name")
    .in("kuerzel", DEUTSCHSCHWEIZ)
    .order("name");
  if (error) throw error;
  return data ?? [];
});

export const listAnbieter = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        kanton: z.string().optional(),
        kurstyp: z.enum(["vku", "nothelferkurs", "beide"]).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    let query = publicClient()
      .from("anbieter")
      .select(ANBIETER_FELDER)
      .eq("status", "aktiv")
      .order("name");

    if (data.kanton) query = query.eq("kanton", data.kanton.toUpperCase());
    if (data.kurstyp === "beide") {
      query = query.eq("kurstyp", "beide");
    } else if (data.kurstyp) {
      query = query.in("kurstyp", [data.kurstyp, "beide"]);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows ?? []).map(oeffentlicherAnbieter);
  });

export const getAnbieterBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: anbieter, error } = await supabase
      .from("anbieter")
      .select(ANBIETER_FELDER)
      .eq("slug", data.slug)
      .eq("status", "aktiv")
      .maybeSingle();
    if (error) throw error;
    if (!anbieter) return null;

    const { data: termine, error: termineError } = await supabase
      .from("kurstermine")
      .select("id, kursbeginn, plaetze_frei, quelle_zuletzt_geprueft")
      .eq("anbieter_id", anbieter.id)
      .order("kursbeginn");
    if (termineError) throw termineError;

    return { ...oeffentlicherAnbieter(anbieter), termine: termine ?? [] };
  });

const registrierungSchema = z.object({
  name: z.string().min(2).max(120),
  adresse: z.string().max(160).optional().or(z.literal("")),
  plz: z.string().max(10).optional().or(z.literal("")),
  ort: z.string().max(80).optional().or(z.literal("")),
  kanton: z.string().length(2),
  kurstyp: z.enum(["vku", "nothelferkurs", "beide"]),
  preis_chf: z.number().nonnegative().max(10000).optional(),
  preis_nothelferkurs_chf: z.number().nonnegative().max(10000).optional(),
  termine_url: z.string().url().max(300).optional().or(z.literal("")),
  website_url: z.string().url().max(300).optional().or(z.literal("")),
  kontakt_email: z.string().email().max(160),
  kontakt_telefon: z.string().max(40).optional().or(z.literal("")),
  ersetzt_anbieter_id: z.string().uuid().optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export const registriereAnbieter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrierungSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const basis = slugify(data.name) || "anbieter";
    const slug = `${basis}-${Math.random().toString(36).slice(2, 7)}`;

    const { error } = await supabase.from("anbieter").insert({
      name: data.name,
      slug,
      adresse: data.adresse || null,
      plz: data.plz || null,
      ort: data.ort || null,
      kanton: data.kanton.toUpperCase(),
      kurstyp: data.kurstyp,
      preis_chf: data.preis_chf ?? null,
      preis_nothelferkurs_chf: data.preis_nothelferkurs_chf ?? null,
      termine_url: data.termine_url || null,
      website_url: data.website_url || null,
      kontakt_email: data.kontakt_email,
      kontakt_telefon: data.kontakt_telefon || null,
      ersetzt_anbieter_id: data.ersetzt_anbieter_id ?? null,
      status: "inaktiv",
    });
    if (error) throw error;
    return { ok: true as const };
  });

export const sucheAnbieterUmkreis = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        ort: z.string().max(120).optional(),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
        radiusKm: z.number().positive().max(500).optional(),
        kurstyp: z.enum(["vku", "nothelferkurs"]).optional(),
        terminVon: z.string().max(10).optional(),
        terminBis: z.string().max(10).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const suche = (data.ort ?? "").trim();
    const radius = data.radiusKm ?? 20;
    const direkterPunkt =
      typeof data.lat === "number" && typeof data.lng === "number"
        ? { label: "Dein Standort", lat: data.lat, lng: data.lng }
        : null;

    let query = supabase
      .from("anbieter")
      .select(`${ANBIETER_FELDER}, lat, lng`)
      .eq("status", "aktiv")
      .order("name");
    if (data.kurstyp) query = query.in("kurstyp", [data.kurstyp, "beide"]);

    const { data: rows, error } = await query;
    if (error) throw error;

    const terminFilterAktiv = Boolean(data.terminVon || data.terminBis);
    const info = await ladeTerminInfo(
      supabase,
      (rows ?? []).map((r) => r.id),
      { von: data.terminVon ?? null, bis: data.terminBis ?? null },
    );

    const alle = (rows ?? [])
      .filter((r) => terminPasst(r.id, info, terminFilterAktiv))
      .map(oeffentlicherAnbieter)
      .map((a) => ({ ...a, naechster_termin: info.erstTermin[a.id] ?? null }))
      .sort((a, b) => Number(b.bevorzugt) - Number(a.bevorzugt));

    if (!suche && !direkterPunkt) {
      return {
        punkt: null,
        radiusKm: radius,
        ausserhalbRadius: false,
        treffer: alle.map((a) => ({ ...a, distanz_km: null as number | null })),
      };
    }

    const punkt = direkterPunkt ?? (await geocodeSchweiz(suche));
    if (!punkt) {
      return {
        punkt: null,
        radiusKm: radius,
        ausserhalbRadius: false,
        treffer: alle.map((a) => ({ ...a, distanz_km: null as number | null })),
      };
    }

    const mitDistanz = alle
      .map((a) => ({
        ...a,
        distanz_km:
          a.lat != null && a.lng != null
            ? Math.round(distanzKm(punkt.lat, punkt.lng, a.lat, a.lng) * 10) / 10
            : null,
      }))
      .sort(
        (a, b) =>
          Number(b.bevorzugt) - Number(a.bevorzugt) ||
          (a.distanz_km ?? Infinity) - (b.distanz_km ?? Infinity),
      );

    const imRadius = mitDistanz.filter((a) => a.distanz_km != null && a.distanz_km <= radius);
    const ausserhalb = imRadius.length === 0;

    return {
      punkt,
      radiusKm: radius,
      ausserhalbRadius: ausserhalb,
      treffer: ausserhalb ? mitDistanz.filter((a) => a.distanz_km != null).slice(0, 6) : imRadius,
    };
  });


export const planeKombi = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        ort: z.string().max(120).optional(),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
        radiusKm: z.number().positive().max(500).optional(),
        terminVon: z.string().max(10).optional(),
        terminBis: z.string().max(10).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const radius = data.radiusKm ?? 20;
    const suche = (data.ort ?? "").trim();

    const punkt =
      typeof data.lat === "number" && typeof data.lng === "number"
        ? { label: "Dein Standort", lat: data.lat, lng: data.lng }
        : suche
          ? await geocodeSchweiz(suche)
          : null;

    const { data: rows, error } = await supabase
      .from("anbieter")
      .select(`${ANBIETER_FELDER}, lat, lng`)
      .eq("status", "aktiv")
      .order("name");
    if (error) throw error;

    const terminFilterAktiv = Boolean(data.terminVon || data.terminBis);
    const info = await ladeTerminInfo(
      supabase,
      (rows ?? []).map((r) => r.id),
      { von: data.terminVon ?? null, bis: data.terminBis ?? null },
    );

    const mitDistanz = (rows ?? [])
      .filter((r) => terminPasst(r.id, info, terminFilterAktiv))
      .map(oeffentlicherAnbieter)
      .map((a) => ({
        ...a,
        distanz_km:
          punkt && a.lat != null && a.lng != null
            ? Math.round(distanzKm(punkt.lat, punkt.lng, a.lat, a.lng) * 10) / 10
            : null,
      }))
      .sort(
        (a, b) =>
          Number(b.bevorzugt) - Number(a.bevorzugt) ||
          (a.distanz_km ?? Infinity) - (b.distanz_km ?? Infinity),
      );

    const imRadius = (liste: typeof mitDistanz) => {
      if (!punkt) return liste;
      const treffer = liste.filter((a) => a.distanz_km != null && a.distanz_km <= radius);
      return treffer.length > 0 ? treffer : liste.slice(0, 3);
    };

    const kombiAlle = mitDistanz.filter((a) => a.kurstyp === "beide");
    const vkuAlle = mitDistanz.filter((a) => a.kurstyp === "vku");
    const nothelferAlle = mitDistanz.filter((a) => a.kurstyp === "nothelferkurs");

    const kombi = imRadius(kombiAlle).slice(0, 6);
    const vkuListe = imRadius(vkuAlle);
    const nothelferListe = imRadius(nothelferAlle);
    const bestesVku = vkuListe[0] ?? null;
    const bestesNothelfer = nothelferListe[0] ?? null;

    const mitTermin = <T extends { id: string }>(a: T | null) =>
      a ? { ...a, naechster_termin: info.erstTermin[a.id] ?? null } : null;


    return {
      punkt,
      radiusKm: radius,
      kombiAusserhalbRadius:
        punkt != null &&
        kombi.length > 0 &&
        kombi.every((a) => a.distanz_km == null || a.distanz_km > radius),
      kombi: kombi.map((a) => mitTermin(a)!),
      getrennt: {
        vku: mitTermin(bestesVku),
        nothelferkurs: mitTermin(bestesNothelfer),
      },
    };
  });
