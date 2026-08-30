import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anbieter-Login — vku-nothelferkurs.ch" },
      {
        name: "description",
        content:
          "Login und Registrierung für Fahrschulen und Kursanbieter, um eigene Angaben und Termine zu verwalten.",
      },
      { property: "og:title", content: "Anbieter-Login" },
      { property: "og:description", content: "Eigene Kursdaten und Termine selbst verwalten." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthSeite,
});

const feldKlasse =
  "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function AuthSeite() {
  const navigate = useNavigate();
  const [modus, setModus] = useState<"login" | "registrieren">("login");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLaedt(true);
    setMeldung(null);
    try {
      if (modus === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
        if (error) throw error;
        navigate({ to: "/mein-konto" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: passwort,
          options: { emailRedirectTo: `${window.location.origin}/mein-konto` },
        });
        if (error) throw error;
        setMeldung("Konto erstellt. Bitte bestätige die E-Mail, danach kannst du dich anmelden.");
      }
    } catch (error) {
      setMeldung(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Für Anbieter"
        title={modus === "login" ? "Anbieter-Login" : "Anbieterkonto erstellen"}
        lead="Melde dich an, um deine Angaben und deine Termine-Seite zu verwalten."
      />
      <form
        onSubmit={onSubmit}
        className="max-w-md rounded-3xl bg-card p-6 shadow-[0_10px_30px_-22px_rgba(51,43,56,0.6)]"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={feldKlasse}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold">Passwort</span>
          <input
            type="password"
            required
            minLength={6}
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            className={feldKlasse}
          />
        </label>
        {meldung ? <p className="mt-3 text-sm text-muted-foreground">{meldung}</p> : null}
        <button
          type="submit"
          disabled={laedt}
          className="mt-5 w-full rounded-full bg-coral px-6 py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {modus === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
        <button
          type="button"
          onClick={() => setModus(modus === "login" ? "registrieren" : "login")}
          className="mt-3 w-full text-sm font-semibold text-coral"
        >
          {modus === "login" ? "Noch kein Konto? Jetzt registrieren" : "Ich habe bereits ein Konto"}
        </button>
      </form>
    </SiteShell>
  );
}
