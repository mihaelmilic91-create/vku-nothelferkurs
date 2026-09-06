import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const suchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(120).optional(),
  plz: z.string().max(10).optional(),
  ort: z.string().max(80).optional(),
  kanton: z.string().max(2).optional(),
});

export const Route = createFileRoute("/fahrschulen-partner")({
  validateSearch: (search: Record<string, unknown>) => suchSchema.parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/kursanbieter-werden", search });
  },
});
