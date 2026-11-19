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
import RomSignalLab from './components/RomSignalLab';
import {
  playKeyclick,
  playVoightKampffPulse,
  playRelicGlitch,
  setAmbientDrone,
} from './utils/soundEngine';
import useModalFocus from './utils/useModalFocus';

// Workstation OS is only fetched when the visitor switches mode (smaller first load)
const HosakaDesktopOS = lazy(() => import('./components/HosakaDesktopOS'));

const STORAGE_KEY_SEALS = 'ono_sendai_vk_seals_v1';

const SECTORS = [
  { id: 'hero-top', label: 'Início' },
  { id: 'sec-rom-bay', label: 'Projetos' },
  { id: 'sec-telemetry', label: 'Trajetória' },
  { id: 'sec-contact', label: 'Contato' },
  { id: 'sec-night-city', label: 'Night City' },
];

const RECRUITER_BRIEFING_TEXT = [
  `DOSSIÊ TÉCNICO — ${PROFILE_DATA.fullName}`,
  `Cargo Alvo: ${PROFILE_DATA.role}`,
  `Localização: Goiânia - GO (Disponível Remoto / Presencial / Híbrido)`,
  `Experiência Atual: ${PROFILE_DATA.currentJob}`,
  `  • SQL Server em produção (queries, views, stored procedures, Index Seek)`,
  `  • Sustentação de módulos fiscais em VB6 para dezenas de farmácias`,
  `  • Adequação técnica ao CNPJ Alfanumérico (NT 2026) e reforma tributária`,
  `Stack Principal: C# / .NET · SQL Server · VB6 · Java 17 (Spring Boot 3, JPA, JavaFX DAO) · Node.js / TypeScript (NestJS, Express, Prisma, TypeORM) · PostgreSQL · MySQL · Docker · Git/Jira`,
  `Formação: ${PROFILE_DATA.education}`,
  `GitHub (27 repos): ${PROFILE_DATA.github}`,
  `LinkedIn: ${PROFILE_DATA.linkedin}`,
  `E-mail: ${PROFILE_DATA.email} | WhatsApp: ${PROFILE_DATA.phoneDisplay}`,
].join('\n');

// Hidden keyboard sequences (typed anywhere outside inputs)
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const SECRET_WORDS = {
  ff06b5: 'FF:06:B5 · Sinal magenta interceptado. Johnny-84: "Tem gente que caça esse código há anos. O Miqueias caça Table Scan."',
  samurai: 'SAMURAI · "Never Fade Away" tocando no barramento. Johnny-84: "Wake up, choom — tem query pra otimizar."',
  wakeup: 'WAKE UP, SAMURAI · Johnny-84: "We have a city to burn" — mas aqui a gente só queima latência.',
  afterlife: 'AFTERLIFE · Rogue deixou um recado: "Esse backend aí tem cara de lenda. Contrata antes da Arasaka."',
};

export default function App() {
  const [viewMode, setViewMode] = useState('editorial');
  const [phosphorMode, setPhosphorMode] = useState('amber');
  const [soundOn, setSoundOn] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);

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

  // Section 1: Projetos & Produção
  const [romCategory, setRomCategory] = useState('all');
  const [activeRomId, setActiveRomId] = useState(ROM_CARTRIDGES[0].id);
  const [romViewTab, setRomViewTab] = useState('code'); // 'code' (fast recruiter default) | 'lab' (interactive SVG simulator)
  const [showTerminalRun, setShowTerminalRun] = useState(false);

  // Section 2: Neural Wave Telemetry Pin
  const [selectedPin, setSelectedPin] = useState(TELEMETRY_PINS[TELEMETRY_PINS.length - 1]);

  // Section 4: Night City Interactive Zone ('relic' | 'breach')
  const [arcadeTab, setArcadeTab] = useState('relic');

  // Active sector for desktop rail + scroll progress hairline ref
  const [activeSector, setActiveSector] = useState('hero-top');
  const scrollBarRef = useRef(null);

  // Modals & Notifications
  const [sealsModalOpen, setSealsModalOpen] = useState(false);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);
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

  // Clean up procedural ambient synth on unmount
  useEffect(() => () => setAmbientDrone(false), []);

  // GPU-composited scroll progress hairline along bottom of top bar
  useEffect(() => {
    const onScroll = () => {
      if (!scrollBarRef.current) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / max));
      scrollBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [viewMode]);

  // Active section tracker for desktop floating sector rail
  useEffect(() => {
    if (viewMode !== 'editorial' || !('IntersectionObserver' in window)) return undefined;
    const nodes = SECTORS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!nodes.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSector(visible[0].target.id);
        }
      },
      { rootMargin: '-22% 0px -48% 0px', threshold: [0.05, 0.25, 0.5] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [viewMode]);

  // Unlock seals silently without interrupting recruiter reading with achievement popups
  const unlockSeal = useCallback((sealId) => {
    setUnlockedSeals((prev) => {
      if (prev.includes(sealId)) return prev;
      const next = [...prev, sealId];
      try {
        localStorage.setItem(STORAGE_KEY_SEALS, JSON.stringify(next));
      } catch {}
      if (next.length === 6) {
        setRelicPing('Rachel-7: 6 conquistas desbloqueadas — liga da estação atualizada para Titânio.');
      } else if (next.length === 12) {
        setRelicPing('Johnny-84: Todas as 12 conquistas na mão, samurai! Ouro 24K ativo.');
      }
      return next;
    });
  }, []);

  const handleToggleAmbient = useCallback(() => {
    setAmbientOn((prev) => {
      const next = !prev;
      setAmbientDrone(next);
      if (next) {
        unlockSeal('seal_synth');
        setRelicPing('Rachel-7: Drone analógico CS-80 (Ré menor) sintonizado em Night City.');
        notify('Ambiente sonoro CS-80 ativado.');
      } else {
        notify('Ambiente sonoro CS-80 desativado.');
      }
      return next;
    });
  }, [unlockSeal, notify]);

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
        setBriefingModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // One-shot chromatic glitch across the deck (CSS handles reduced motion)
  const triggerGlitch = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove('is-glitching');
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
        setRelicPing('Dixie Flatline: Código Konami na matriz? Respeito, cowboy — paleta alternada.');
        notify('↑↑↓↓←→←→BA · Paleta Night City / Blade Runner alternada.');
        return;
      }

      const typed = trail.filter((k) => k.length === 1).join('');
      const word = Object.keys(SECRET_WORDS).find((w) => typed.endsWith(w));
      if (word) {
        keyTrailRef.current = [];
        triggerGlitch();
        playRelicGlitch(soundOn);
        setRelicPing(SECRET_WORDS[word]);
        notify(SECRET_WORDS[word]);
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
  const briefingDialogRef = useRef(null);
  const cmdDialogRef = useRef(null);
  useModalFocus(sealsModalOpen, sealsDialogRef);
  useModalFocus(briefingModalOpen, briefingDialogRef);
  useModalFocus(cmdOpen, cmdDialogRef);

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
    setRelicPing(`Dixie Flatline: Projeto "${activeRom.id}" executado com sucesso no cluster.`);
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

  const jumpToNightCity = (tab = 'relic') => {
    playKeyclick(soundOn, 760);
    setViewMode('editorial');
    setArcadeTab(tab);
    setTimeout(() => {
      document.getElementById('sec-night-city')?.scrollIntoView({ behavior: 'auto' });
    }, 30);
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
        if (effect.scrollTo === 'sec-icebreaker') {
          setArcadeTab('breach');
        }
        setTimeout(() => {
          const targetId = effect.scrollTo === 'sec-icebreaker' ? 'sec-night-city' : effect.scrollTo;
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'auto' });
        }, 40);
      } else if (effect.calibrateAll) {
        playVoightKampffPulse(soundOn, 3);
        unlockSeal('seal_calibrate');
        setRelicPing('Rachel-7: Telemetria neural sincronizada via Constructo Relic.');
      } else if (effect.openOs) {
        setViewMode('os');
        unlockSeal('seal_os_mode');
      } else if (effect.openSeals) {
        setSealsModalOpen(true);
      }
    },
    [soundOn, unlockSeal]
  );

  const visibleRoms =
    romCategory === 'all'
      ? ROM_CARTRIDGES
      : ROM_CARTRIDGES.filter((r) => r.category === romCategory);

  const activeRom =
    visibleRoms.find((r) => r.id === activeRomId) || visibleRoms[0] || ROM_CARTRIDGES[0];

  const commandItems = [
    {
      label: 'Abrir Resumo Recrutador 30s (Dossiê Técnico Copiável)',
      sub: 'Recrutamento',
      action: () => setBriefingModalOpen(true),
    },
    {
      label: 'Ver Projetos & Experiência em Produção (Zetti + 5 Repositórios)',
      sub: 'Projetos',
      action: () => {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById('sec-rom-bay')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    },
    {
      label: 'Contato direto: WhatsApp, E-mail, LinkedIn e Currículo PDF',
      sub: 'Contato',
      action: () => {
        setViewMode('editorial');
        setTimeout(() => {
          document.getElementById('sec-contact')?.scrollIntoView({ behavior: 'auto' });
        }, 30);
      },
    },
    {
      label: 'Conversar com Johnny Silverhand, Dixie & Rachel (Relic)',
      sub: 'Night City',
      action: () => jumpToNightCity('relic'),
    },
    {
      label: 'Jogar Breach Protocol (Matriz Hexadecimal 5×5)',
      sub: 'Minigame',
      action: () => jumpToNightCity('breach'),
    },
    {
      label: 'Abrir Estação Keystone OS (6 Ferramentas Integradas)',
      sub: 'Keystone OS',
      action: () => handleSwitchMode('os'),
    },
    {
      label: ambientOn ? 'Desligar Sintetizador Ambiente CS-80' : 'Ligar Sintetizador Ambiente CS-80 (WebAudio)',
      sub: ambientOn ? 'Áudio Ativo' : 'Áudio',
      action: () => handleToggleAmbient(),
    },
    {
      label: 'Alternar Paleta (Night City Rosa Choque / Blade Runner Âmbar)',
      sub: 'Cores',
      action: () => setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber')),
    },
    ...ROM_CARTRIDGES.map((rom) => ({
      label: `Projeto: ${rom.title}`,
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

  return (
    <>
      <a href="#main-deck" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* ====================================================================
          NIGHT CITY TOP BAR (CLEAN, RECRUITER-FIRST, ZERO NESTED BOXES)
          ==================================================================== */}
      <header className="top-console-bar" role="banner">
        <div className="top-console-inner">
          <div className="brand-plate">
            <span className="brand-led" aria-hidden="true" />
            <span className="brand-model-code">Miqueias Carvalho</span>
            <span className="brand-divider" aria-hidden="true">·</span>
            <span className="brand-sub-tag">Backend · SQL Server &amp; .NET</span>
          </div>

          <nav className="mode-switch-group" aria-label="Navegação principal">
            <button
              type="button"
              aria-pressed={viewMode === 'editorial'}
              className={`mode-switch-btn ${viewMode === 'editorial' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('editorial')}
            >
              <span className="label-full">Portfólio &amp; Projetos</span>
              <span className="label-short" aria-hidden="true">Portfólio</span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'os'}
              className={`mode-switch-btn ${viewMode === 'os' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('os')}
            >
              <span className="label-full">Keystone OS [NCITY.PUB]</span>
              <span className="label-short" aria-hidden="true">Keystone OS</span>
            </button>
          </nav>

          <div className="console-right-controls">
            <button
              type="button"
              className="seals-status-link"
              onClick={() => {
                playKeyclick(soundOn, 810);
                setBriefingModalOpen(true);
              }}
              title="Abrir resumo executivo de 30 segundos para recrutadores"
            >
              <span className="seals-orb-dot" aria-hidden="true" />
              <span>Resumo 30s</span>
            </button>

            <button
              type="button"
              className="cmd-link"
              onClick={() => {
                playKeyclick(soundOn, 690);
                setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber'));
              }}
              title="Alternar entre paleta Night City (Rosa Choque + Azul Oceano) e Blade Runner (Âmbar)"
              aria-label={`Paleta ativa: ${phosphorMode === 'amber' ? 'Night City' : 'Blade Runner'}`}
            >
              <span className="label-full">{phosphorMode === 'amber' ? 'Night City' : 'Blade Runner'}</span>
              <span className="label-short">{phosphorMode === 'amber' ? 'NC' : 'BR'}</span>
            </button>

            <button
              type="button"
              className={`cmd-link desktop-only-control ${ambientOn ? 'accent' : ''}`}
              aria-pressed={ambientOn}
              onClick={handleToggleAmbient}
              title="Ligar ou desligar o sintetizador ambiente noturno CS-80 (WebAudio)"
            >
              <span>{ambientOn ? 'CS-80 ●' : 'CS-80'}</span>
            </button>

            <button
              type="button"
              className="cmd-link"
              aria-pressed={soundOn}
              aria-label="Efeitos sonoros da interface"
              onClick={() => setSoundOn((s) => !s)}
              title="Ativar ou silenciar efeitos sonoros"
            >
              <span className="label-full">{soundOn ? 'Som On' : 'Mudo'}</span>
              <span className="label-short">{soundOn ? '♪ On' : '♪ Off'}</span>
            </button>

            <button
              type="button"
              className="cmd-link"
              onClick={() => {
                playKeyclick(soundOn, 750);
                setCmdOpen(true);
              }}
              title="Abrir busca rápida (Ctrl+K)"
              aria-label="Abrir busca rápida (Ctrl+K)"
            >
              <span className="label-full">Ctrl+K</span>
              <span className="label-short">⌘</span>
            </button>
          </div>
        </div>
        <div className="console-progress-track" aria-hidden="true">
          <div ref={scrollBarRef} className="console-progress-bar" />
        </div>
      </header>

      {/* Wide-Desktop Spatial Navigation Rail (>= 1580px only, unnumbered) */}
      {viewMode === 'editorial' && (
        <nav className="sector-rail" aria-label="Navegação rápida por seções">
          {SECTORS.map((sec) => {
            const isActive = activeSector === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`sector-rail-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => playKeyclick(soundOn, 720)}
              >
                <span className="sector-rail-label">{sec.label}</span>
                <span className="sector-rail-tick" aria-hidden="true" />
              </a>
            );
          })}
        </nav>
      )}

      {/* ====================================================================
          MAIN STAGE: RECRUITER-FIRST PORTFOLIO VS KEYSTONE WORKSTATION OS
          ==================================================================== */}
      <main id="main-deck">
        {viewMode === 'os' ? (
          <Suspense
            fallback={
              <div className="os-loading wrap" role="status">
                Inicializando terminal Keystone NCITY.PUB…
              </div>
            }
          >
            <HosakaDesktopOS
              soundOn={soundOn}
              ambientOn={ambientOn}
              onToggleAmbient={handleToggleAmbient}
              unlockSeal={unlockSeal}
              notify={notify}
              unlockedSeals={unlockedSeals}
              chassisStage={computedChassis}
              onRelicPing={setRelicPing}
              onReturnToSpace={() => {
                setViewMode('editorial');
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
            />
          </Suspense>
        ) : (
          <div className="cyberspace-flow">
            {/* ================================================================
                HERO: ZERO-FRICTION RECRUITER OVERVIEW + NIGHT CITY PORTRAIT
                ================================================================ */}
            <section id="hero-top" className="hero-cyberspace" aria-labelledby="hero-heading">
              <CyberspaceTerrain chassis={computedChassis} phosphor={phosphorMode} />

              <div className="wrap hero-grid">
                <div className="hero-copy-col">
                  <h1 id="hero-heading" className="hero-title">
                    <span className="hero-title-white">Miqueias Carvalho</span>
                    <span className="hero-title-blue">Engenharia Backend</span>
                    <span className="hero-title-pink">&amp; SQL Server em Produção.</span>
                  </h1>

                  <p className="hero-lead">
                    Desenvolvedor Backend na <strong>Zetti</strong> (Dez/2025 – Atual), atuando diariamente na
                    sustentação e otimização de bancos <strong>SQL Server</strong> e módulos fiscais{' '}
                    <strong>VB6</strong> para dezenas de farmácias. Construo APIs REST e sistemas transacionais com{' '}
                    <strong>C# / .NET</strong>, <strong>Java 17 (Spring Boot 3)</strong> e{' '}
                    <strong>Node.js (TypeScript / NestJS)</strong>, e curso Engenharia de Software na{' '}
                    <strong>UNIFAN (2027)</strong> em Goiânia, GO.
                  </p>

                  <div className="hero-specs-ledger">
                    <div className="hero-spec-item">
                      <small>Experiência em produção</small>
                      <strong>Zetti · SQL Server &amp; VB6</strong>
                    </div>
                    <div className="hero-spec-item">
                      <small>APIs &amp; arquitetura</small>
                      <strong>C# / .NET · Java 17 · NestJS</strong>
                    </div>
                    <div className="hero-spec-item">
                      <small>Formação &amp; modalidade</small>
                      <strong>Eng. Software 2027 · Goiânia / Remoto</strong>
                    </div>
                  </div>

                  <div className="hero-cta-row">
                    <a
                      href="#sec-rom-bay"
                      className="deck-cta"
                      onClick={() => playKeyclick(soundOn, 780)}
                    >
                      Ver Projetos &amp; Produção ↓
                    </a>
                    <a
                      href={PROFILE_DATA.cvPdf}
                      download="Curriculo_Miqueias_Carvalho.pdf"
                      className="deck-cta secondary"
                      onClick={() => unlockSeal('seal_dossier')}
                    >
                      Baixar Currículo PDF ↓
                    </a>
                    <button
                      type="button"
                      className="hero-text-link"
                      onClick={() => {
                        playKeyclick(soundOn, 820);
                        setBriefingModalOpen(true);
                        unlockSeal('seal_dossier');
                      }}
                    >
                      Resumo em 30s ↗
                    </button>
                    <a
                      href={PROFILE_DATA.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-text-link"
                    >
                      GitHub (27 repos) ↗
                    </a>
                    <a
                      href={PROFILE_DATA.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-text-link"
                    >
                      LinkedIn ↗
                    </a>
                    <a
                      href={PROFILE_DATA.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-text-link"
                    >
                      WhatsApp ↗
                    </a>
                  </div>
                </div>

                {/* Right Column: Sharp Night City Cyberpunk Portrait (Zero Blur Lock) */}
                <div className="hero-portrait-col">
                  <figure className="nc-portrait-frame">
                    <div className="nc-portrait-media">
                      <img
                        src={PROFILE_DATA.portrait}
                        alt="Retrato de Miqueias Carvalho iluminado em azul oceano e rosa choque no estilo Night City"
                        width="720"
                        height="960"
                        fetchPriority="high"
                      />
                    </div>
                    <figcaption className="nc-portrait-caption">
                      <span className="nc-caption-name">Miqueias Carvalho</span>
                      <span className="nc-caption-role">Backend Developer @ Zetti · Goiânia, GO</span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 1 (IMMEDIATELY BELOW HERO): PROJETOS & EXPERIÊNCIA REAL
                Styled after the Night City KEYSTONE terminal screen (image_2.png)
                ================================================================ */}
            <section id="sec-rom-bay" className="space-section wrap reveal" aria-labelledby="rom-heading">
              <div className="section-head-open">
                <div>
                  <h2 id="rom-heading">
                    Projetos &amp; <span className="text-pink">Experiência em Produção</span>
                  </h2>
                  <p>
                    Atuação real na Zetti e repositórios públicos com código limpo, bancos relacionais e simuladores interativos.
                  </p>
                </div>

                <div className="rom-filter-tabs" role="group" aria-label="Filtrar projetos por área">
                  {[
                    { id: 'all', label: 'Todos (6)' },
                    { id: 'prod', label: 'Produção Zetti' },
                    { id: 'api', label: 'APIs REST (3)' },
                    { id: 'desktop', label: 'Desktop & JDBC' },
                    { id: 'algo', label: 'Árvore AVL & Hash' },
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

              <div className="keystone-monitor-shell">
                <div className="keystone-netdir-bar">
                  <span className="keystone-brand">KEYSTONE</span>
                  <span className="keystone-url">NETDIR://NCITY.PUB/PROJETOS/{activeRom.id.toUpperCase()}</span>
                  <div className="keystone-view-tabs" role="tablist" aria-label="Modo de inspeção do projeto">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={romViewTab === 'code'}
                      className={`keystone-tab-btn ${romViewTab === 'code' ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, 720);
                        setRomViewTab('code');
                      }}
                    >
                      Resumo &amp; Código Real
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={romViewTab === 'lab'}
                      className={`keystone-tab-btn ${romViewTab === 'lab' ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, 820);
                        setRomViewTab('lab');
                      }}
                    >
                      ● Simulador Interativo ao Vivo
                    </button>
                  </div>
                </div>

                <div className="rom-split-stage">
                  {/* Left: Project Selector List */}
                  <div className="rom-index-rail" role="listbox" aria-label="Lista de projetos backend">
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
                            <span>{isSelected ? 'Selecionado ●' : 'Ver →'}</span>
                          </div>
                          <div className="rom-index-title">{rom.title}</div>
                          <div className="rom-index-sub">{rom.period}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: Project Details, Real Code & Optional Interactive Lab */}
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
                      {activeRom.impact}
                    </blockquote>

                    <div className="rom-prose-grid">
                      <div>
                        <h4>Contexto e problema resolvido</h4>
                        <p>{activeRom.context}</p>
                      </div>
                      <div>
                        <h4>Arquitetura e engenharia aplicada</h4>
                        <ul>
                          {activeRom.engineering.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {romViewTab === 'lab' ? (
                      <RomSignalLab
                        romId={activeRom.id}
                        soundOn={soundOn}
                        unlockSeal={unlockSeal}
                        onRelicPing={setRelicPing}
                      />
                    ) : (
                      <div className="cyberspace-code-deck">
                        <div className="code-deck-bar">
                          <span>Trecho de código real ({activeRom.id})</span>
                          <div className="code-deck-actions">
                            <button
                              type="button"
                              className="cmd-link accent"
                              onClick={() => {
                                playKeyclick(soundOn, 820);
                                setRomViewTab('lab');
                              }}
                            >
                              ⚡ Abrir Simulador Interativo
                            </button>
                            <button
                              type="button"
                              className="cmd-link"
                              onClick={() => handleCopyText(activeRom.codeSnippet, 'Trecho de código')}
                            >
                              Copiar código
                            </button>
                            <button
                              type="button"
                              className="cmd-link"
                              onClick={handleRunRomTerminal}
                            >
                              ▶ Ver saída de execução
                            </button>
                          </div>
                        </div>
                        <pre className="rom-code-pre" translate="no">
                          {activeRom.codeSnippet}
                        </pre>

                        {showTerminalRun && (
                          <div className="terminal-output-block">
                            <div className="terminal-output-label">Saída de execução:</div>
                            <pre className="rom-code-pre output" translate="no">
                              {activeRom.terminalOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

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
                        Abrir repositório completo ↗
                      </a>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 2: STACK TÉCNICA & TRAJETÓRIA (2021 -> 2026)
                ================================================================ */}
            <section id="sec-telemetry" className="space-section wrap" aria-labelledby="matrix-heading">
              <div className="section-head-open">
                <div>
                  <h2 id="matrix-heading">
                    Stack Técnica &amp; <span className="text-blue">Trajetória (2021 – 2026)</span>
                  </h2>
                  <p>
                    Evolução prática desde os fundamentos de programação e bancos relacionais até a operação diária na Zetti.
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
                  <strong>C# · Java 17 · NestJS</strong>
                  <span>APIs RESTful e arquitetura limpa</span>
                </div>
                <div className="open-metric-cell">
                  <strong className="t-nums">UNIFAN · 2027</strong>
                  <span>Bacharelado em Eng. de Software</span>
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
                SECTION 3: CONTATO DIRETO & CURRÍCULO (BEFORE GAMES/LORE!)
                ================================================================ */}
            <section id="sec-contact" className="space-section wrap reveal" aria-labelledby="ports-heading">
              <div className="section-head-open">
                <div>
                  <h2 id="ports-heading">
                    Contato Direto &amp; <span className="text-pink">Currículo</span>
                  </h2>
                  <p>
                    Disponível para oportunidades Backend Júnior · C# / .NET · SQL Server · Java 17 · Node.js em Goiânia ou remoto.
                  </p>
                </div>
                <button
                  type="button"
                  className="deck-cta"
                  onClick={() => {
                    playKeyclick(soundOn, 860);
                    setBriefingModalOpen(true);
                  }}
                >
                  Resumo Executivo (30s) ↗
                </button>
              </div>

              <div className="contact-ledger">
                <a
                  href={PROFILE_DATA.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">WhatsApp</span>
                  <strong className="contact-title">Conversa Direta (Goiânia / Remoto)</strong>
                  <span className="contact-endpoint t-nums">{PROFILE_DATA.phoneDisplay}</span>
                  <span className="contact-action">Chamar no WhatsApp ↗</span>
                </a>

                <button
                  type="button"
                  className="contact-row"
                  onClick={() => handleCopyText(PROFILE_DATA.email, 'E-mail de Miqueias')}
                >
                  <span className="contact-port-code">E-mail</span>
                  <strong className="contact-title">Correio Eletrônico Profissional</strong>
                  <span className="contact-endpoint">{PROFILE_DATA.email}</span>
                  <span className="contact-action">Copiar e-mail →</span>
                </button>

                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">LinkedIn</span>
                  <strong className="contact-title">Perfil &amp; Experiência na Zetti</strong>
                  <span className="contact-endpoint">in/miqueias-henrique-88503b218</span>
                  <span className="contact-action">Abrir LinkedIn ↗</span>
                </a>

                <a
                  href={PROFILE_DATA.cvPdf}
                  download="Curriculo_Miqueias_Carvalho.pdf"
                  className="contact-row highlight-row"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <span className="contact-port-code">Currículo PDF</span>
                  <strong className="contact-title">Currículo Completo Miqueias Carvalho</strong>
                  <span className="contact-endpoint">Curriculo_Miqueias_Carvalho.pdf</span>
                  <span className="contact-action">Baixar PDF ⬇</span>
                </a>
              </div>
            </section>

            {/* ================================================================
                SECTION 4 (OPTIONAL DEEP DIVE): ZONA IMERSIVA NIGHT CITY
                For visitors who liked Miqueias and want to stay longer!
                ================================================================ */}
            <section id="sec-night-city" className="space-section wrap reveal" aria-labelledby="nc-heading">
              <div className="section-head-open">
                <div>
                  <h2 id="nc-heading">
                    Imersão Night City: <span className="text-blue">Constructo Relic</span> &amp;{' '}
                    <span className="text-pink">Breach Protocol</span>
                  </h2>
                  <p>
                    Gostou do perfil e tem mais um minuto? Converse com o engrama do Johnny Silverhand sobre a carreira do Miqueias, invada a matriz hexadecimal ou abra o sistema Keystone OS.
                  </p>
                </div>
              </div>

              <div className="keystone-monitor-shell">
                <div className="keystone-netdir-bar">
                  <span className="keystone-brand">KEYSTONE</span>
                  <span className="keystone-url">
                    NETDIR://NCITY.PUB/{arcadeTab === 'relic' ? 'CONSTRUCTO-RELIC' : 'BREACH-PROTOCOL'}
                  </span>
                  <div className="keystone-view-tabs" role="tablist" aria-label="Experiências interativas de Night City">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={arcadeTab === 'relic'}
                      className={`keystone-tab-btn ${arcadeTab === 'relic' ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, 740);
                        setArcadeTab('relic');
                      }}
                    >
                      Constructo Relic (Johnny Silverhand)
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={arcadeTab === 'breach'}
                      className={`keystone-tab-btn ${arcadeTab === 'breach' ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, 780);
                        setArcadeTab('breach');
                      }}
                    >
                      Minigame Breach Protocol (5×5)
                    </button>
                    <button
                      type="button"
                      className="keystone-tab-btn"
                      onClick={() => handleSwitchMode('os')}
                    >
                      Abrir Keystone OS [6 Apps] →
                    </button>
                  </div>
                </div>

                {arcadeTab === 'relic' ? (
                  <RelicConstructDialog
                    soundOn={soundOn}
                    unlockSeal={unlockSeal}
                    onTriggerEffect={handleRelicEffect}
                    externalEvent={relicPing}
                    onOpenBriefing={() => setBriefingModalOpen(true)}
                  />
                ) : (
                  <div id="sec-icebreaker" className="breach-arcade-pad">
                    <BreachProtocol
                      soundOn={soundOn}
                      unlockSeal={unlockSeal}
                      onRelicPing={setRelicPing}
                      notify={notify}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ====================================================================
          NIGHT CITY FOOTER
          ==================================================================== */}
      <footer className="cyberspace-footer wrap">
        <div className="footer-signature">
          <span>Miqueias Carvalho · Engenharia Backend</span>
          <span className="meta-sep">·</span>
          <span>Goiânia, GO (Remoto / Híbrido)</span>
        </div>
        <div className="footer-stack-line">
          C# / .NET · SQL Server · VB6 · Java 17 · Spring Boot 3 · Node.js &amp; NestJS · Docker
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
                placeholder="Buscar fita ROM, Johnny-84, Briefing 30s, CS-80..."
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

      {/* ====================================================================
          MODAL 3: BRIEFING EXECUTIVO 30S PARA RECRUTADORES & TECH LEADS
          ==================================================================== */}
      {briefingModalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="briefing-modal-title"
          onClick={() => setBriefingModalOpen(false)}
        >
          <div ref={briefingDialogRef} className="modal-window briefing-modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span id="briefing-modal-title">Resumo Executivo (30s) · Miqueias Carvalho</span>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Fechar resumo executivo"
                onClick={() => setBriefingModalOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <div className="briefing-lead-row">
                <div>
                  <strong className="briefing-name">{PROFILE_DATA.fullName}</strong>
                  <p className="briefing-role">{PROFILE_DATA.role} · Goiânia, GO (Remoto / Híbrido)</p>
                </div>
                <div className="modal-btn-row">
                  <button
                    type="button"
                    className="deck-cta"
                    onClick={() => handleCopyText(RECRUITER_BRIEFING_TEXT, 'Resumo Executivo 30s')}
                  >
                    Copiar Resumo →
                  </button>
                  <a
                    href={PROFILE_DATA.cvPdf}
                    download="Curriculo_Miqueias_Carvalho.pdf"
                    className="cmd-link accent"
                    onClick={() => unlockSeal('seal_dossier')}
                  >
                    Baixar PDF ⬇
                  </a>
                </div>
              </div>

              <div className="briefing-ledger">
                <div className="briefing-row">
                  <span className="briefing-key">Produção atual</span>
                  <div>
                    <strong>{PROFILE_DATA.currentJob}</strong>
                    <p>
                      Manutenção e otimização diária de queries, views e stored procedures em <strong>SQL Server</strong>,
                      evolução de módulos fiscais em <strong>VB6</strong> para dezenas de farmácias, adequação ao{' '}
                      <strong>CNPJ Alfanumérico (NT 2026)</strong> e cálculos da reforma tributária.
                    </p>
                  </div>
                </div>
                <div className="briefing-row">
                  <span className="briefing-key">Stack backend</span>
                  <div>
                    <strong>C# / .NET · SQL Server · VB6 · Java 17 (Spring Boot 3) · Node.js (NestJS)</strong>
                    <p>
                      PostgreSQL, MySQL, Prisma ORM, TypeORM, Spring Data JPA, JDBC DAO, Docker Compose, OpenAPI/Swagger,
                      GitKraken e Jira.
                    </p>
                  </div>
                </div>
                <div className="briefing-row">
                  <span className="briefing-key">Destaques GitHub</span>
                  <div>
                    <strong>27 repositórios públicos</strong>
                    <p>
                      <code>api-gestao-produtos</code> (TS/TypeORM/Docker) · <code>vosso-cinema-api</code> (NestJS/Prisma ACID) ·{' '}
                      <code>vital-conscious-api</code> (Java 17/Spring Boot 3) · <code>controle-estoque-javafx</code> (JDBC DAO) ·{' '}
                      <code>catalogo-livros-avl-bst</code> &amp; <code>tabela-hash-cpf-java</code>.
                    </p>
                  </div>
                </div>
                <div className="briefing-row">
                  <span className="briefing-key">Formação &amp; contato</span>
                  <div>
                    <strong>{PROFILE_DATA.education}</strong>
                    <p className="t-nums">
                      {PROFILE_DATA.email} · WhatsApp {PROFILE_DATA.phoneDisplay}
                    </p>
                  </div>
                </div>
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
