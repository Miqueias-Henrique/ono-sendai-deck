import React from 'react';

export default function WintermuteCoreSvg({ iceShield = 100, playerIntegrity = 100 }) {
  const breached = iceShield <= 0;
  const damaged = iceShield > 0 && iceShield < 60;
  const coreColor = breached ? 'var(--phosphor-green)' : damaged ? 'var(--phosphor-primary)' : 'var(--phosphor-alert)';
  const outerOpacity = Math.max(0.18, iceShield / 100);
  const scaleFactor = breached ? 0.88 : 0.94 + (iceShield / 100) * 0.1;

  return (
    <div className="wintermute-core-visual" aria-hidden="true">
      <svg viewBox="0 0 240 240" className="wintermute-core-svg">
        <defs>
          <radialGradient id="core-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={coreColor} stopOpacity={breached ? '0.32' : '0.24'} />
            <stop offset="68%" stopColor={coreColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="120" cy="120" r="112" fill="url(#core-aura)" />

        {/* Outer Azimuth Firewall Ring */}
        <circle
          cx="120"
          cy="120"
          r="94"
          fill="none"
          stroke={coreColor}
          strokeWidth="1.2"
          strokeOpacity={outerOpacity}
          strokeDasharray={breached ? '6 14' : damaged ? '28 12' : '110 8'}
          className="core-spin-slow"
        />

        {/* Secondary Tessier-Ashpool Orbit */}
        <circle
          cx="120"
          cy="120"
          r="72"
          fill="none"
          stroke="var(--phosphor-secondary)"
          strokeWidth="1"
          strokeOpacity={breached ? 0.75 : 0.35}
          strokeDasharray="18 10 4 10"
          className="core-spin-reverse"
        />

        {/* Inner Geometric Hex-Lattice ICE Shield */}
        <g
          transform={`translate(120 120) scale(${scaleFactor}) translate(-120 -120)`}
          style={{ transition: 'transform 0.4s ease' }}
        >
          <polygon
            points="120,56 175,88 175,152 120,184 65,152 65,88"
            fill="none"
            stroke={coreColor}
            strokeWidth="1.4"
            strokeOpacity={breached ? 0.35 : 0.85}
            strokeDasharray={breached ? '4 6' : 'none'}
          />
          <polygon
            points="120,74 160,97 160,143 120,166 80,143 80,97"
            fill="none"
            stroke="var(--phosphor-primary)"
            strokeWidth="1"
            strokeOpacity={0.55}
          />
        </g>

        {/* Crosshair Axes */}
        <line x1="20" y1="120" x2="220" y2="120" stroke="var(--hairline)" strokeWidth="0.75" />
        <line x1="120" y1="20" x2="120" y2="220" stroke="var(--hairline)" strokeWidth="0.75" />

        {/* Central AI Pupil */}
        <circle
          cx="120"
          cy="120"
          r={breached ? 16 : 22}
          fill="none"
          stroke={coreColor}
          strokeWidth="2"
          style={{ transition: 'r 0.35s ease' }}
        />
        <circle
          cx="120"
          cy="120"
          r={playerIntegrity > 0 ? 5.5 : 2}
          fill={coreColor}
        />

        <text
          x="120"
          y="226"
          textAnchor="middle"
          fill={coreColor}
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="2"
        >
          {breached ? 'ICE QUEBRADO · STRATA ABERTA' : `WINTERMUTE ICE // ${iceShield}%`}
        </text>
      </svg>
    </div>
  );
}
