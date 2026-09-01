import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/auth/neues-passwort")({
  head: () => ({
    meta: [
      { title: "Neues Passwort — vku-nothelferkurs.ch" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NeuesPasswort,
});

const feldKlasse =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function NeuesPasswort() {
  const navigate = useNavigate();
  const [passwort, setPasswort] = useState("");
  const [passwortWiederholung, setPasswortWiederholung] = useState("");
  const [status, setStatus] = useState<"idle" | "senden" | "ok" | "fehler">("idle");
  const [meldung, setMeldung] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (passwort !== passwortWiederholung) {
      setMeldung("Die Passwörter stimmen nicht überein.");
      return;
    }
    setStatus("senden");
    setMeldung(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwort });
      if (error) throw error;
      setStatus("ok");
    } catch (error) {
      setMeldung(
        error instanceof Error
          ? error.message
          : "Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.",
      );
      setStatus("fehler");
    }
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Für Anbieter"
        title="Neues Passwort setzen"
        lead="Wähle ein neues Passwort für dein Anbieterkonto."
      />
      {status === "ok" ? (
        <div className="max-w-md rounded-3xl bg-mint p-6 text-teal">
          <p className="font-display text-sm font-bold">Passwort geändert.</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/mein-konto" })}
            className="mt-4 rounded-full bg-coral px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground"
          >
            Zu meinem Konto
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="max-w-md rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Neues Passwort</span>
            <input
              type="password"
              required
              minLength={6}
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              className={feldKlasse}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold">Passwort wiederholen</span>
            <input
              type="password"
              required
              minLength={6}
              value={passwortWiederholung}
              onChange={(e) => setPasswortWiederholung(e.target.value)}
              className={feldKlasse}
            />
          </label>
          {meldung ? <p className="mt-3 text-sm text-destructive">{meldung}</p> : null}
          <button
            type="submit"
            disabled={status === "senden"}
            className="mt-5 w-full rounded-full bg-coral px-6 py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {status === "senden" ? "…" : "Passwort speichern"}
          </button>
        </form>
      )}
    </SiteShell>
  );
}
