import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import {
  meinAnbieter,
  aktualisiereMeinAnbieter,
  meineTermine,
  fuegeTerminHinzu,
  loescheTermin,
} from "@/lib/mein-konto.functions";

export const Route = createFileRoute("/_authenticated/mein-konto")({
  head: () => ({
    meta: [
      { title: "Mein Anbieterkonto — vku-nothelferkurs.ch" },
      {
        name: "description",
        content: "Eigene Kursangaben, Kontaktdaten und die Termine-Seite selbst verwalten.",
      },
      { property: "og:title", content: "Mein Anbieterkonto" },
      { property: "og:description", content: "Angaben und Termine-Seite verwalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeinKonto,
});

const feldKlasse =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function MeinKonto() {
  const navigate = useNavigate();
  const laden = useServerFn(meinAnbieter);
  const speichern = useServerFn(aktualisiereMeinAnbieter);
  const termineLaden = useServerFn(meineTermine);
  const terminHinzufuegen = useServerFn(fuegeTerminHinzu);
  const terminLoeschen = useServerFn(loescheTermin);
  const [meldung, setMeldung] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mein-anbieter"],
    queryFn: () => laden(),
  });

  const {
    data: termine,
    isLoading: termineLaden_,
    refetch: refetchTermine,
  } = useQuery({
    queryKey: ["meine-termine"],
    queryFn: () => termineLaden(),
    enabled: Boolean(data),
  });

  const mutation = useMutation({
    mutationFn: (values: {
      id: string;
      termine_url?: string;
      website_url?: string;
      kontakt_email: string;
      kontakt_telefon?: string;
      preis_chf?: number | undefined;
      preis_nothelferkurs_chf?: number | undefined;
    }) => speichern({ data: values }),
    onSuccess: () => {
      setMeldung("Gespeichert.");
      void refetch();
    },
    onError: () => setMeldung("Speichern fehlgeschlagen — bitte URLs mit https:// angeben."),
  });

  const terminHinzufuegenMutation = useMutation({
    mutationFn: (values: { kursbeginn: string; plaetze_frei?: number }) =>
      terminHinzufuegen({ data: values }),
    onSuccess: () => void refetchTermine(),
  });

  const terminLoeschenMutation = useMutation({
    mutationFn: (id: string) => terminLoeschen({ data: { id } }),
    onSuccess: () => void refetchTermine(),
  });

  return (
    <SiteShell>
      <PageHeader eyebrow="Anbieterbereich" title="Mein Konto" />
      {isLoading ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : !data ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Deinem Konto ist noch kein Eintrag zugeordnet. Reiche zuerst das Partnerformular ein — wir
          verknüpfen deinen Eintrag bei der Freischaltung.
        </div>
      ) : (
        <form
          className="max-w-xl rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const preis = String(form.get("preis_chf") ?? "").trim();
            const preisNothelfer = String(form.get("preis_nothelferkurs_chf") ?? "").trim();
            mutation.mutate({
              id: data.id,
              termine_url: String(form.get("termine_url") ?? ""),
              website_url: String(form.get("website_url") ?? ""),
              kontakt_email: String(form.get("kontakt_email") ?? ""),
              kontakt_telefon: String(form.get("kontakt_telefon") ?? ""),
              preis_chf: preis ? Number(preis) : undefined,
              preis_nothelferkurs_chf: preisNothelfer ? Number(preisNothelfer) : undefined,
            });
          }}
        >
          <h2 className="font-display text-lg font-bold">{data.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Status: {data.status === "aktiv" ? "freigeschaltet" : "in Prüfung"}
          </p>

          <label className="mt-4 block text-sm font-semibold">
            Termine-Seite (URL)
            <input name="termine_url" defaultValue={data.termine_url ?? ""} className={`mt-1.5 ${feldKlasse}`} />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Website (URL)
            <input name="website_url" defaultValue={data.website_url ?? ""} className={`mt-1.5 ${feldKlasse}`} />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Kontakt-E-Mail
            <input
              name="kontakt_email"
              type="email"
              required
              defaultValue={data.kontakt_email ?? ""}
              className={`mt-1.5 ${feldKlasse}`}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Telefon
            <input name="kontakt_telefon" defaultValue={data.kontakt_telefon ?? ""} className={`mt-1.5 ${feldKlasse}`} />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Preis in CHF{data.kurstyp === "beide" ? " (VKU)" : ""}
            <input
              name="preis_chf"
              type="number"
              min="0"
              step="1"
              defaultValue={data.preis_chf ?? ""}
              className={`mt-1.5 ${feldKlasse}`}
            />
          </label>
          {data.kurstyp === "beide" ? (
            <label className="mt-4 block text-sm font-semibold">
              Preis Nothelferkurs in CHF
              <input
                name="preis_nothelferkurs_chf"
                type="number"
                min="0"
                step="1"
                defaultValue={data.preis_nothelferkurs_chf ?? ""}
                className={`mt-1.5 ${feldKlasse}`}
              />
            </label>
          ) : null}

          {meldung ? <p className="mt-3 text-sm text-muted-foreground">{meldung}</p> : null}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-5 rounded-full bg-coral px-6 py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Speichern
          </button>
        </form>
      )}

      {data ? (
        <div className="mt-8 max-w-xl rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]">
          <h2 className="font-display text-lg font-bold">Kurstermine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Diese Termine erscheinen im Verzeichnis als "Nächster Kursbeginn" und werden für die
            Datumsfilter genutzt.
          </p>

          {termineLaden_ ? (
            <p className="mt-4 text-sm text-muted-foreground">Wird geladen …</p>
          ) : !termine || termine.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Noch keine Termine erfasst.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {termine.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-background px-4 py-2.5 text-sm"
                >
                  <span className="font-medium">
                    {new Date(t.kursbeginn).toLocaleDateString("de-CH", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    {t.plaetze_frei != null ? ` · ${t.plaetze_frei} Plätze frei` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Diesen Termin löschen?")) terminLoeschenMutation.mutate(t.id);
                    }}
                    className="text-xs font-semibold text-coral"
                  >
                    Löschen
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const kursbeginn = String(form.get("kursbeginn") ?? "");
              const plaetze = String(form.get("plaetze_frei") ?? "").trim();
              if (!kursbeginn) return;
              terminHinzufuegenMutation.mutate(
                { kursbeginn, plaetze_frei: plaetze ? Number(plaetze) : undefined },
                { onSuccess: () => event.currentTarget.reset() },
              );
            }}
          >
            <label className="text-sm font-semibold">
              Datum
              <input
                name="kursbeginn"
                type="date"
                required
                className={`mt-1.5 ${feldKlasse}`}
              />
            </label>
            <label className="text-sm font-semibold">
              Freie Plätze (optional)
              <input
                name="plaetze_frei"
                type="number"
                min="0"
                step="1"
                className={`mt-1.5 w-36 ${feldKlasse}`}
              />
            </label>
            <button
              type="submit"
              disabled={terminHinzufuegenMutation.isPending}
              className="rounded-full bg-teal px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              Termin hinzufügen
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/auth" });
        }}
        className="mt-6 text-sm font-semibold text-coral"
      >
        Abmelden
      </button>
    </SiteShell>
  );
}
