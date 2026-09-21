import { useId } from 'react';
import type { Color, PieceKind } from '@/types/chess';

interface PieceIconProps {
  color: Color;
  kind: PieceKind;
  className?: string;
}

// Stylized faceted piece silhouettes on a 100x100 viewBox.
const BODY_PATHS: Record<PieceKind, string[]> = {
  p: [
    'M50,20 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0 Z',
    'M40,38 L60,38 L58,32 L42,32 Z',
    'M42,38 L36,80 L64,80 L58,38 Z',
    'M30,92 L70,92 L67,82 L33,82 Z',
  ],
  r: [
    'M34,34 L34,20 L42,20 L42,27 L48,27 L48,20 L52,20 L52,27 L58,27 L58,20 L66,20 L66,34 Z',
    'M38,34 L35,80 L65,80 L62,34 Z',
    'M29,92 L71,92 L68,82 L32,82 Z',
  ],
  n: [
    'M35,82 L35,64 L29,58 C25,54 25,48 29,44 L39,33 C41,30 43,27 43,23 L45,13 L53,21 L63,25 C69,28 72,34 70,40 L66,48 C64,52 59,53 55,50 L49,46 C47,52 48,59 52,65 L57,71 L57,82 Z',
    'M28,92 L72,92 L70,84 L30,84 Z',
  ],
  b: [
    'M50,18 C42,26 38,35 38,46 C38,57 44,66 50,70 C56,66 62,57 62,46 C62,35 58,26 50,18 Z',
    'M50,12 m-4.5,0 a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0 Z',
    'M41,74 L59,74 L59,69 L41,69 Z',
    'M45,74 L44,82 L56,82 L55,74 Z',
    'M33,92 L67,92 L65,82 L35,82 Z',
  ],
  q: [
    'M28,54 L24,26 L37,42 L44,20 L50,38 L56,20 L63,42 L76,26 L72,54 Z',
    'M24,22 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M44,16 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M56,16 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M76,22 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z',
    'M34,54 L66,54 L62,80 L38,80 Z',
    'M29,92 L71,92 L68,82 L32,82 Z',
  ],
  k: [
    'M47,12 L53,12 L53,19 L60,19 L60,25 L53,25 L53,32 L47,32 L47,25 L40,25 L40,19 L47,19 Z',
    'M31,58 L29,36 L40,46 L50,34 L60,46 L71,36 L69,58 Z',
    'M34,58 L66,58 L62,80 L38,80 Z',
    'M29,92 L71,92 L68,82 L32,82 Z',
  ],
};

// Small bright specular dot per piece (top-left of its uppermost feature).
const SPECULAR: Record<PieceKind, { cx: number; cy: number; r: number }> = {
  p: { cx: 46, cy: 16, r: 2.6 },
  r: { cx: 39, cy: 24, r: 2.6 },
  n: { cx: 47, cy: 19, r: 2.6 },
  b: { cx: 48.4, cy: 10.4, r: 2 },
  q: { cx: 23, cy: 20.4, r: 1.8 },
  k: { cx: 48.4, cy: 15, r: 2 },
};

export function PieceIcon({ color, kind, className }: PieceIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `piece-grad-${uid}`;
  const glowId = `piece-glow-${uid}`;
  const clipId = `piece-clip-${uid}`;
  const shadowId = `piece-shadow-${uid}`;

  const white = color === 'w';
  const paths = BODY_PATHS[kind];
  const spec = SPECULAR[kind];

  // Icy-clear white vs smoky black crystal.
  const stops = white
    ? [
        { offset: '0%', color: '#ffffff', opacity: 0.96 },
        { offset: '45%', color: '#e6f4fc', opacity: 0.86 },
        { offset: '100%', color: '#9fc8dc', opacity: 0.92 },
      ]
    : [
        { offset: '0%', color: '#7e8fa3', opacity: 0.92 },
        { offset: '45%', color: '#46566a', opacity: 0.9 },
        { offset: '100%', color: '#161d27', opacity: 0.95 },
      ];
  const stroke = white ? '#6f93a8' : '#0a0f16';

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
          ))}
        </linearGradient>
        <radialGradient id={glowId} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={white ? 0.55 : 0.22} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Crystal body: translucent gradient fill with definition stroke + drop shadow */}
      <g
        filter={`url(#${shadowId})`}
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} fill={`url(#${gradId})`} />
        ))}
      </g>

      {/* Inner glow + cut-crystal glints, clipped to the silhouette */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${glowId})`} />
        <polygon points="20,95 36,5 46,5 30,95" fill="#ffffff" opacity={white ? 0.35 : 0.12} />
        <polygon points="54,95 68,5 74,5 62,95" fill="#ffffff" opacity={white ? 0.22 : 0.08} />
      </g>

      {/* Specular highlight */}
      <circle cx={spec.cx} cy={spec.cy} r={spec.r} fill="#ffffff" opacity={white ? 0.85 : 0.35} />
    </svg>
  );
}
