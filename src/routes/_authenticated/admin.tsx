import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import {
  adminUebersicht,
  adminAktualisiereAnbieter,
  loescheAnbieter,
  setzeAnbieterStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin-Dashboard — vku-nothelferkurs.ch" },
      {
        name: "description",
        content: "Interne Verwaltung von Anbietern, Freischaltungen und Gutschein-Leads.",
      },
      { property: "og:title", content: "Admin-Dashboard" },
      { property: "og:description", content: "Interne Verwaltung des Kursverzeichnisses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSeite,
});

const feld =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

type Anbieter = {
  id: string;
  name: string;
  slug: string;
  adresse: string | null;
  plz: string | null;
  ort: string | null;
  kanton: string | null;
  kurstyp: "vku" | "nothelferkurs" | "beide";
  preis_chf: number | null;
  termine_url: string | null;
  website_url: string | null;
  kontakt_email: string | null;
  kontakt_telefon: string | null;
  status: "aktiv" | "inaktiv";
  created_at: string;
  ersetzt_anbieter_id: string | null;
};

function AdminSeite() {
  const laden = useServerFn(adminUebersicht);
  const statusFn = useServerFn(setzeAnbieterStatus);
  const speichernFn = useServerFn(adminAktualisiereAnbieter);
  const loeschenFn = useServerFn(loescheAnbieter);

  const [bearbeitet, setBearbeitet] = useState<string | null>(null);
  const [meldung, setMeldung] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-uebersicht"],
    queryFn: () => laden(),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: "aktiv" | "inaktiv" }) => statusFn({ data: v }),
    onSuccess: () => void refetch(),
  });
  const speichernMutation = useMutation({
    mutationFn: (v: Record<string, unknown>) => speichernFn({ data: v as never }),
    onSuccess: () => {
      setMeldung("Gespeichert.");
      setBearbeitet(null);
      void refetch();
    },
    onError: () => setMeldung("Speichern fehlgeschlagen — bitte Eingaben prüfen (URLs mit https://)."),
  });
  const loeschenMutation = useMutation({
    mutationFn: (id: string) => loeschenFn({ data: { id } }),
    onSuccess: () => {
      setMeldung("Anbieter gelöscht.");
      void refetch();
    },
  });

  if (isError) {
    return (
      <SiteShell>
        <PageHeader eyebrow="Intern" title="Kein Zugriff" />
        <p className="text-muted-foreground">
          Dieses Konto ist nicht als Admin freigeschaltet.
        </p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHeader eyebrow="Intern" title="Admin-Dashboard" />

      {isLoading || !data ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Anbieter gesamt", wert: data.kennzahlen.gesamt },
              { label: "davon aktiv", wert: data.kennzahlen.aktiv },
              { label: "Leads gesamt", wert: data.kennzahlen.leadsGesamt },
            ].map((k) => (
              <div key={k.label} className="rounded-3xl bg-card p-6 shadow-sm">
                <div className="font-display text-3xl font-bold">{k.wert}</div>
                <div className="mt-1 text-sm text-muted-foreground">{k.label}</div>
              </div>
            ))}
          </div>

          {meldung ? <p className="text-sm text-teal">{meldung}</p> : null}

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Anbieter</h2>
            {(() => {
              const anbieterListe = data.anbieter as Anbieter[];
              const nachId = new Map(anbieterListe.map((x) => [x.id, x]));
              return anbieterListe.map((a) => {
                const original = a.ersetzt_anbieter_id ? nachId.get(a.ersetzt_anbieter_id) : null;
                return (
                  <div key={a.id} className="rounded-3xl bg-card p-5 shadow-sm">
                    {original ? (
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sun/25 px-4 py-2.5 text-xs font-medium">
                        <span>
                          🔁 Beansprucht den recherchierten Eintrag «{original.name}» (
                          {original.status})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Alten Eintrag «${original.name}» jetzt löschen (Duplikat bereinigen)?`,
                              )
                            )
                              loeschenMutation.mutate(original.id);
                          }}
                          className="rounded-full bg-card px-3 py-1 font-semibold text-coral"
                        >
                          Alten Eintrag löschen
                        </button>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-display text-lg font-semibold">{a.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {[a.plz, a.ort, a.kanton].filter(Boolean).join(" ")} · {a.kurstyp}
                        </div>
                      </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.status === "aktiv"
                          ? "bg-mint text-teal"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {a.status}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({
                          id: a.id,
                          status: a.status === "aktiv" ? "inaktiv" : "aktiv",
                        })
                      }
                      className="rounded-full bg-teal px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      {a.status === "aktiv" ? "Deaktivieren" : "Freischalten"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBearbeitet(bearbeitet === a.id ? null : a.id)}
                      className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold"
                    >
                      {bearbeitet === a.id ? "Schliessen" : "Bearbeiten"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`${a.name} wirklich löschen?`))
                          loeschenMutation.mutate(a.id);
                      }}
                      className="rounded-full bg-coral px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Löschen
                    </button>
                  </div>
                </div>

                {bearbeitet === a.id ? (
                  <form
                    className="mt-5 grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const preis = String(f.get("preis_chf") ?? "").trim();
                      speichernMutation.mutate({
                        id: a.id,
                        name: String(f.get("name") ?? ""),
                        adresse: String(f.get("adresse") ?? ""),
                        plz: String(f.get("plz") ?? ""),
                        ort: String(f.get("ort") ?? ""),
                        kanton: String(f.get("kanton") ?? ""),
                        kurstyp: String(f.get("kurstyp") ?? "vku"),
                        preis_chf: preis === "" ? null : Number(preis),
                        termine_url: String(f.get("termine_url") ?? ""),
                        website_url: String(f.get("website_url") ?? ""),
                        kontakt_email: String(f.get("kontakt_email") ?? ""),
                        kontakt_telefon: String(f.get("kontakt_telefon") ?? ""),
                      });
                    }}
                  >
                    <input className={feld} name="name" defaultValue={a.name} placeholder="Name" />
                    <input
                      className={feld}
                      name="adresse"
                      defaultValue={a.adresse ?? ""}
                      placeholder="Adresse"
                    />
                    <input className={feld} name="plz" defaultValue={a.plz ?? ""} placeholder="PLZ" />
                    <input className={feld} name="ort" defaultValue={a.ort ?? ""} placeholder="Ort" />
                    <input
                      className={feld}
                      name="kanton"
                      defaultValue={a.kanton ?? ""}
                      placeholder="Kanton (z. B. ZH)"
                    />
                    <select className={feld} name="kurstyp" defaultValue={a.kurstyp}>
                      <option value="vku">vku</option>
                      <option value="nothelferkurs">nothelferkurs</option>
                      <option value="beide">beide</option>
                    </select>
                    <input
                      className={feld}
                      name="preis_chf"
                      type="number"
                      step="1"
                      defaultValue={a.preis_chf ?? ""}
                      placeholder="Preis CHF"
                    />
                    <input
                      className={feld}
                      name="kontakt_email"
                      defaultValue={a.kontakt_email ?? ""}
                      placeholder="E-Mail"
                    />
                    <input
                      className={feld}
                      name="kontakt_telefon"
                      defaultValue={a.kontakt_telefon ?? ""}
                      placeholder="Telefon"
                    />
                    <input
                      className={feld}
                      name="website_url"
                      defaultValue={a.website_url ?? ""}
                      placeholder="https://website"
                    />
                    <input
                      className={feld}
                      name="termine_url"
                      defaultValue={a.termine_url ?? ""}
                      placeholder="https://termine"
                    />
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="rounded-full bg-coral px-5 py-2 font-display text-sm font-semibold text-primary-foreground"
                      >
                        Speichern
                      </button>
                    </div>
                  </form>
                ) : null}
                  </div>
                );
              });
            })()}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Gutschein-Klicks</h2>
            {data.leads.length === 0 ? (
              <p className="text-muted-foreground">Noch keine Klicks erfasst.</p>
            ) : (
              <div className="space-y-3">
                {data.leads.map((l) => (
                  <div key={l.anbieter_id} className="rounded-3xl bg-card p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-display font-semibold">{l.name}</div>
                      <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-teal">
                        {l.anzahl} Klicks
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {l.emails.length > 0
                        ? `E-Mails: ${l.emails.join(", ")}`
                        : "Keine E-Mail-Adressen erfasst"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </SiteShell>
  );
}
