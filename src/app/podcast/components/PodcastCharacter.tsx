export default function PodcastCharacter({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="pcBg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#9B7BFF" />
          <stop offset="100%" stopColor="#3B1E8A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pcMic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD24C" />
          <stop offset="100%" stopColor="#E8A60E" />
        </linearGradient>
        <linearGradient id="pcSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A4A2B" />
          <stop offset="100%" stopColor="#5A3320" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="110" fill="url(#pcBg)" />

      {/* sound waves */}
      <g stroke="#FFD24C" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M40 120 Q35 110 40 100" />
        <path d="M28 130 Q18 120 28 100" />
        <path d="M200 120 Q205 110 200 100" />
        <path d="M212 130 Q222 120 212 100" />
      </g>

      {/* head + hair (rounded coily hair shape) */}
      <path d="M70 95 q0 -50 50 -50 q50 0 50 50 q0 12 -4 22 q-4 -8 -10 -10 q-4 -10 -16 -14 q-12 12 -34 12 q-22 0 -32 -10 q-4 6 -8 12 q4 -8 4 -12z" fill="#1A0B3D" />
      <ellipse cx="120" cy="120" rx="42" ry="46" fill="url(#pcSkin)" />
      {/* hair top puffs */}
      <circle cx="92" cy="78" r="14" fill="#1A0B3D" />
      <circle cx="120" cy="68" r="16" fill="#1A0B3D" />
      <circle cx="148" cy="78" r="14" fill="#1A0B3D" />
      <circle cx="78" cy="92" r="11" fill="#1A0B3D" />
      <circle cx="162" cy="92" r="11" fill="#1A0B3D" />

      {/* headphones band */}
      <path d="M72 110 q48 -52 96 0" stroke="#FFD24C" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* ear cups */}
      <rect x="62" y="108" width="18" height="26" rx="6" fill="#FFD24C" />
      <rect x="160" y="108" width="18" height="26" rx="6" fill="#FFD24C" />
      <rect x="64" y="112" width="14" height="18" rx="3" fill="#1A0B3D" opacity="0.35" />
      <rect x="162" y="112" width="14" height="18" rx="3" fill="#1A0B3D" opacity="0.35" />

      {/* eyes */}
      <ellipse cx="106" cy="124" rx="4" ry="5" fill="#0F0820" />
      <ellipse cx="134" cy="124" rx="4" ry="5" fill="#0F0820" />
      <ellipse cx="107" cy="122" rx="1.2" ry="1.4" fill="#fff" />
      <ellipse cx="135" cy="122" rx="1.2" ry="1.4" fill="#fff" />

      {/* smile */}
      <path d="M110 142 q10 8 20 0" stroke="#0F0820" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* shoulders / shirt */}
      <path d="M58 230 q12 -50 62 -50 q50 0 62 50 z" fill="#6C4BFF" />
      <path d="M70 230 q10 -38 50 -38 q40 0 50 38 z" fill="#9B7BFF" opacity="0.6" />

      {/* mic */}
      <rect x="142" y="148" width="14" height="32" rx="7" fill="url(#pcMic)" stroke="#1A0B3D" strokeWidth="1.5" />
      <rect x="138" y="180" width="22" height="4" rx="2" fill="#1A0B3D" />
      <line x1="149" y1="184" x2="149" y2="194" stroke="#1A0B3D" strokeWidth="2" />
    </svg>
  );
}
