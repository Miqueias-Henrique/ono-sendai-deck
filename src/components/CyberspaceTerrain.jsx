import React, { useEffect, useRef } from 'react';
import fx from '../fx/fx.js';
import dotTerrain from '../fx/dot-terrain/effect.js';

function getCyberspacePalette(chassis, phosphor) {
  const isGreen = phosphor === 'green';

  if (chassis === 'titanium') {
    return {
      bg: '#050A0E',
      surface: '#0A141D',
      ink: '#7D9AB0',
      muted: '#3F5566',
      accent: isGreen ? '#38F27F' : '#00E5B8',
      accentInk: '#050A0E',
    };
  }

  if (chassis === 'gold-24k') {
    return {
      bg: '#090703',
      surface: '#140F05',
      ink: '#A8915C',
      muted: '#5D4E2C',
      accent: isGreen ? '#38F27F' : '#FFC837',
      accentInk: '#090703',
    };
  }

  return {
    bg: '#06080B',
    surface: '#0D1218',
    ink: '#9A9284',
    muted: '#4E4A43',
    accent: isGreen ? '#38F27F' : '#FFB000',
    accentInk: '#06080B',
  };
}

export default function CyberspaceTerrain({ chassis = 'obsidian', phosphor = 'amber' }) {
  const stageRef = useRef(null);
  const ctrlRef = useRef(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    let disposed = false;
    const palette = getCyberspacePalette(chassis, phosphor);

    const rafId = requestAnimationFrame(() => {
      if (disposed) return;
      fx.mount(el, dotTerrain, {
        palette,
        params: {
          spacing: 14,
          dot: 2.7,
          amplitude: 0.21,
          waveScale: 0.85,
          speed: 0.09,
          opacity: 0.86,
          shade: 0.78,
          crest: 0.94,
          horizon: 0.23,
          fog: 0.36,
          haze: 0.44,
          calm: 0.78,
          calmX: 0.25,
          calmY: 0.48,
        },
        seed: 1984,
      })
        .then((ctrl) => {
          if (disposed) {
            ctrl?.destroy();
            return;
          }
          ctrlRef.current = ctrl;
        })
        .catch(() => {
          // Fallback CSS handled automatically by fx.js
        });
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (ctrlRef.current) {
        ctrlRef.current.destroy();
        ctrlRef.current = null;
      }
    };
    // Mount once per stage lifecycle; updates use setPalette below cleanly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ctrlRef.current) return;
    ctrlRef.current.setPalette(getCyberspacePalette(chassis, phosphor));
  }, [chassis, phosphor]);

  return (
    <div className="cyberspace-bg-wrap" aria-hidden="true">
      <div ref={stageRef} className="cyberspace-bg-stage" />
      <div className="cyberspace-horizon-glow" />
      <div className="cyberspace-vignette" />
    </div>
  );
}
