import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import {
  PROFILE_DATA,
  ROM_CARTRIDGES,
  TELEMETRY_PINS,
  EMPATHY_SEALS,
} from './data/portfolioData';
import CyberspaceTerrain from './components/CyberspaceTerrain';
import NeuralWaveMatrix from './components/NeuralWaveMatrix';
import RelicConstructDialog from './components/RelicConstructDialog';
import BreachProtocol from './components/BreachProtocol';
import { playKeyclick, playVoightKampffPulse, playRelicGlitch } from './utils/soundEngine';
import useModalFocus from './utils/useModalFocus';

// Workstation OS is only fetched when the visitor switches mode (smaller first load)
const HosakaDesktopOS = lazy(() => import('./components/HosakaDesktopOS'));

const STORAGE_KEY_SEALS = 'ono_sendai_vk_seals_v1';
const IRIS_CIRCUMFERENCE = 2 * Math.PI * 138;

// Hidden keyboard sequences (typed anywhere outside inputs)
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const SECRET_WORDS = {
  ff06b5: 'FF:06:B5 // Sinal magenta interceptado. Johnny-84: "Tem gente que caça esse código há anos. O Miqueias caça Table Scan."',
  samurai: 'SAMURAI // "Never Fade Away" tocando no barramento. Johnny-84: "Wake up, choom — tem query pra otimizar."',
  wakeup: 'WAKE UP, SAMURAI // Johnny-84: "We have a city to burn" — mas aqui a gente só queima latência.',
  afterlife: 'AFTERLIFE // Rogue deixou um recado: "Esse backend aí tem cara de lenda. Contrata antes da Arasaka."',
};


export default function App() {
  const [viewMode, setViewMode] = useState('editorial');
  const [phosphorMode, setPhosphorMode] = useState('amber');
  const [soundOn, setSoundOn] = useState(true);

  // Voight-Kampff Biometric Calibration (0..3 pulses)
  const [vkPulses, setVkPulses] = useState(0);
  const isCalibrated = vkPulses >= 3;

  // Empathy Seals (12 total — evolves Obsidian -> Titanium at 6 -> 24K Gold at 12)
  const [unlockedSeals, setUnlockedSeals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['seal_boot'];
  });

  const [chassisOverride, setChassisOverride] = useState(null);

  // Live telemetry ping fed into Johnny-84 / Dixie / Rachel Relic dialogue
  const [relicPing, setRelicPing] = useState('');

  // Section 01: Hosaka ROM Cartridges
  const [romCategory, setRomCategory] = useState('all');
  const [activeRomId, setActiveRomId] = useState(ROM_CARTRIDGES[0].id);
  const [showTerminalRun, setShowTerminalRun] = useState(false);

  // Section 02: Neural Wave Telemetry Pin
  const [selectedPin, setSelectedPin] = useState(TELEMETRY_PINS[TELEMETRY_PINS.length - 1]);

  // Modals & Notifications
  const [sealsModalOpen, setSealsModalOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const notify = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return undefined;
    const t = setTimeout(() => setToastMsg(''), 3200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const unlockSeal = useCallback((sealId) => {
    setUnlockedSeals((prev) => {
      if (prev.includes(sealId)) return prev;
      const next = [...prev, sealId];
      try {
        localStorage.setItem(STORAGE_KEY_SEALS, JSON.stringify(next));
      } catch {}
      const sealObj = EMPATHY_SEALS.find((s) => s.id === sealId);
      if (sealObj) {
        setToastMsg(`SELO DESBLOQUEADO [${sealObj.code}]: ${sealObj.title}`);
      }
      if (next.length === 6) {
        setRelicPing('Rachel-7: 6 selos conquistados — liga da estação refundida para Titânio Escovado.');
      } else if (next.length === 12) {
        setRelicPing('Johnny-84: Todos os 12 selos na mão, samurai! Ouro 24K Villa Straylight ativo.');
      }
      return next;
    });
  }, []);

  const computedChassis =
    chassisOverride ||
    (unlockedSeals.length >= 12
      ? 'gold-24k'
      : unlockedSeals.length >= 6
      ? 'titanium'
      : 'obsidian');

  useEffect(() => {
    document.documentElement.setAttribute('data-chassis', computedChassis);
  }, [computedChassis]);

  useEffect(() => {
    document.documentElement.setAttribute('data-phosphor', phosphorMode);
  }, [phosphorMode]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
        setSealsModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // One-shot chromatic glitch across the deck (CSS handles reduced motion)
  const triggerGlitch = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove('is-glitching');
    // Force reflow so the animation can replay
    void root.offsetWidth;
    root.classList.add('is-glitching');
    setTimeout(() => root.classList.remove('is-glitching'), 700);
  }, []);

  // Easter eggs: Konami code + secret words typed anywhere outside form fields
  const keyTrailRef = useRef([]);
  useEffect(() => {
    const onSecretKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = (e.key || '').toLowerCase();
      if (!key) return;
      const trail = [...keyTrailRef.current, key].slice(-12);
      keyTrailRef.current = trail;

      if (KONAMI.every((k, i) => trail[trail.length - KONAMI.length + i] === k)) {
        keyTrailRef.current = [];
        triggerGlitch();
        playRelicGlitch(soundOn);
        setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber'));
        setRelicPing('Dixie Flatline: Código Konami na matriz? Respeito, cowboy — espectro de fósforo invertido.');
        notify('↑↑↓↓←→←→BA // Espectro de fósforo invertido.');
        return;
      }

      const typed = trail.filter((k) => k.length === 1).join('');
      const word = Object.keys(SECRET_WORDS).find((w) => typed.endsWith(w));
      if (word) {
        keyTrailRef.current = [];
        triggerGlitch();
        playRelicGlitch(soundOn);
        setRelicPing(SECRET_WORDS[word]);
        notify(SECRET_WORDS[word].split(' // ')[0] + ' // easter egg desbloqueado');
      }
    };
    window.addEventListener('keydown', onSecretKey);
    return () => window.removeEventListener('keydown', onSecretKey);
  }, [soundOn, notify, triggerGlitch]);

  // Fluid section reveal (IntersectionObserver, no layout shift)
  useEffect(() => {
    if (viewMode !== 'editorial') return undefined;
    const els = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [viewMode]);

  const sealsDialogRef = useRef(null);
  const cmdDialogRef = useRef(null);
  useModalFocus(sealsModalOpen, sealsDialogRef);
  useModalFocus(cmdOpen, cmdDialogRef);

  const handleVkPulse = () => {
    setVkPulses((prev) => {
      const next = Math.min(3, prev + 1);
      playVoightKampffPulse(soundOn, next);
      if (next >= 3) {
        unlockSeal('seal_calibrate');
        setRelicPing('Rachel-7: Retina Voight-Kampff em 100% — Empatia 98.4% confirmada no olhar do engenheiro.');
      } else {
        setRelicPing(`Voight-Kampff ajustando foco óptico (${next}/3)...`);
      }
      return next;
    });
  };

  const handleSwitchMode = (mode) => {
    playKeyclick(soundOn, 780);
    setViewMode(mode);
    if (mode === 'os') {
      unlockSeal('seal_os_mode');
    }
  };

  const handleFilterRomCategory = (categoryId) => {
    playKeyclick(soundOn, 700);
    setRomCategory(categoryId);
    const matching =
      categoryId === 'all'
        ? ROM_CARTRIDGES
        : ROM_CARTRIDGES.filter((r) => r.category === categoryId);
    if (matching.length > 0 && !matching.some((r) => r.id === activeRomId)) {
      setActiveRomId(matching[0].id);
      setShowTerminalRun(false);
    }
  };

  const handleSelectRom = (romId) => {
    playKeyclick(soundOn, 720);
    setActiveRomId(romId);
    setShowTerminalRun(false);
    unlockSeal('seal_rom');
  };

  const handleRunRomTerminal = () => {
    playKeyclick(soundOn, 940);
    setShowTerminalRun(true);
    unlockSeal('seal_runner');
    setRelicPing(`Dixie Flatline: Fita "${activeRom.id}" executada com sucesso no cluster Hosaka.`);
    notify('Diagnóstico de container/banco executado com sucesso.');
  };

  const handleCopyText = async (text, label) => {
    playKeyclick(soundOn, 820);
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    unlockSeal('seal_dossier');
    notify(`${label} copiado para a área de transferência.`);
  };

  const handleSelectTelemetryPin = (pin) => {
    playKeyclick(soundOn, 850);
    setSelectedPin(pin);
    unlockSeal('seal_matrix');
  };

  const handleStepTelemetryPin = (delta) => {
    const idx = TELEMETRY_PINS.findIndex((p) => p.id === selectedPin.id);
    const nextIdx = (idx + delta + TELEMETRY_PINS.length) % TELEMETRY_PINS.length;
    handleSelectTelemetryPin(TELEMETRY_PINS[nextIdx]);
  };

  const handleRelicEffect = useCallback(
    (effect) => {
      if (!effect) return;
      if (effect.jumpToRom) {
        setViewMode('editorial');
        setRomCategory('all');
        setActiveRomId(effect.jumpToRom);
        setShowTerminalRun(false);
        unlockSeal('seal_rom');
        setTimeout(() => {
          document.getElementById('sec-rom-bay')?.scrollIntoView({ behavior: 'auto' });
        }, 40);
      } else if (effect.scrollTo) {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById(effect.scrollTo)?.scrollIntoView({ behavior: 'auto' });
        }, 40);
      } else if (effect.calibrateAll) {
        setVkPulses(3);
        playVoightKampffPulse(soundOn, 3);
        unlockSeal('seal_calibrate');
        setRelicPing('Rachel-7: Óptica calibrada via ponte neural Relic 2.0.');
        notify('Retina Voight-Kampff calibrada (98.4% Empatia).');
      } else if (effect.openOs) {
        setViewMode('os');
        unlockSeal('seal_os_mode');
      } else if (effect.openSeals) {
        setSealsModalOpen(true);
      }
    },
    [soundOn, unlockSeal, notify]
  );

  const visibleRoms =
    romCategory === 'all'
      ? ROM_CARTRIDGES
      : ROM_CARTRIDGES.filter((r) => r.category === romCategory);

  const activeRom =
    visibleRoms.find((r) => r.id === activeRomId) || visibleRoms[0] || ROM_CARTRIDGES[0];

  const commandItems = [
    {
      label: 'Conversar com Johnny-84, Dixie Flatline & Rachel-7 (Relic 2.0)',
      sub: 'CANAL NEURAL',
      action: () => {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById('sec-relic-chat')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    },
    {
      label: 'Jogar Breach Protocol contra o ICE Wintermute',
      sub: 'MINIGAME',
      action: () => {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById('sec-icebreaker')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    },
    {
      label: 'Contato direto: e-mail, WhatsApp, LinkedIn e Currículo PDF',
      sub: 'RECRUTAMENTO',
      action: () => {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById('sec-contact')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    },
    {
      label: 'Alternar para Bancada Hosaka OS (6 Ferramentas Integradas)',
      sub: 'WORKSTATION',
      action: () => handleSwitchMode('os'),
    },
    {
      label: 'Alternar para Ciberespaço Tyrell-84 (Dossiê Completo)',
      sub: 'CIBERESPAÇO',
      action: () => handleSwitchMode('editorial'),
    },
    {
      label: 'Calibrar Íris Voight-Kampff (100% Foco)',
      sub: 'BIOMETRIA',
      action: () => {
        setVkPulses(3);
        unlockSeal('seal_calibrate');
        setRelicPing('Rachel-7: Retina Voight-Kampff estabilizada em 98.4%.');
      },
    },
    {
      label: 'Alternar Espectro CRT (Âmbar P3 / Verde P1)',
      sub: 'ESPECTRO',
      action: () => setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber')),
    },
    {
      label: 'Abrir Cofre de Selos Voight-Kampff & Liga',
      sub: `${unlockedSeals.length}/12 SELOS`,
      action: () => setSealsModalOpen(true),
    },
    ...ROM_CARTRIDGES.map((rom) => ({
      label: `Carregar Fita ROM: ${rom.title}`,
      sub: rom.slot,
      action: () => {
        setViewMode('editorial');
        setRomCategory('all');
        handleSelectRom(rom.id);
        setTimeout(() => {
          document.getElementById('sec-rom-bay')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    })),
  ].filter(
    (item) =>
      !cmdQuery.trim() ||
      item.label.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      item.sub.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const irisProgressOffset = IRIS_CIRCUMFERENCE * (1 - vkPulses / 3);

  return (
    <>
      <a href="#main-deck" className="skip-link">
        Pular para o ciberespaço principal
      </a>

      {/* ====================================================================
          FLAT BORDERLESS CYBERSPACE TOP BAR (ZERO CAPSULE-IN-CAPSULE)
          ==================================================================== */}
      <header className="top-console-bar" role="banner">
        <div className="top-console-inner">
          <div className="brand-plate">
            <span className="brand-led" aria-hidden="true" />
            <span className="brand-model-code">ONO-SENDAI VII</span>
            <span className="brand-divider" aria-hidden="true">/</span>
            <span className="brand-sub-tag">
              {computedChassis === 'obsidian'
                ? 'OBSIDIANA 84'
                : computedChassis === 'titanium'
                ? 'TITÂNIO TYRELL'
                : 'OURO 24K'}
            </span>
          </div>

          <nav className="mode-switch-group" aria-label="Modo de operação">
            <button
              type="button"
              aria-pressed={viewMode === 'editorial'}
              className={`mode-switch-btn ${viewMode === 'editorial' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('editorial')}
            >
              <span className="label-full">Ciberespaço &amp; Relic</span>
              <span className="label-short" aria-hidden="true">Ciberespaço</span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'os'}
              className={`mode-switch-btn ${viewMode === 'os' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('os')}
            >
              <span className="label-full">Hosaka OS [6 Apps]</span>
              <span className="label-short" aria-hidden="true">Hosaka OS</span>
            </button>
          </nav>

          <div className="console-right-controls">
            <button
              type="button"
              className="cmd-link"
              onClick={() => {
                playKeyclick(soundOn, 750);
                setCmdOpen(true);
              }}
              title="Abrir paleta de comandos (Ctrl+K)"
              aria-label="Abrir paleta de comandos (Ctrl+K)"
            >
              <span className="label-full">Ctrl+K</span>
              <span className="label-short">⌘ Menu</span>
            </button>

            <button
              type="button"
              className="cmd-link"
              onClick={() => {
                playKeyclick(soundOn, 690);
                setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber'));
              }}
              title="Alternar espectro entre Âmbar P3 e Verde P1"
              aria-label={`Espectro de fósforo: ${phosphorMode === 'amber' ? 'Âmbar P3' : 'Verde P1'}`}
            >
              <span className="label-full">{phosphorMode === 'amber' ? 'Âmbar P3' : 'Verde P1'}</span>
              <span className="label-short">{phosphorMode === 'amber' ? 'P3' : 'P1'}</span>
            </button>

            <button
              type="button"
              className="cmd-link"
              aria-pressed={soundOn}
              aria-label="Som do sintetizador CS-80"
              onClick={() => setSoundOn((s) => !s)}
              title="Ativar ou silenciar sintetizador CS-80"
            >
              <span className="label-full">{soundOn ? 'Som On' : 'Mudo'}</span>
              <span className="label-short">{soundOn ? '♪ On' : '♪ Off'}</span>
            </button>

            <button
              type="button"
              className="seals-status-link t-nums"
              onClick={() => {
                playKeyclick(soundOn, 810);
                setSealsModalOpen(true);
              }}
              title="Abrir Cofre de Selos Voight-Kampff e liga metálica"
            >
              <span className="seals-orb-dot" aria-hidden="true" />
              <span>Selos {unlockedSeals.length}/12</span>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN STAGE: CYBERSPACE SPATIAL DECK VS HOSAKA WORKSTATION OS
          ==================================================================== */}
      <main id="main-deck">
        {viewMode === 'os' ? (
          <Suspense
            fallback={
              <div className="os-loading wrap" role="status">
                Inicializando bancada Hosaka H-84 Workstation OS…
              </div>
            }
          >
            <HosakaDesktopOS
              soundOn={soundOn}
              unlockSeal={unlockSeal}
              notify={notify}
              unlockedSeals={unlockedSeals}
              chassisStage={computedChassis}
              onRelicPing={setRelicPing}
              onReturnToSpace={() => {
                setViewMode('editorial');
                setTimeout(() => {
                  document.getElementById('sec-relic-chat')?.scrollIntoView({ behavior: 'auto' });
                }, 40);
              }}
            />
          </Suspense>
        ) : (
          <div className="cyberspace-flow">
            {/* ================================================================
                SECTION 0: FULL-BLEED CYBERSPACE HERO + ORBITAL IRIS SCANNER
                ================================================================ */}
            <section className="hero-cyberspace" aria-labelledby="hero-heading">
              <CyberspaceTerrain chassis={computedChassis} phosphor={phosphorMode} />

              <div className="wrap hero-grid">
                <div className="hero-copy-col">
                  <div className="hero-eyebrow">
                    <span className="pulse-dot" aria-hidden="true" />
                    <span>DISPONÍVEL · BACKEND JÚNIOR · C# / .NET &amp; SQL SERVER · GOIÂNIA / REMOTO</span>
                  </div>

                  <h1 id="hero-heading" className="hero-title">
                    Miqueias Carvalho.{' '}
                    <span className="hero-accent-phrase">Da query crítica em produção</span> à arquitetura limpa de APIs.
                  </h1>

                  <p className="hero-lead">
                    {PROFILE_DATA.summary} Atualmente na <strong>Zetti</strong> sustentando bancos{' '}
                    <strong>SQL Server</strong> e módulos <strong>VB6</strong> para dezenas de farmácias, e graduando em
                    Engenharia de Software na <strong>UNIFAN (2027)</strong>.
                  </p>

                  <div className="hero-specs-ledger">
                    <div className="hero-spec-item">
                      <small>PRODUÇÃO ATUAL (DEZ/2025)</small>
                      <strong>Zetti · SQL Server &amp; VB6</strong>
                    </div>
                    <div className="hero-spec-item">
                      <small>APIS &amp; ARQUITETURA</small>
                      <strong>C# / .NET · Java 17 · NestJS</strong>
                    </div>
                    <div className="hero-spec-item">
                      <small>FORMAÇÃO SUPERIOR</small>
                      <strong>Eng. Software · UNIFAN 2027</strong>
                    </div>
                  </div>

                  <div className="hero-cta-row">
                    <a
                      href="#sec-relic-chat"
                      className="deck-cta"
                      onClick={() => playKeyclick(soundOn, 780)}
                    >
                      Conversar com Johnny [Relic] ↓
                    </a>
                    <a
                      href="#sec-rom-bay"
                      className="deck-cta secondary"
                      onClick={() => playKeyclick(soundOn, 720)}
                    >
                      Explorar Fitas ROM [6] ↓
                    </a>
                    <a
                      href="#sec-icebreaker"
                      className="hero-text-link"
                      onClick={() => playKeyclick(soundOn, 740)}
                    >
                      Breach Protocol ↓
                    </a>
                    <button
                      type="button"
                      className="hero-text-link"
                      onClick={() => handleSwitchMode('os')}
                    >
                      Hosaka OS ▣
                    </button>
                    <a
                      href={PROFILE_DATA.cvPdf}
                      download="Curriculo_Miqueias_Carvalho.pdf"
                      className="hero-text-link"
                      onClick={() => unlockSeal('seal_dossier')}
                    >
                      Currículo PDF ↗
                    </a>
                  </div>
                </div>

                {/* Right Column: Circular Orbital Voight-Kampff Iris Scanner */}
                <div className="hero-iris-col">
                  <div className={`vk-orbital-scanner ${isCalibrated ? 'calibrated' : ''}`}>
                    <svg viewBox="0 0 320 320" className="vk-orbital-svg" aria-hidden="true">
                      <circle
                        cx="160"
                        cy="160"
                        r="152"
                        fill="none"
                        stroke="var(--hairline-strong)"
                        strokeWidth="1"
                        strokeDasharray="6 14 2 14"
                        className="iris-orbit-ring"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="138"
                        fill="none"
                        stroke="var(--hairline)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="160"
                        cy="160"
                        r="138"
                        fill="none"
                        stroke={isCalibrated ? 'var(--phosphor-secondary)' : 'var(--phosphor-primary)'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={IRIS_CIRCUMFERENCE}
                        strokeDashoffset={irisProgressOffset}
                        transform="rotate(-90 160 160)"
                        className="iris-progress-arc"
                      />
                      <line x1="160" y1="2" x2="160" y2="20" stroke="var(--phosphor-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                      <line x1="160" y1="300" x2="160" y2="318" stroke="var(--phosphor-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                      <line x1="2" y1="160" x2="20" y2="160" stroke="var(--phosphor-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                      <line x1="300" y1="160" x2="318" y2="160" stroke="var(--phosphor-primary)" strokeWidth="1.2" strokeOpacity="0.65" />
                      <text x="160" y="-4" textAnchor="middle" fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)">000°</text>
                      <text x="326" y="163" textAnchor="start" fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)">090°</text>
                      <text x="160" y="330" textAnchor="middle" fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)">180°</text>
                      <text x="-6" y="163" textAnchor="end" fill="var(--ink-muted)" fontSize="9" fontFamily="var(--font-mono)">270°</text>
                    </svg>

                    <div className={`vk-circular-aperture ${isCalibrated ? 'calibrated' : 'uncalibrated'}`}>
                      <img
                        src={PROFILE_DATA.portrait}
                        alt="Retrato de Miqueias Carvalho no visor orbital Voight-Kampff"
                        width="272"
                        height="363"
                        fetchPriority="high"
                      />
                    </div>
                  </div>

                  <div className="vk-iris-caption">
                    <div className="vk-iris-meta t-nums">
                      <span>RETINA MC-84</span>
                      <span className="meta-sep">·</span>
                      <strong style={{ color: isCalibrated ? 'var(--phosphor-secondary)' : 'var(--phosphor-primary)' }}>
                        {isCalibrated ? 'EMPATIA 98.4% VALIDADO' : `SINTONIZANDO ${vkPulses * 33}%`}
                      </strong>
                    </div>

                    {!isCalibrated ? (
                      <button type="button" className="deck-cta" onClick={handleVkPulse}>
                        Pulsar Calibração ({vkPulses}/3) ⚡
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="cmd-link accent"
                        onClick={() => {
                          playKeyclick(soundOn, 520);
                          setVkPulses(0);
                        }}
                      >
                        Lente Estabilizada · Recalibrar ↺
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================
                INTERACTIVE BIOCHIP DIALOGUE & LORE CODEX (JOHNNY / DIXIE / RACHEL)
                ================================================================ */}
            <RelicConstructDialog
              soundOn={soundOn}
              unlockSeal={unlockSeal}
              onTriggerEffect={handleRelicEffect}
              externalEvent={relicPing}
            />

            {/* ================================================================
                SECTION 01: FLUXO DE FITAS ROM (BORDERLESS EDITORIAL SPLIT)
                ================================================================ */}
            <section id="sec-rom-bay" className="space-section wrap reveal" aria-labelledby="rom-heading">
              <div className="section-head-open">
                <div>
                  <span className="section-kicker">01 / ARQUITETURA &amp; PRODUÇÃO</span>
                  <h2 id="rom-heading" className="glitch-title" data-text="Fitas ROM Hosaka">
                    Fitas ROM Hosaka
                  </h2>
                  <p>
                    O que foi construído, como foi arquitetado e o resultado técnico em SQL Server, VB6, Java 17 e Node.js.
                  </p>
                </div>

                <div className="rom-filter-tabs" role="group" aria-label="Filtrar fitas ROM por categoria">
                  {[
                    { id: 'all', label: 'Todas (6)' },
                    { id: 'prod', label: 'Zetti Produção' },
                    { id: 'api', label: 'APIs REST (3)' },
                    { id: 'desktop', label: 'Desktop DAO' },
                    { id: 'algo', label: 'O(1) & AVL' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`filter-tab ${romCategory === tab.id ? 'active' : ''}`}
                      onClick={() => handleFilterRomCategory(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rom-split-stage">
                {/* Left: Clean Hairline-Ruled Track (Zero Box Slabs) */}
                <div className="rom-index-rail" role="listbox" aria-label="Cartuchos de Projeto">
                  {visibleRoms.map((rom) => {
                    const isSelected = rom.id === activeRom.id;
                    return (
                      <button
                        key={rom.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`rom-index-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectRom(rom.id)}
                      >
                        <div className="rom-index-meta">
                          <span>{rom.slot.split(' · ')[0]}</span>
                          <span>{isSelected ? 'Ativo ●' : 'Carregar →'}</span>
                        </div>
                        <div className="rom-index-title">{rom.title}</div>
                        <div className="rom-index-sub">{rom.period}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Right: Open Typographic Reader Stream */}
                <article className="rom-open-reader" aria-live="polite">
                  <header className="rom-reader-head">
                    <div>
                      <span className="rom-reader-slot">
                        {activeRom.slot} · {activeRom.period}
                      </span>
                      <h3 className="rom-reader-title">{activeRom.title}</h3>
                    </div>
                    <a
                      href={activeRom.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="deck-cta"
                    >
                      {activeRom.linkLabel} ↗
                    </a>
                  </header>

                  <blockquote className="rom-impact-lead">
                    <span className="impact-label">IMPACTO DIRETO //</span> {activeRom.impact}
                  </blockquote>

                  <div className="rom-prose-grid">
                    <div>
                      <h4>Contexto de Operação</h4>
                      <p>{activeRom.context}</p>
                    </div>
                    <div>
                      <h4>Engenharia Aplicada</h4>
                      <ul>
                        {activeRom.engineering.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Borderless Left-Accented Code Deck */}
                  <div className="cyberspace-code-deck">
                    <div className="code-deck-bar">
                      <span>SNIPPET SOURCE // {activeRom.id}</span>
                      <div className="code-deck-actions">
                        <button
                          type="button"
                          className="cmd-link"
                          onClick={() => handleCopyText(activeRom.codeSnippet, 'Snippet de código')}
                        >
                          Copiar código
                        </button>
                        <button
                          type="button"
                          className="cmd-link accent"
                          onClick={handleRunRomTerminal}
                        >
                          ▶ Rodar diagnóstico
                        </button>
                      </div>
                    </div>
                    <pre className="rom-code-pre" translate="no">
                      {activeRom.codeSnippet}
                    </pre>

                    {showTerminalRun && (
                      <div className="terminal-output-block">
                        <div className="terminal-output-label">STDOUT // CLUSTER HOSAKA</div>
                        <pre className="rom-code-pre output" translate="no">
                          {activeRom.terminalOutput}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="rom-footer-meta">
                    <div className="rom-inline-stack">
                      {activeRom.stack.map((tech, idx) => (
                        <React.Fragment key={tech}>
                          <span>{tech}</span>
                          {idx < activeRom.stack.length - 1 && (
                            <span className="stack-sep" aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <a
                      href={activeRom.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-text-link"
                    >
                      Inspecionar fonte completo ↗
                    </a>
                  </div>
                </article>
              </div>
            </section>

            {/* ================================================================
                SECTION 02: ONDA NEURAL DE TELEMETRIA
                ================================================================ */}
            <section id="sec-telemetry" className="space-section wrap" aria-labelledby="matrix-heading">
              <div className="section-head-open">
                <div>
                  <span className="section-kicker">02 / MATRIZ NEURAL CONTÍNUA</span>
                  <h2 id="matrix-heading">Telemetria &amp; Evolução (2021 → 2026)</h2>
                  <p>
                    Cada nó orbital na curva registra um marco real da trajetória de Miqueias. Deslize ou selecione os sinais.
                  </p>
                </div>
                <a
                  href={PROFILE_DATA.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmd-link accent"
                >
                  github.com/Miqueias-Henrique ↗
                </a>
              </div>

              <div className="open-metrics-strip">
                <div className="open-metric-cell">
                  <strong className="t-nums">27</strong>
                  <span>Repositórios públicos no GitHub</span>
                </div>
                <div className="open-metric-cell">
                  <strong>SQL Server &amp; VB6</strong>
                  <span>Sustentação diária na Zetti</span>
                </div>
                <div className="open-metric-cell">
                  <strong>C# · Java · Node</strong>
                  <span>APIs RESTful e arquitetura limpa</span>
                </div>
                <div className="open-metric-cell">
                  <strong className="t-nums">UNIFAN · 2027</strong>
                  <span>Engenharia de Software</span>
                </div>
              </div>

              <NeuralWaveMatrix
                pins={TELEMETRY_PINS}
                selectedPin={selectedPin}
                onHoverPin={setSelectedPin}
                onSelectPin={handleSelectTelemetryPin}
                onStepPin={handleStepTelemetryPin}
              />
            </section>

            {/* ================================================================
                SECTION 03: NÚCLEO WINTERMUTE & FORJA DA LIGA METÁLICA
                ================================================================ */}
            <section id="sec-icebreaker" className="space-section wrap reveal" aria-labelledby="ice-heading">
              <div className="section-head-open">
                <div>
                  <span className="section-kicker">03 / BREACH PROTOCOL · ICE TESSIER-ASHPOOL</span>
                  <h2 id="ice-heading" className="glitch-title" data-text="Invada o ICE Wintermute">
                    Invada o ICE Wintermute
                  </h2>
                  <p>
                    Minigame no estilo netrunner de Night City: cada daemon enviado revela uma competência real do
                    Miqueias. Comece pela primeira linha e alterne coluna e linha.
                  </p>
                </div>
              </div>

              <BreachProtocol
                soundOn={soundOn}
                unlockSeal={unlockSeal}
                onRelicPing={setRelicPing}
                notify={notify}
              />

              {/* Slim alloy strip: chassis evolution driven by the 12 seals */}
              <div className="alloy-strip">
                <div className="alloy-strip-copy">
                  <span className="section-kicker">EVOLUÇÃO DA ESTAÇÃO</span>
                  <p>
                    Destrave os 12 <strong>Selos Voight-Kampff</strong> explorando o deck — 6 refundem a carcaça em
                    Titânio, 12 em Ouro 24K. Ou teste cada liga agora:
                  </p>
                </div>

                <div className="alloy-orbs-row" role="group" aria-label="Selecionar liga metálica da estação">
                  {[
                    { id: 'obsidian', label: 'Obsidiana 84', pitch: 640, ping: 'Rachel-7: Estação calibrada no breu Obsidiana 84.' },
                    { id: 'titanium', label: 'Titânio Tyrell', pitch: 740, ping: 'Rachel-7: Liga alterada para Titânio Escovado Tyrell.' },
                    { id: 'gold-24k', label: 'Ouro 24K', pitch: 880, ping: 'Johnny-84: Ouro 24K Straylight no barramento. Brilho de lenda do Afterlife.' },
                  ].map((alloy) => (
                    <button
                      key={alloy.id}
                      type="button"
                      aria-pressed={computedChassis === alloy.id}
                      className={`alloy-orb-btn ${computedChassis === alloy.id ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, alloy.pitch);
                        setChassisOverride(alloy.id);
                        setRelicPing(alloy.ping);
                      }}
                    >
                      <span className={`alloy-sphere ${alloy.id}`} aria-hidden="true" />
                      <span>{alloy.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="cmd-link accent"
                    onClick={() => setSealsModalOpen(true)}
                  >
                    Cofre de Selos {unlockedSeals.length}/12 ★
                  </button>
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 04: CANAIS DIRETOS (ARCHITECTURAL RULED LEDGER)
                ================================================================ */}
            <section id="sec-contact" className="space-section wrap reveal" aria-labelledby="ports-heading">
              <div className="section-head-open">
                <div>
                  <span className="section-kicker">04 / CONEXÃO DIRETA</span>
                  <h2 id="ports-heading" className="glitch-title" data-text="Canais & Dossiê Oficial">
                    Canais &amp; Dossiê Oficial
                  </h2>
                  <p>
                    Disponível para vagas Backend Júnior · C#/.NET · SQL Server · Java 17 · Node.js em Goiânia ou remoto.
                  </p>
                </div>
              </div>

              <div className="contact-ledger">
                <button
                  type="button"
                  className="contact-row"
                  onClick={() => handleCopyText(PROFILE_DATA.email, 'E-mail de Miqueias')}
                >
                  <span className="contact-port-code">RS-232 // E-MAIL</span>
                  <strong className="contact-title">Correio Eletrônico Direto</strong>
                  <span className="contact-endpoint">{PROFILE_DATA.email}</span>
                  <span className="contact-action">Copiar e-mail →</span>
                </button>

                <a
                  href={PROFILE_DATA.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">VID-PHON // WHATSAPP</span>
                  <strong className="contact-title">Linha Direta Goiânia</strong>
                  <span className="contact-endpoint t-nums">{PROFILE_DATA.phoneDisplay}</span>
                  <span className="contact-action">Chamar no WhatsApp ↗</span>
                </a>

                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">HOSAKA NET // LINKEDIN</span>
                  <strong className="contact-title">Rede Profissional</strong>
                  <span className="contact-endpoint">in/miqueias-henrique-88503b218</span>
                  <span className="contact-action">Abrir LinkedIn ↗</span>
                </a>

                <a
                  href={PROFILE_DATA.cvPdf}
                  download="Curriculo_Miqueias_Carvalho.pdf"
                  className="contact-row highlight-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">HARD COPY // PDF · 53 KB</span>
                  <strong className="contact-title">Currículo Oficial Miqueias Carvalho</strong>
                  <span className="contact-endpoint">Curriculo_Miqueias_Carvalho.pdf</span>
                  <span className="contact-action">Baixar PDF ⬇</span>
                </a>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ====================================================================
          OPEN CYBERSPACE FOOTER
          ==================================================================== */}
      <footer className="cyberspace-footer wrap">
        <div className="footer-signature">
          <span>ONO-SENDAI CYBERSPACE VII // TYRELL-84</span>
          <span className="meta-sep">·</span>
          <span>Miqueias Carvalho · Goiânia, GO</span>
        </div>
        <div className="footer-stack-line">
          C# / .NET · SQL Server · VB6 · Java 17 · Spring Boot 3 · Node.js &amp; NestJS · Docker ·{' '}
          <span className="footer-secret-hint" title="Experimente digitar no teclado fora de campos de texto">
            [easter eggs: ff06b5 · samurai · ↑↑↓↓←→←→BA]
          </span>
        </div>
      </footer>

      {/* ====================================================================
          MODAL 1: COFRE DE SELOS VOIGHT-KAMPFF
          ==================================================================== */}
      {sealsModalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seals-modal-title"
          onClick={() => setSealsModalOpen(false)}
        >
          <div ref={sealsDialogRef} className="modal-window" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span id="seals-modal-title">
                ★ INVENTÁRIO VOIGHT-KAMPFF ({unlockedSeals.length}/12)
              </span>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Fechar inventário"
                onClick={() => setSealsModalOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <div className="modal-actions-top">
                <span className="modal-hint-text">
                  Desbloqueie explorando a estação ou teste o espectro máximo em Ouro 24K:
                </span>
                <div className="modal-btn-row">
                  <button
                    type="button"
                    className="deck-cta"
                    onClick={() => {
                      const allIds = EMPATHY_SEALS.map((s) => s.id);
                      setUnlockedSeals(allIds);
                      setChassisOverride(null);
                      setRelicPing('Johnny-84: Todos os 12 Selos liberados! Ouro 24K ativado.');
                      notify('Todos os 12 Selos Voight-Kampff liberados! Chassi Ouro 24K ativo.');
                    }}
                  >
                    Liberar todos (12/12)
                  </button>
                  <button
                    type="button"
                    className="cmd-link"
                    onClick={() => {
                      setUnlockedSeals(['seal_boot']);
                      setChassisOverride(null);
                      notify('Progresso de selos reiniciado.');
                    }}
                  >
                    Zerar
                  </button>
                </div>
              </div>

              <div className="seals-list-grid">
                {EMPATHY_SEALS.map((seal) => {
                  const isUnlocked = unlockedSeals.includes(seal.id);
                  return (
                    <div
                      key={seal.id}
                      className={`seal-item ${isUnlocked ? 'unlocked' : ''}`}
                    >
                      <span className="seal-status-ring" aria-hidden="true" />
                      <div>
                        <strong>
                          [{seal.code}] {seal.title}
                        </strong>
                        <span>{seal.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: COMMAND PALETTE (CTRL+K)
          ==================================================================== */}
      {cmdOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmd-modal-title"
          onClick={() => setCmdOpen(false)}
        >
          <div ref={cmdDialogRef} className="modal-window" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span id="cmd-modal-title">⌘ TERMINAL DE COMANDO RÁPIDO ONO-SENDAI</span>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Fechar paleta de comandos"
                onClick={() => setCmdOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <input
                type="text"
                className="cmd-input"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Buscar fita ROM, Johnny-84, Hosaka OS, Voight-Kampff..."
                aria-label="Filtrar comandos da estação"
                autoFocus
              />
              <div className="cmd-results-list">
                {commandItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="cmd-result-row"
                    onClick={() => {
                      item.action();
                      setCmdOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    <small>{item.sub}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="hardware-toast" role="status" aria-live="polite">
          <span className="pulse-dot" aria-hidden="true" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
