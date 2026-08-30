import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { oevVerbindung } from "./oev.server";

const zielSchema = z.object({
  id: z.string().min(1).max(80),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const oevReisezeiten = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        ziele: z.array(zielSchema).max(12),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const von = { lat: data.lat, lng: data.lng };
    const ergebnisse = await Promise.all(
      data.ziele.map(async (ziel) => {
        const v = await oevVerbindung(von, { lat: ziel.lat, lng: ziel.lng });
        return [ziel.id, v] as const;
      }),
    );

    const map: Record<string, { minuten: number; abfahrt: string | null }> = {};
    for (const [id, v] of ergebnisse) {
      if (v) map[id] = v;
    }
    return map;
  });
