// Recreates the supplied reference logo:
// rounded lavender/pink tile, camera icon, and the words
// "Chronos Moments" in a cursive script. Pure SVG so it scales crisply.
// `tone` switches the palette so it works on both light and dark surfaces.
export default function Logo({ size = 96, className = '', tone = 'light' }) {
  const isDark = tone === 'dark';

  // Tile + stroke + text colours switch with the surface.
  const tileClass = isDark
    ? 'bg-white/10 ring-1 ring-white/20 backdrop-blur'
    : 'bg-lav-200 shadow-soft';
  const stroke = isDark ? '#FFFFFF' : '#1F1B20';
  const text   = isDark ? '#FFFFFF' : '#1F1B20';
  const dotFill = isDark ? '#D429F3' : '#D429F3';

  return (
    <div
      className={'inline-flex items-center justify-center rounded-2xl ' + tileClass + ' ' + className}
      style={{ width: size * 1.6, height: size }}
      aria-label="Chronos Moments"
    >
      <svg
        viewBox="0 0 200 120"
        width={size * 1.6}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* camera */}
        <g
          fill="none"
          stroke={stroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(20 20) scale(0.7)"
        >
          <rect x="6" y="22" width="68" height="50" rx="8" />
          <path d="M22 22l6-10h24l6 10" />
          <circle cx="40" cy="47" r="14" />
          <circle cx="40" cy="47" r="6" />
          <circle cx="62" cy="32" r="2.2" fill={dotFill} stroke="none" />
        </g>
        {/* text */}
        <text
          x="100"
          y="56"
          textAnchor="middle"
          fontFamily='"Great Vibes", cursive'
          fontSize="44"
          fill={text}
        >
          Chronos
        </text>
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fontFamily='"Great Vibes", cursive'
          fontSize="44"
          fill={text}
        >
          Moments
        </text>
      </svg>
    </div>
  );
}
