import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const GUTSCHEIN_CODE = "VKU10";
export const GUTSCHEIN_TEXT = "CHF 10 Rabatt auf deine Theorie-Vorbereitung auf onlinedrivecoach.ch";

export const trackGutscheinKlick = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        anbieter_id: z.string().uuid().optional(),
        email: z.string().email().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase.from("gutschein_klicks").insert({
      anbieter_id: data.anbieter_id ?? null,
      ...(data.email ? { email: data.email } : {}),
    });
    if (error) return { ok: false as const };
    return { ok: true as const };
  });
