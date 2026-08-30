import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  GUTSCHEIN_CODE,
  GUTSCHEIN_TEXT,
  trackGutscheinKlick,
} from "@/lib/gutschein.functions";

type Props = {
  offen: boolean;
  onClose: () => void;
  anbieterId: string;
  anbieterName: string;
  kontaktHref?: string | null;
};

export function GutscheinModal({ offen, onClose, anbieterId, anbieterName, kontaktHref }: Props) {
  const track = useServerFn(trackGutscheinKlick);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sende" | "ok" | "fehler">("idle");
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    if (!offen) return;
    setStatus("idle");
    setKopiert(false);
    void track({ data: { anbieter_id: anbieterId } }).catch(() => {});
  }, [offen, anbieterId]);

  if (!offen) return null;

  async function sichern(e: React.FormEvent) {
    e.preventDefault();
    const wert = email.trim();
    if (!wert) return;
    setStatus("sende");
    try {
      const res = await track({ data: { anbieter_id: anbieterId, email: wert } });
      setStatus(res.ok ? "ok" : "fehler");
    } catch {
      setStatus("fehler");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Gutscheincode"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-[0_30px_60px_-30px_rgba(51,43,56,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-bold">Dein Gutschein 🎁</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schliessen"
            className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Bevor du {anbieterName} kontaktierst: {GUTSCHEIN_TEXT}
        </p>

        <div className="mt-4 rounded-2xl bg-mint px-5 py-4 text-center">
          <span className="font-display text-3xl font-bold tracking-widest text-teal">
            {GUTSCHEIN_CODE}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(GUTSCHEIN_CODE);
              setKopiert(true);
            }}
            className="rounded-full bg-muted px-4 py-2 font-display text-sm font-semibold"
          >
            {kopiert ? "Kopiert ✓" : "Code kopieren"}
          </button>
          <a
            href="https://onlinedrivecoach.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-foreground px-4 py-2 font-display text-sm font-semibold text-primary-foreground hover:bg-coral"
          >
            Zu onlinedrivecoach.ch
          </a>
          {kontaktHref ? (
            <a
              href={kontaktHref}
              className="rounded-full bg-sun px-4 py-2 font-display text-sm font-semibold text-foreground"
            >
              Weiter zum Anbieter
            </a>
          ) : null}
        </div>

        <form onSubmit={sichern} className="mt-5 border-t border-border pt-4">
          <label htmlFor="gutschein-email" className="text-sm font-medium">
            Optional: Code per E-Mail sichern
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Freiwillig — der Code oben gilt auch ohne E-Mail.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="gutschein-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.ch"
              className="flex-1 rounded-2xl bg-muted px-4 py-3 text-sm font-medium outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              disabled={status === "sende"}
              className="rounded-full bg-teal px-4 py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {status === "sende" ? "…" : "Code per E-Mail sichern"}
            </button>
          </div>
          {status === "ok" ? (
            <p className="mt-2 text-xs font-medium text-teal">
              Gespeichert — wir schicken dir den Code an {email.trim()}.
            </p>
          ) : null}
          {status === "fehler" ? (
            <p className="mt-2 text-xs font-medium text-coral">
              Das hat nicht geklappt. Der Code oben bleibt gültig.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
