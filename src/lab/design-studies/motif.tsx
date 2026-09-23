import type { Motif } from "./studies";

/** The study's signature drawing. Colours come from the concept's own custom
 *  properties, so one drawing serves every palette. Always decorative. */
export function MotifArt({ motif }: { motif: Motif }) {
  return (
    <svg className={`m-art m-${motif}`} viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {art[motif]}
    </svg>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const art: Record<Motif, React.ReactNode> = {
  pulse: (
    <>
      <circle cx="200" cy="150" r="110" className="f-soft" />
      <path className="s-accent m-draw" pathLength="100" d="M20 160h110l18-50 26 110 24-86 14 26h168" />
      <path className="s-accent2" d="M150 200q50 40 100 0" strokeWidth="8" strokeLinecap="round" fill="none" />
    </>
  ),
  leaf: (
    <>
      <path className="f-accent m-sway" d="M200 40c90 40 110 140 20 220C130 200 110 100 200 40Z" />
      <path className="s-bg" d="M205 60c-10 70-10 130 10 190" strokeWidth="3" fill="none" />
      <circle cx="300" cy="220" r="22" className="f-accent2" />
      <circle cx="330" cy="180" r="14" className="f-accent2 m-float" />
    </>
  ),
  sun: (
    <>
      <circle cx="200" cy="210" r="120" className="f-accent m-rise" />
      <circle cx="200" cy="210" r="80" className="f-accent2 m-rise" />
      {range(6).map(i => (
        <rect key={i} x="0" y={220 + i * 14} width="400" height={4 + i} className="f-bg" />
      ))}
    </>
  ),
  lines: (
    <>
      {range(11).map(i => (
        <line key={i} x1="30" x2="370" y1={40 + i * 22} y2={40 + i * 22} className="s-muted" strokeWidth="1" />
      ))}
      <line x1="80" x2="80" y1="20" y2="290" className="s-accent" strokeWidth="2" />
      <rect x="140" y="70" width="150" height="190" className="f-surface s-ink" strokeWidth="2" />
      <rect x="160" y="90" width="150" height="190" className="f-accent m-float" />
    </>
  ),
  rings: (
    <>
      {range(5).map(i => (
        <circle key={i} cx="200" cy="150" r={30 + i * 28} className="s-accent m-spin" strokeWidth="2" fill="none" strokeDasharray={`${8 + i * 6} ${10 + i * 4}`} />
      ))}
      <circle cx="200" cy="150" r="18" className="f-accent2" />
      <rect x="250" y="190" width="110" height="64" rx="12" className="f-surface s-accent m-float" strokeWidth="1.5" />
      <rect x="264" y="206" width="50" height="8" rx="4" className="f-accent" />
      <rect x="264" y="224" width="80" height="12" rx="4" className="f-accent2" />
    </>
  ),
  arches: (
    <>
      {range(3).map(i => (
        <path key={i} d={`M${60 + i * 100} 290V150a50 50 0 0 1 100 0v140`} className={i === 1 ? "f-accent" : "f-soft"} />
      ))}
      <path d="M160 290V150a50 50 0 0 1 100 0v140" className="s-ink" strokeWidth="2" fill="none" />
      <circle cx="210" cy="118" r="10" className="f-accent2 m-float" />
    </>
  ),
  blocks: (
    <>
      <rect x="40" y="130" width="80" height="170" className="f-soft" />
      <rect x="130" y="60" width="90" height="240" className="f-accent" />
      <rect x="230" y="110" width="70" height="190" className="f-ink" />
      <rect x="310" y="170" width="60" height="130" className="f-soft" />
      {range(6).map(i => (
        <rect key={i} x={146 + (i % 2) * 34} y={80 + Math.floor(i / 2) * 40} width="22" height="26" className="f-accent2 m-blink" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </>
  ),
  stripes: (
    <>
      {range(14).map(i => (
        <rect key={i} x={-200 + i * 50} y="-50" width="22" height="420" transform={`rotate(-30 ${-200 + i * 50} 0)`} className={i % 4 === 0 ? "f-accent2" : "f-accent"} opacity={i % 4 === 0 ? 1 : 0.9} />
      ))}
      <rect x="0" y="0" width="400" height="300" className="f-bg" opacity="0.35" />
    </>
  ),
  dots: (
    <>
      <circle cx="200" cy="160" r="100" className="f-accent" />
      <circle cx="200" cy="160" r="70" className="f-surface" />
      {range(22).map(i => (
        <rect
          key={i}
          x={200 + Math.cos(i * 1.7) * (40 + (i % 5) * 34)}
          y={160 + Math.sin(i * 1.7) * (30 + (i % 5) * 26)}
          width="14"
          height="5"
          rx="2.5"
          transform={`rotate(${i * 37} ${200 + Math.cos(i * 1.7) * (40 + (i % 5) * 34)} ${160 + Math.sin(i * 1.7) * (30 + (i % 5) * 26)})`}
          className={i % 2 ? "f-accent2 m-float" : "f-ink"}
        />
      ))}
    </>
  ),
  columns: (
    <>
      <path d="M60 100 200 40l140 60Z" className="f-accent" />
      {range(5).map(i => (
        <rect key={i} x={80 + i * 56} y="110" width="22" height="150" className="f-soft" />
      ))}
      <rect x="50" y="262" width="300" height="14" className="f-accent" />
      <line x1="200" y1="40" x2="200" y2="20" className="s-accent" strokeWidth="3" />
    </>
  ),
  route: (
    <>
      <path className="s-muted" d="M40 250c60-10 60-90 120-100s80 60 140 30 40-110 70-120" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.25" />
      <path className="s-accent m-dash" d="M40 250c60-10 60-90 120-100s80 60 140 30 40-110 70-120" strokeWidth="4" fill="none" strokeDasharray="10 10" strokeLinecap="round" />
      <circle cx="40" cy="250" r="10" className="f-ink" />
      <path d="M370 40c-16 0-26 12-26 26 0 20 26 42 26 42s26-22 26-42c0-14-10-26-26-26Z" className="f-accent m-float" />
    </>
  ),
  rays: (
    <>
      {range(9).map(i => (
        <path key={i} d={`M400 0 L${400 - Math.cos((i * 10 + 5) * Math.PI / 180) * 520} ${Math.sin((i * 10 + 5) * Math.PI / 180) * 520} L${400 - Math.cos((i * 10 + 9) * Math.PI / 180) * 520} ${Math.sin((i * 10 + 9) * Math.PI / 180) * 520}Z`} className="f-accent m-pulse" opacity={0.18 + (i % 3) * 0.12} style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      <circle cx="400" cy="0" r="90" className="f-accent" />
      <rect x="40" y="170" width="150" height="90" rx="14" className="f-accent2" transform="skewX(-18)" />
      {range(3).map(i => (
        <line key={i} x1={52 + i * 50} y1="170" x2={22 + i * 50} y2="260" className="s-bg" strokeWidth="3" />
      ))}
    </>
  ),
  stitch: (
    <>
      {range(9).map(row =>
        range(13).map(col => {
          const d = Math.abs(col - 6) + Math.abs(row - 4);
          if (d > 6 || d % 2 === 1) return null;
          const x = 50 + col * 25;
          const y = 40 + row * 25;
          return (
            <g key={`${row}-${col}`} className={d % 4 === 0 ? "s-accent" : "s-accent2"} strokeWidth="4" strokeLinecap="round">
              <line x1={x} y1={y} x2={x + 16} y2={y + 16} />
              <line x1={x + 16} y1={y} x2={x} y2={y + 16} />
            </g>
          );
        }),
      )}
    </>
  ),
  grid: (
    <>
      {range(17).map(i => (
        <line key={`v${i}`} x1={i * 25} x2={i * 25} y1="0" y2="300" className="s-accent" strokeWidth="0.6" opacity="0.25" />
      ))}
      {range(13).map(i => (
        <line key={`h${i}`} y1={i * 25} y2={i * 25} x1="0" x2="400" className="s-accent" strokeWidth="0.6" opacity="0.25" />
      ))}
      <rect x="75" y="75" width="100" height="100" rx="20" className="f-accent m-float" />
      <circle cx="262" cy="125" r="50" className="f-accent2" />
      <path d="M150 250 200 180l50 70Z" className="f-ink" />
    </>
  ),
  waves: (
    <>
      {range(5).map(i => (
        <path
          key={i}
          d={`M-40 ${120 + i * 38} q 50 -30 100 0 t 100 0 t 100 0 t 100 0 t 100 0`}
          className={`${i === 0 ? "s-accent2" : "s-accent"} m-wave`}
          strokeWidth={i === 0 ? 6 : 4}
          fill="none"
          opacity={1 - i * 0.16}
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <circle cx="310" cy="70" r="30" className="f-accent2" />
    </>
  ),
  frames: (
    <>
      <rect x="40" y="40" width="150" height="200" className="f-surface s-ink" strokeWidth="2" />
      <rect x="60" y="60" width="110" height="160" className="f-soft" />
      <rect x="215" y="70" width="140" height="100" className="f-surface s-ink" strokeWidth="2" />
      <circle cx="285" cy="120" r="30" className="f-accent2 m-float" />
      <rect x="215" y="190" width="60" height="70" className="f-ink" />
      <rect x="290" y="190" width="65" height="70" className="f-surface s-ink" strokeWidth="2" />
    </>
  ),
  sound: (
    <>
      {range(31).map(i => {
        const h = 20 + Math.abs(Math.sin(i * 0.55) * 130) + (i % 3) * 12;
        return (
          <rect key={i} x={14 + i * 12.5} y={150 - h / 2} width="6" height={h} rx="3" className={i % 5 === 0 ? "f-accent2 m-eq" : "f-accent m-eq"} style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
        );
      })}
    </>
  ),
};
