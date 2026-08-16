type MotifProps = {
  className?: string;
  tone?: "gold" | "cream" | "plum";
};

const toneMap: Record<string, string> = {
  gold: "#c8a14a",
  cream: "#f8f5f0",
  plum: "#4b1f6f",
};

/**
 * DewMotif — an original geometric diamond-chain pattern in the spirit of
 * Ankara/wax-print border work, drawn as vector shapes (no photography,
 * no reproduced textile art). Used sparingly as a divider and signature mark.
 */
export function DewMotifDivider({ className = "", tone = "gold" }: MotifProps) {
  const c = toneMap[tone];
  return (
    <svg
      viewBox="0 0 240 16"
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1="0" y1="8" x2="96" y2="8" stroke={c} strokeWidth="1" opacity="0.55" />
      <line x1="144" y1="8" x2="240" y2="8" stroke={c} strokeWidth="1" opacity="0.55" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={104 + i * 8}
          y="4"
          width="8"
          height="8"
          fill={i % 2 === 0 ? c : "none"}
          stroke={c}
          strokeWidth="1"
          transform={`rotate(45 ${108 + i * 8} 8)`}
        />
      ))}
    </svg>
  );
}

export function DewMotifCorner({ className = "", tone = "gold" }: MotifProps) {
  const c = toneMap[tone];
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden="true">
      <path d="M0 32 L32 0 L64 32 L32 64 Z" fill="none" stroke={c} strokeWidth="1" opacity="0.5" />
      <path d="M16 32 L32 16 L48 32 L32 48 Z" fill="none" stroke={c} strokeWidth="1" opacity="0.9" />
      <circle cx="32" cy="32" r="3" fill={c} />
    </svg>
  );
}

/** Low-opacity full-bleed background texture built from the same motif unit. */
export function DewMotifField({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="dewField" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect
            x="14"
            y="14"
            width="12"
            height="12"
            fill="none"
            stroke="#c8a14a"
            strokeWidth="0.75"
            transform="rotate(45 20 20)"
          />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#dewField)" />
    </svg>
  );
}
