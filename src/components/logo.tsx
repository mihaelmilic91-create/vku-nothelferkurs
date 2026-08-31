export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <path
        d="M48,88 L18,24 Q18,14 30,14 L66,14 Q78,14 78,24 Z"
        fill="var(--coral)"
      />
      <path
        d="M34,44 L44,56 L64,32"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="82" cy="14" r="7" fill="var(--teal)" />
    </svg>
  );
}
