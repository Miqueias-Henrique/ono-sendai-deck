import React, { useMemo } from 'react';

const VB_W = 1160;
const VB_H = 240;
const PAD_X = 36;
const PAD_TOP = 32;
const PAD_BOTTOM = 44;

function catmullRomToBezierPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  const tension = 0.22;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function NeuralWaveMatrix({ pins, selectedPin, onHoverPin, onSelectPin, onStepPin }) {
  const { points, curvePath, areaPath, harmonicPath, baselineY } = useMemo(() => {
    const usableW = VB_W - PAD_X * 2;
    const usableH = VB_H - PAD_TOP - PAD_BOTTOM;
    const baseY = VB_H - PAD_BOTTOM;
    const maxCommits = Math.max(...pins.map((p) => p.commits), 280);
    const minCommits = Math.min(...pins.map((p) => p.commits), 0);
    const span = Math.max(1, maxCommits - minCommits);

    const mapped = pins.map((pin, idx) => {
      const ratioX = pins.length > 1 ? idx / (pins.length - 1) : 0.5;
      const ratioY = (pin.commits - minCommits) / span;
      const x = PAD_X + ratioX * usableW;
      const y = baseY - (0.14 + ratioY * 0.86) * usableH;
      return {
        pin,
        idx,
        x,
        y,
        xPct: (x / VB_W) * 100,
        yPct: (y / VB_H) * 100,
      };
    });

    const harmonicPts = mapped.map((m, idx) => ({
      x: m.x,
      y: baseY - 26 - Math.sin(idx * 0.55) * 18 - (idx / pins.length) * 48,
    }));

    const line = catmullRomToBezierPath(mapped);
    const first = mapped[0];
    const last = mapped[mapped.length - 1];
    const area = first && last
      ? `${line} L ${last.x.toFixed(2)} ${baseY} L ${first.x.toFixed(2)} ${baseY} Z`
      : '';
    const harmonic = catmullRomToBezierPath(harmonicPts);

    return {
      points: mapped,
      curvePath: line,
      areaPath: area,
      harmonicPath: harmonic,
      baselineY: baseY,
    };
  }, [pins]);

  const activePt = points.find((pt) => pt.pin.id === selectedPin.id) || points[points.length - 1];
  const milestoneIndices = [0, 4, 8, 17, 25];

  return (
    <div className="neural-matrix-stage">
      <div className="neural-scroll-frame">
        <div className="neural-wave-canvas">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="neural-wave-svg"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="neural-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--phosphor-primary)" stopOpacity="0.24" />
                <stop offset="70%" stopColor="var(--phosphor-primary)" stopOpacity="0.04" />
                <stop offset="100%" stopColor="var(--phosphor-primary)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neural-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--phosphor-primary)" stopOpacity="0.45" />
                <stop offset="65%" stopColor="var(--phosphor-primary)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--phosphor-secondary)" stopOpacity="1" />
              </linearGradient>
              <filter id="neural-glow" x="-10%" y="-25%" width="120%" height="150%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Cyberspace Horizon Guides */}
            {[0.25, 0.5, 0.75, 1].map((step) => {
              const gy = baselineY - step * (VB_H - PAD_TOP - PAD_BOTTOM);
              return (
                <line
                  key={step}
                  x1={PAD_X}
                  y1={gy}
                  x2={VB_W - PAD_X}
                  y2={gy}
                  stroke="var(--hairline)"
                  strokeWidth="1"
                  strokeDasharray="2 7"
                />
              );
            })}

            {/* Baseline Axis */}
            <line
              x1={PAD_X}
              y1={baselineY}
              x2={VB_W - PAD_X}
              y2={baselineY}
              stroke="var(--hairline-strong)"
              strokeWidth="1"
            />

            {/* Key Year Vertical Ticks */}
            {milestoneIndices.map((idx) => {
              const pt = points[idx];
              if (!pt) return null;
              return (
                <g key={pt.pin.id}>
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={baselineY + 6}
                    stroke="var(--hairline)"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={VB_H - 12}
                    textAnchor={idx === 0 ? 'start' : idx === 25 ? 'end' : 'middle'}
                    fill="var(--ink-muted)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                  >
                    {pt.pin.code}
                  </text>
                </g>
              );
            })}

            {/* Secondary Harmonic Ghost Wave */}
            <path
              d={harmonicPath}
              fill="none"
              stroke="var(--phosphor-secondary)"
              strokeWidth="1"
              strokeOpacity="0.28"
              strokeDasharray="4 6"
            />

            {/* Fluid Area Wash & Primary Signal Spline */}
            <path d={areaPath} fill="url(#neural-area-grad)" />
            <path
              d={curvePath}
              fill="none"
              stroke="url(#neural-line-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#neural-glow)"
            />

            {/* Active Cursor Beam & Sonar Ring */}
            {activePt && (
              <g className="neural-active-beacon">
                <line
                  x1={activePt.x}
                  y1={PAD_TOP - 10}
                  x2={activePt.x}
                  y2={baselineY}
                  stroke="var(--phosphor-primary)"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="15"
                  fill="none"
                  stroke="var(--phosphor-primary)"
                  strokeWidth="1"
                  strokeOpacity="0.45"
                />
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="24"
                  fill="none"
                  stroke="var(--phosphor-secondary)"
                  strokeWidth="0.75"
                  strokeOpacity="0.28"
                />
                <circle
                  cx={activePt.x}
                  cy={activePt.y}
                  r="6"
                  fill="var(--phosphor-primary)"
                  stroke="var(--ink-primary)"
                  strokeWidth="1.75"
                />
              </g>
            )}
          </svg>

          {/* Accessible Circular Orbital Nodes synchronized cleanly over spline points */}
          <div className="neural-nodes-layer" role="list" aria-label="Nós da linha neural de telemetria">
            {points.map(({ pin, xPct, yPct }) => {
              const isActive = pin.id === selectedPin.id;
              return (
                <button
                  key={pin.id}
                  type="button"
                  role="listitem"
                  className={`neural-node-dot ${isActive ? 'active' : ''}`}
                  data-level={pin.level}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  title={`${pin.code} (${pin.commits} pulsos): ${pin.label}`}
                  aria-label={`Marco ${pin.code}, ${pin.commits} pulsos: ${pin.label}`}
                  aria-pressed={isActive}
                  onMouseEnter={() => onHoverPin(pin)}
                  onFocus={() => onHoverPin(pin)}
                  onClick={() => onSelectPin(pin)}
                >
                  <span className="sr-only">{pin.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Borderless Live Signal Readout Footer */}
      <div className="neural-readout-row" aria-live="polite">
        <div className="neural-readout-info">
          <div className="neural-readout-badge t-nums">
            <span className="pulse-dot" aria-hidden="true" />
            <span>{selectedPin.code}</span>
            <span style={{ color: 'var(--ink-muted)' }}>·</span>
            <span>{selectedPin.commits} PULSOS</span>
          </div>
          <p className="neural-readout-text">{selectedPin.label}</p>
        </div>

        <div className="neural-step-controls">
          <button
            type="button"
            className="cmd-link"
            onClick={() => onStepPin(-1)}
            aria-label="Marco anterior na trajetória"
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="cmd-link"
            onClick={() => onStepPin(1)}
            aria-label="Próximo marco na trajetória"
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  );
}
