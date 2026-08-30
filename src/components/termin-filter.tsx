import { useMemo, useState } from "react";

export type TerminOption = "jederzeit" | "2w" | "4w" | "3m" | "datum";

const OPTIONEN: Array<{ wert: TerminOption; label: string }> = [
  { wert: "jederzeit", label: "Jederzeit" },
  { wert: "2w", label: "Nächste 2 Wochen" },
  { wert: "4w", label: "Nächste 4 Wochen" },
  { wert: "3m", label: "Nächste 3 Monate" },
  { wert: "datum", label: "Datum wählen" },
];

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function inTagen(tage: number) {
  const d = new Date();
  d.setDate(d.getDate() + tage);
  return iso(d);
}

export function useTerminFilter() {
  const [option, setOption] = useState<TerminOption>("jederzeit");
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");

  const fenster = useMemo(() => {
    const heute = iso(new Date());
    switch (option) {
      case "2w":
        return { von: heute, bis: inTagen(14) };
      case "4w":
        return { von: heute, bis: inTagen(28) };
      case "3m":
        return { von: heute, bis: inTagen(92) };
      case "datum":
        return { von: von || undefined, bis: bis || undefined };
      default:
        return { von: undefined as string | undefined, bis: undefined as string | undefined };
    }
  }, [option, von, bis]);

  return { option, setOption, von, setVon, bis, setBis, fenster };
}

export function TerminFilter({
  option,
  setOption,
  von,
  setVon,
  bis,
  setBis,
}: ReturnType<typeof useTerminFilter>) {
  return (
    <div className="mt-4 px-1 pb-1">
      <span className="text-xs font-semibold text-muted-foreground">
        Wann suchst du einen Kurs?
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONEN.map((o) => (
          <button
            key={o.wert}
            type="button"
            onClick={() => setOption(o.wert)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              option === o.wert
                ? "bg-foreground text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-coral"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {option === "datum" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <label className="flex items-center gap-2">
            von
            <input
              type="date"
              value={von}
              onChange={(e) => setVon(e.target.value)}
              className="rounded-xl bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none"
            />
          </label>
          <label className="flex items-center gap-2">
            bis
            <input
              type="date"
              value={bis}
              min={von || undefined}
              onChange={(e) => setBis(e.target.value)}
              className="rounded-xl bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none"
            />
          </label>
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Anbieter ohne erfasste Kurstermine bleiben sichtbar — dort findest du die Daten direkt auf
        der Anbieter-Website.
      </p>
    </div>
  );
}
