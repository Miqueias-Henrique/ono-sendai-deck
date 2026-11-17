import React, { useState, useEffect, useCallback } from 'react';
import {
  PROFILE_DATA,
  OWL_QUOTES,
  ROM_CARTRIDGES,
  TELEMETRY_PINS,
  EMPATHY_SEALS,
} from './data/portfolioData';
import HosakaDesktopOS from './components/HosakaDesktopOS';
import { playKeyclick, playVoightKampffPulse } from './utils/soundEngine';

const STORAGE_KEY_SEALS = 'ono_sendai_vk_seals_v1';

export default function App() {
  // Mode: 'editorial' (Felipe-inspired narrative deck) vs 'os' (Madu-inspired multi-window desktop)
  const [viewMode, setViewMode] = useState('editorial');
  const [phosphorMode, setPhosphorMode] = useState('amber');
  const [soundOn, setSoundOn] = useState(true);

  // Voight-Kampff Calibration (0 to 3 pulses — like Felipe's "Me ajuda a puxar?")
  const [vkPulses, setVkPulses] = useState(0);
  const isCalibrated = vkPulses >= 3;

  // Empathy Seals (12 total — unlocks Brushed Titanium at 6, 24K Straylight Gold at 12)
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

  // Manual chassis override or automatic by seals count
  const [chassisOverride, setChassisOverride] = useState(null);

  // Companion Owl Speech
  const [owlSpeech, setOwlSpeech] = useState(OWL_QUOTES.uncalibrated);
  const [tipIndex, setTipIndex] = useState(0);

  // Active ROM Cartridge in Section 2
  const [romCategory, setRomCategory] = useState('all');
  const [activeRomId, setActiveRomId] = useState(ROM_CARTRIDGES[0].id);
  const [showTerminalRun, setShowTerminalRun] = useState(false);

  // Active Telemetry Pin in Section 3
  const [selectedPin, setSelectedPin] = useState(TELEMETRY_PINS[TELEMETRY_PINS.length - 1]);

  // Section 4: Neuromancer Kuang Grade Mark XI ICEbreaker Mini-Game
  const [playerIntegrity, setPlayerIntegrity] = useState(100);
  const [iceShield, setIceShield] = useState(100);
  const [shieldBuff, setShieldBuff] = useState(false);
  const [combatLog, setCombatLog] = useState([
    'CONEXÃO MATRIZ ESTABELECIDA: Alvo -> Núcleo IA Wintermute (Tessier-Ashpool).',
    'Selecione uma rotina de ataque Backend para quebrar o gelo (ICE) da fortaleza.',
  ]);

  // Modals (Seals Vault & Quick Command Palette)
  const [sealsModalOpen, setSealsModalOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // Toast notification
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
        setOwlSpeech(OWL_QUOTES.titanium_upgrade);
      } else if (next.length === 12) {
        setOwlSpeech(OWL_QUOTES.gold_upgrade);
      }
      return next;
    });
  }, []);

  // Compute active chassis material
  const computedChassis =
    chassisOverride ||
    (unlockedSeals.length >= 12
      ? 'gold-24k'
      : unlockedSeals.length >= 6
      ? 'titanium'
      : 'polycarbonate');

  // Sync data-chassis and data-phosphor attributes on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-chassis', computedChassis);
  }, [computedChassis]);

  useEffect(() => {
    document.documentElement.setAttribute('data-phosphor', phosphorMode);
  }, [phosphorMode]);

  // Global keyboard shortcut Ctrl+K / Cmd+K
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

  // Voight-Kampff Calibration Pulse handler
  const handleVkPulse = () => {
    setVkPulses((prev) => {
      const next = Math.min(3, prev + 1);
      playVoightKampffPulse(soundOn, next);
      if (next >= 3) {
        setOwlSpeech(OWL_QUOTES.calibrated);
        unlockSeal('seal_calibrate');
      } else {
        setOwlSpeech(
          `CALIBRANDO LENTE VOIGHT-KAMPFF (${next}/3): Ajustando dilatação de pupila e foco óptico... Pressione mais ${3 - next}x.`
        );
      }
      return next;
    });
  };

  // Switch between Editorial Deck and Hosaka Desktop OS
  const handleSwitchMode = (mode) => {
    playKeyclick(soundOn, 780);
    setViewMode(mode);
    if (mode === 'os') {
      setOwlSpeech(OWL_QUOTES.os_mode);
      unlockSeal('seal_os_mode');
    } else {
      setOwlSpeech(OWL_QUOTES.editorial_mode);
    }
  };

  // Cycle Companion Owl advice
  const handlePokeOwl = () => {
    playKeyclick(soundOn, 880);
    unlockSeal('seal_owl');
    const nextIdx = (tipIndex + 1) % OWL_QUOTES.tips.length;
    setTipIndex(nextIdx);
    setOwlSpeech(OWL_QUOTES.tips[nextIdx]);
  };

  // Select ROM Cartridge
  const handleSelectRom = (romId) => {
    playKeyclick(soundOn, 720);
    setActiveRomId(romId);
    setShowTerminalRun(false);
    unlockSeal('seal_rom');
  };

  // Run ROM Live Diagnostics
  const handleRunRomTerminal = () => {
    playKeyclick(soundOn, 940);
    setShowTerminalRun(true);
    unlockSeal('seal_runner');
    notify('Diagnóstico de container/banco executado com sucesso.');
  };

  // Copy code or contact
  const handleCopyText = async (text, label) => {
    playKeyclick(soundOn, 820);
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
    unlockSeal('seal_dossier');
    notify(`${label} copiado para a área de transferência.`);
  };

  // Kuang Mark XI ICEbreaker turn-based move
  const handleIceMove = (moveType) => {
    playKeyclick(soundOn, 660);
    if (iceShield <= 0 || playerIntegrity <= 0) {
      setPlayerIntegrity(100);
      setIceShield(100);
      setShieldBuff(false);
      setCombatLog(['MATRIZ REINICIADA: Nova incursão contra o gelo Wintermute.']);
      return;
    }

    let dmgToIce = 0;
    let healDeck = 0;
    let newBuff = shieldBuff;
    let playerActionLine = '';

    if (moveType === 'kuang_sql') {
      dmgToIce = 34;
      playerActionLine = '▶ [T-SQL INDEX SEEK]: Você injetou uma Stored Procedure otimizada (-34% ICE).';
    } else if (moveType === 'avl_burst') {
      dmgToIce = 42;
      playerActionLine = '▶ [ROTAÇÃO ÁRVORE AVL O(log n)]: Desbalanceamento corrigido na matriz (-42% ICE).';
    } else if (moveType === 'acid_shield') {
      dmgToIce = 15;
      healDeck = 22;
      newBuff = true;
      playerActionLine = '▶ [TRANSAÇÃO ACID ROLLBACK]: Integridade restaurada (+22% Deck) e escudo ativo (-15% ICE).';
    } else if (moveType === 'sandevistan_net') {
      dmgToIce = 38;
      playerActionLine = '▶ [PIPELINE C#/.NET ASYNC]: Disparo concorrente de alta vazão (-38% ICE).';
    }

    const nextIce = Math.max(0, iceShield - dmgToIce);
    setIceShield(nextIce);

    if (nextIce === 0) {
      unlockSeal('seal_icebreaker');
      setCombatLog([
        playerActionLine,
        '★ VITÓRIA NO CIBERESPAÇO: O gelo da Tessier-Ashpool foi quebrado! Selo [VK-07 Cowboy do Ciberespaço] liberado.',
      ]);
      return;
    }

    // Enemy counter-attack
    const rawEnemyDmg = Math.floor(Math.random() * 14) + 12;
    const finalEnemyDmg = newBuff ? Math.floor(rawEnemyDmg * 0.45) : rawEnemyDmg;
    const nextPlayer = Math.min(100, Math.max(0, playerIntegrity + healDeck - finalEnemyDmg));
    setPlayerIntegrity(nextPlayer);
    setShieldBuff(false);

    setCombatLog([
      playerActionLine,
      `◀ [CONTRA-ATAQUE WINTERMUTE]: Pulso neural causou -${finalEnemyDmg}% no seu Cyberdeck.`,
    ]);
  };

  // Filtered ROMs
  const visibleRoms =
    romCategory === 'all'
      ? ROM_CARTRIDGES
      : ROM_CARTRIDGES.filter((r) => r.category === romCategory);

  const activeRom =
    ROM_CARTRIDGES.find((r) => r.id === activeRomId) || ROM_CARTRIDGES[0];

  // Command Palette Items
  const commandItems = [
    {
      label: 'Alternar para Bancada Hosaka OS (Janelas Multitarefa)',
      sub: 'MODO SISTEMA OPERACIONAL',
      action: () => handleSwitchMode('os'),
    },
    {
      label: 'Alternar para Dossiê Editorial Tyrell-84',
      sub: 'MODO LEITURA & ENGENHARIA',
      action: () => handleSwitchMode('editorial'),
    },
    {
      label: 'Calibrar Lente Voight-Kampff (100% Foco)',
      sub: 'BIOMETRIA',
      action: () => {
        setVkPulses(3);
        unlockSeal('seal_calibrate');
        setOwlSpeech(OWL_QUOTES.calibrated);
      },
    },
    {
      label: 'Alternar Fósforo CRT (Âmbar P3 / Verde Matriz P1)',
      sub: 'MONITOR CRT',
      action: () => setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber')),
    },
    {
      label: 'Abrir Cofre de Selos Voight-Kampff & Chassi',
      sub: `${unlockedSeals.length}/12 SELOS`,
      action: () => setSealsModalOpen(true),
    },
    ...ROM_CARTRIDGES.map((rom) => ({
      label: `Inspecionar Fita: ${rom.title}`,
      sub: rom.slot,
      action: () => {
        setViewMode('editorial');
        handleSelectRom(rom.id);
        const el = document.getElementById('sec-rom-bay');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        Pular para a bancada principal
      </a>

      {/* ====================================================================
          TOP TACTILE HARDWARE BAR
          ==================================================================== */}
      <header className="top-console-bar" role="banner">
        <div className="top-console-inner">
          <div className="brand-plate">
            <span className="brand-led" aria-hidden="true" />
            <span className="brand-model-code">ONO-SENDAI VII // TYRELL-84</span>
            <span className="brand-sub-tag">CHASSI: {computedChassis.toUpperCase()}</span>
          </div>

          {/* Mode Switcher: Editorial Deck (Felipe style) vs Hosaka OS (Madu style) */}
          <div className="mode-switch-group" role="tablist" aria-label="Modo de Operação da Estação">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'editorial'}
              className={`mode-switch-btn ${viewMode === 'editorial' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('editorial')}
            >
              ◆ DOSSIÊ &amp; BANCADA
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'os'}
              className={`mode-switch-btn ${viewMode === 'os' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('os')}
            >
              ▣ HOSAKA OS [6 APPS]
            </button>
          </div>

          <div className="console-right-controls">
            <button
              type="button"
              className="mini-rocker-btn"
              onClick={() => {
                playKeyclick(soundOn, 750);
                setCmdOpen(true);
              }}
              title="Abrir paleta de comandos (Ctrl+K)"
            >
              ⌘ COMANDOS [Ctrl+K]
            </button>

            <button
              type="button"
              className="mini-rocker-btn"
              onClick={() => {
                playKeyclick(soundOn, 690);
                setPhosphorMode((p) => (p === 'amber' ? 'green' : 'amber'));
              }}
              title="Alternar cor do fósforo CRT entre Âmbar P3 e Verde P1"
            >
              CRT: {phosphorMode === 'amber' ? 'ÂMBAR P3' : 'VERDE P1'}
            </button>

            <button
              type="button"
              className="mini-rocker-btn"
              aria-pressed={soundOn}
              onClick={() => setSoundOn((s) => !s)}
              title="Ativar ou silenciar cliques mecânicos e sintetizador"
            >
              SOM: {soundOn ? 'ON' : 'MUTE'}
            </button>

            <button
              type="button"
              className="seals-counter-pill t-nums"
              onClick={() => {
                playKeyclick(soundOn, 810);
                setSealsModalOpen(true);
              }}
              title="Ver Selos de Empatia Voight-Kampff e evoluir o metal do chassi"
            >
              <span>★ SELOS VK:</span>
              <strong>{unlockedSeals.length}/12</strong>
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          RACHEL-7 / WINTERMUTE MECHANICAL OWL COMPANION STRIP
          ==================================================================== */}
      <aside className="companion-strip" aria-label="Unidade Assistente Rachel-7">
        <div className="companion-card">
          <div className="companion-left">
            <button
              type="button"
              className="owl-avatar-btn"
              onClick={handlePokeOwl}
              title="Cutucar a coruja mecânica Rachel-7 para receber dicas de engenharia"
              aria-label="Consultar assistente mecânico Rachel-7"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--phosphor-primary)" strokeWidth="1.8">
                <circle cx="8.5" cy="10.5" r="3.2" />
                <circle cx="15.5" cy="10.5" r="3.2" />
                <circle cx="8.5" cy="10.5" r="1" fill="var(--phosphor-primary)" />
                <circle cx="15.5" cy="10.5" r="1" fill="var(--phosphor-primary)" />
                <path d="M12 13.5L10.5 16H13.5L12 13.5Z" />
                <path d="M4 7L7 4.5M20 7L17 4.5" />
                <rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>
            </button>
            <div className="companion-speech">
              <strong>UNIDADE RACHEL-7 // TYRELL CORP: </strong>
              <span>{owlSpeech}</span>
            </div>
          </div>

          <div className="companion-meta">
            <button type="button" className="keycap-btn crt-btn" onClick={handlePokeOwl}>
              OUTRA TRANSMISSÃO ↻
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          MAIN STAGE: SWITCH BETWEEN EDITORIAL DECK & HOSAKA DESKTOP OS
          ==================================================================== */}
      <main id="main-deck">
        {viewMode === 'os' ? (
          <HosakaDesktopOS
            soundOn={soundOn}
            unlockSeal={unlockSeal}
            notify={notify}
            unlockedSeals={unlockedSeals}
            chassisStage={computedChassis}
          />
        ) : (
          <div className="editorial-container">
            {/* ================================================================
                SECTION 1: HERO & VOIGHT-KAMPFF BIOMETRIC CALIBRATION
                ================================================================ */}
            <section className="hero-deck-grid" aria-labelledby="hero-heading">
              <div className="chassis-frame corner-screws hero-editorial-panel">
                <div>
                  <span className="eyebrow-badge">
                    ◆ TERMINAL DE ENGENHARIA BACKEND · SÉRIE 1984 / 2077
                  </span>
                  <h1 id="hero-heading" className="hero-title" style={{ marginTop: '14px' }}>
                    Miqueias Carvalho.{' '}
                    <span className="highlight-tag">Da query em produção</span> à arquitetura de APIs.
                  </h1>
                  <p className="hero-lead" style={{ marginTop: '14px' }}>
                    {PROFILE_DATA.summary} Atualmente na <strong>Zetti</strong> sustentando regras de negócio e bancos{' '}
                    <strong>SQL Server</strong> para dezenas de farmácias, graduando em Engenharia de Software na{' '}
                    <strong>UNIFAN (2027)</strong>.
                  </p>
                </div>

                <div className="hero-telemetry-strip">
                  <div className="telemetry-cell">
                    <small>OPERAÇÃO ATUAL (DEZ/2025 – HOJE)</small>
                    <strong>Zetti · SQL Server &amp; VB6</strong>
                  </div>
                  <div className="telemetry-cell">
                    <small>ECOSSISTEMA DE APIs &amp; POO</small>
                    <strong>C# / .NET · Java 17 · Node.js</strong>
                  </div>
                  <div className="telemetry-cell">
                    <small>FORMAÇÃO ACADÊMICA</small>
                    <strong>Eng. Software · UNIFAN</strong>
                  </div>
                </div>

                <div className="hero-cta-row">
                  <a href="#sec-rom-bay" className="keycap-btn primary" onClick={() => playKeyclick(soundOn, 760)}>
                    INSPECIONAR FITAS ROM [6] ↓
                  </a>
                  <button
                    type="button"
                    className="keycap-btn"
                    onClick={() => handleSwitchMode('os')}
                  >
                    ABRIR HOSAKA OS [JANELAS] ▣
                  </button>
                  <a
                    href={PROFILE_DATA.cvPdf}
                    download="Curriculo_Miqueias_Carvalho.pdf"
                    className="keycap-btn"
                    onClick={() => unlockSeal('seal_dossier')}
                  >
                    BAIXAR CURRÍCULO PDF ⬇
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Voight-Kampff Biometric Calibrator */}
              <div className="crt-monitor vk-calibrator-box">
                <div className="vk-top-header">
                  <span>UNIDADE ÓPTICA VOIGHT-KAMPFF // MODELO VK-84</span>
                  <span className="t-nums">
                    FOCO: {isCalibrated ? '100% ESTÁVEL' : `${vkPulses * 33}% DESALINHADO`}
                  </span>
                </div>

                <div className="vk-viewport">
                  <div className={`vk-portrait-frame ${isCalibrated ? '' : 'uncalibrated'}`}>
                    <img
                      src={PROFILE_DATA.portrait}
                      alt="Retrato de Miqueias Carvalho no visor Voight-Kampff"
                      width="272"
                      height="363"
                      fetchPriority="high"
                    />
                    <div className="vk-reticle-overlay">
                      <span>RETINA: MC-84</span>
                      <span>{isCalibrated ? 'HUMANO OK' : 'CALIBRAR'}</span>
                    </div>
                  </div>

                  <div className="vk-Waveforms">
                    <div className="vk-readout-row">
                      <span>SUJEITO:</span>
                      <strong>MIQUEIAS H. S. CARVALHO</strong>
                    </div>
                    <div className="vk-readout-row">
                      <span>ESPECIALIDADE:</span>
                      <strong>BACKEND C#/.NET &amp; SQL</strong>
                    </div>
                    <div className="vk-readout-row">
                      <span>ÍNDICE DE EMPATIA:</span>
                      <strong className="t-nums">{isCalibrated ? '98.4% VALIDADO' : 'AGUARDANDO PULSO'}</strong>
                    </div>
                    <div className="vk-readout-row">
                      <span>STATUS DE PRODUÇÃO:</span>
                      <strong>ZETTI · ATIVO</strong>
                    </div>

                    <div>
                      <small style={{ color: 'var(--crt-text-muted)', display: 'block', marginBottom: '4px' }}>
                        ESTÁGIOS DE CALIBRAÇÃO ÓPTICA ({vkPulses}/3):
                      </small>
                      <div className="vk-progress-pips" aria-hidden="true">
                        <span className={`vk-pip ${vkPulses >= 1 ? 'on' : ''}`} />
                        <span className={`vk-pip ${vkPulses >= 2 ? 'on' : ''}`} />
                        <span className={`vk-pip ${vkPulses >= 3 ? 'on' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="vk-controls-footer">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--crt-text-sub)' }}>
                    {isCalibrated
                      ? '✔ Lente Voight-Kampff estabilizada. Selo [VK-02] gravado.'
                      : 'A imagem está com ruído analógico. Ajude a calibrar a lente:'}
                  </span>
                  {!isCalibrated ? (
                    <button type="button" className="keycap-btn primary" onClick={handleVkPulse}>
                      PULSAR CALIBRAÇÃO ({vkPulses}/3) ⚡
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="keycap-btn crt-btn"
                      onClick={() => {
                        playKeyclick(soundOn, 520);
                        setVkPulses(0);
                      }}
                    >
                      REINICIAR LENTE ↺
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 2: HOSAKA ROM CARTRIDGE BAY (REAL PROJECTS & PRODUCTION)
                ================================================================ */}
            <section id="sec-rom-bay" aria-labelledby="rom-heading">
              <div className="section-header-bar">
                <div>
                  <h2 id="rom-heading">01 // Baia de Fitas ROM Hosaka (Produção &amp; Repositórios)</h2>
                  <p>
                    Cada cartucho guarda os bastidores reais de engenharia, trecho de código e simulação de terminal.
                  </p>
                </div>
                <div className="rom-filter-tabs" role="group" aria-label="Filtrar fitas ROM por categoria">
                  {[
                    { id: 'all', label: 'Todas (6)' },
                    { id: 'prod', label: 'Produção Zetti' },
                    { id: 'api', label: 'APIs REST (3)' },
                    { id: 'desktop', label: 'Desktop DAO' },
                    { id: 'algo', label: 'Estruturas O(1) / AVL' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`rom-tab-btn ${romCategory === tab.id ? 'active' : ''}`}
                      onClick={() => {
                        playKeyclick(soundOn, 700);
                        setRomCategory(tab.id);
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rom-deck-layout">
                {/* Left Rack: Physical ROM Cartridges */}
                <div className="rom-rack-list" role="listbox" aria-label="Cartuchos de Projeto">
                  {visibleRoms.map((rom) => {
                    const isSelected = rom.id === activeRom.id;
                    return (
                      <button
                        key={rom.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`rom-cartridge-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleSelectRom(rom.id)}
                      >
                        <div className="rom-cart-top">
                          <span>{rom.slot}</span>
                          <span>{isSelected ? '● INSERIDA' : 'INSERIR →'}</span>
                        </div>
                        <div className="rom-cart-title">{rom.title}</div>
                        <div className="rom-cart-sub">{rom.period}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Reader Bay: CRT Inspector */}
                <article className="crt-monitor rom-reader-bay" aria-live="polite">
                  <div className="rom-bay-header">
                    <div>
                      <span className="rom-slot-tag">
                        {activeRom.slot} · {activeRom.period}
                      </span>
                      <h3 className="rom-bay-title">{activeRom.title}</h3>
                    </div>
                    <a
                      href={activeRom.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="keycap-btn primary"
                    >
                      {activeRom.linkLabel} ↗
                    </a>
                  </div>

                  <div className="rom-impact-banner">
                    <strong>IMPACTO DIRETO: </strong>
                    {activeRom.impact}
                  </div>

                  <div className="rom-story-columns">
                    <div className="rom-story-box">
                      <h4>CONTEXTO DE OPERAÇÃO</h4>
                      <p>{activeRom.context}</p>
                    </div>
                    <div className="rom-story-box">
                      <h4>POR TRÁS DA ENTREGA TÉCNICA</h4>
                      <ul>
                        {activeRom.engineering.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ zIndex: 3 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--phosphor-secondary)',
                      }}
                    >
                      <span> TRECHO DE CÓDIGO DA FITA ({activeRom.id})</span>
                      <button
                        type="button"
                        className="keycap-btn crt-btn"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => handleCopyText(activeRom.codeSnippet, 'Snippet de código')}
                      >
                        COPIAR CÓDIGO
                      </button>
                    </div>
                    <pre className="rom-code-terminal" translate="no">
                      {activeRom.codeSnippet}
                    </pre>
                  </div>

                  {showTerminalRun && (
                    <div style={{ zIndex: 3 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--phosphor-green)',
                          marginBottom: '4px',
                        }}
                      >
                        SAÍDA DO TERMINAL HOSAKA:
                      </div>
                      <pre className="rom-code-terminal" translate="no">
                        {activeRom.terminalOutput}
                      </pre>
                    </div>
                  )}

                  <div className="rom-stack-chips">
                    {activeRom.stack.map((tech) => (
                      <span key={tech} className="rom-chip">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="rom-actions-bar">
                    <button type="button" className="keycap-btn primary" onClick={handleRunRomTerminal}>
                      ▶ RODAR DIAGNÓSTICO NO TERMINAL
                    </button>
                    <a
                      href={activeRom.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="keycap-btn crt-btn"
                    >
                      INSPECIONAR FONTE ↗
                    </a>
                  </div>
                </article>
              </div>
            </section>

            {/* ================================================================
                SECTION 3: TACTILE PUNCH-CARD TELEMETRY PLAQUE (FELIPE STYLE)
                ================================================================ */}
            <section id="sec-telemetry" aria-labelledby="matrix-heading">
              <div className="section-header-bar">
                <div>
                  <h2 id="matrix-heading">02 // Placa de Telemetria &amp; Commits (Pulso a Pulso)</h2>
                  <p>
                    Cada pino luminoso grava um marco real da trajetória de Miqueias (2021 → 2026). Passe o cursor ou clique nos pinos.
                  </p>
                </div>
                <a
                  href={PROFILE_DATA.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="keycap-btn"
                >
                  GITHUB.COM/MIQUEIAS-HENRIQUE ↗
                </a>
              </div>

              <div className="chassis-frame corner-screws matrix-plaque-card">
                <div className="matrix-stats-row">
                  <div className="matrix-stat-box">
                    <small>REPOSITÓRIOS PÚBLICOS</small>
                    <strong className="t-nums">27 REPOS</strong>
                  </div>
                  <div className="matrix-stat-box">
                    <small>SUSTENTAÇÃO EM PRODUÇÃO</small>
                    <strong className="t-nums">SQL SERVER &amp; VB6</strong>
                  </div>
                  <div className="matrix-stat-box">
                    <small>APIs &amp; BACKEND</small>
                    <strong className="t-nums">C# · JAVA · NODE</strong>
                  </div>
                  <div className="matrix-stat-box">
                    <small>ENGENHARIA DE SOFTWARE</small>
                    <strong className="t-nums">UNIFAN · 2027</strong>
                  </div>
                </div>

                <div className="punch-grid-wrap">
                  <div className="punch-grid" role="list" aria-label="Pinos de telemetria histórica">
                    {TELEMETRY_PINS.map((pin) => (
                      <button
                        key={pin.id}
                        type="button"
                        className="punch-pin"
                        data-level={pin.level}
                        title={`${pin.code}: ${pin.label}`}
                        aria-label={`Marco ${pin.code}: ${pin.label}`}
                        onMouseEnter={() => setSelectedPin(pin)}
                        onClick={() => {
                          playKeyclick(soundOn, 850);
                          setSelectedPin(pin);
                          unlockSeal('seal_matrix');
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="matrix-inspector-strip" aria-live="polite">
                  <div>
                    <strong style={{ color: 'var(--ink-accent)', marginRight: '8px' }}>
                      [{selectedPin.code} · {selectedPin.commits} PULSOS REGISTRADOS]:
                    </strong>
                    <span>{selectedPin.label}</span>
                  </div>
                  <span style={{ color: 'var(--ink-muted)' }}>
                    Clique em qualquer pino para cravar o Selo [VK-06]
                  </span>
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 4: NEUROMANCER KUANG MARK XI ICEBREAKER DUEL
                ================================================================ */}
            <section id="sec-icebreaker" aria-labelledby="ice-heading">
              <div className="section-header-bar">
                <div>
                  <h2 id="ice-heading">03 // Incursão Kuang Grade Mark XI (Quebra de Gelo Wintermute)</h2>
                  <p>
                    Inspirado em Neuromancer (William Gibson). Use algoritmos e transações reais do seu repertório para quebrar o ICE.
                  </p>
                </div>
                <button
                  type="button"
                  className="keycap-btn"
                  onClick={() => {
                    playKeyclick(soundOn, 540);
                    setPlayerIntegrity(100);
                    setIceShield(100);
                    setCombatLog(['MATRIZ REINICIADA: Escolha uma rotina para iniciar a incursão.']);
                  }}
                >
                  REINICIAR MATRIZ ↺
                </button>
              </div>

              <div className="icebreaker-arena">
                <div className="crt-monitor ice-combat-screen">
                  <div className="ice-boss-row">
                    <div className="ice-fighter-box">
                      <div className="ice-fighter-header">
                        <span style={{ color: 'var(--phosphor-green)' }}>CYBERDECK ONO-SENDAI (VOCÊ)</span>
                        <span className="t-nums">{playerIntegrity}%</span>
                      </div>
                      <div className="ice-hp-bar">
                        <div className="ice-hp-fill" style={{ width: `${playerIntegrity}%` }} />
                      </div>
                    </div>

                    <div className="ice-fighter-box">
                      <div className="ice-fighter-header">
                        <span style={{ color: 'var(--phosphor-alert)' }}>FORTALEZA ICE WINTERMUTE</span>
                        <span className="t-nums">{iceShield}%</span>
                      </div>
                      <div className="ice-hp-bar">
                        <div className="ice-hp-fill enemy" style={{ width: `${iceShield}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="ice-battle-log" aria-live="polite">
                    {combatLog.map((entry, idx) => (
                      <div key={idx}>{entry}</div>
                    ))}
                  </div>

                  <div className="ice-moves-grid">
                    <button
                      type="button"
                      className="keycap-btn crt-btn"
                      onClick={() => handleIceMove('kuang_sql')}
                    >
                      ⚡ T-SQL Index Seek (-34% ICE)
                    </button>
                    <button
                      type="button"
                      className="keycap-btn crt-btn"
                      onClick={() => handleIceMove('avl_burst')}
                    >
                      ◆ Rotação Árvore AVL O(log n) (-42% ICE)
                    </button>
                    <button
                      type="button"
                      className="keycap-btn crt-btn"
                      onClick={() => handleIceMove('sandevistan_net')}
                    >
                      ▶ Pipeline C#/.NET Async (-38% ICE)
                    </button>
                    <button
                      type="button"
                      className="keycap-btn crt-btn"
                      onClick={() => handleIceMove('acid_shield')}
                    >
                      ✚ Rollback ACID (+22% Deck &amp; Escudo)
                    </button>
                  </div>
                </div>

                {/* Right Column: Hardware Evolution & Seals Preview */}
                <div className="chassis-frame corner-screws" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <span className="eyebrow-badge">EVOLUÇÃO FÍSICA DA ESTAÇÃO</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginTop: '10px' }}>
                      Policarbonato → Titânio → Ouro 24K
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', marginTop: '6px' }}>
                      Assim como um artefato vivo, cada interação na bancada grava um <strong>Selo Voight-Kampff</strong> no seu navegador. Ao atingir 6 selos, o chassi evolui para <strong>Titânio Escovado Tyrell</strong>; com 12 selos (ou usando o seletor rápido abaixo), funde-se em <strong>Ouro 24K Villa Straylight</strong>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
                      TESTAR LIGA METÁLICA DO CHASSI AGORA:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`keycap-btn ${computedChassis === 'polycarbonate' ? 'primary' : ''}`}
                        onClick={() => {
                          playKeyclick(soundOn, 640);
                          setChassisOverride('polycarbonate');
                        }}
                      >
                        1. Policarbonato 84
                      </button>
                      <button
                        type="button"
                        className={`keycap-btn ${computedChassis === 'titanium' ? 'primary' : ''}`}
                        onClick={() => {
                          playKeyclick(soundOn, 740);
                          setChassisOverride('titanium');
                        }}
                      >
                        2. Titânio Tyrell
                      </button>
                      <button
                        type="button"
                        className={`keycap-btn ${computedChassis === 'gold-24k' ? 'primary' : ''}`}
                        onClick={() => {
                          playKeyclick(soundOn, 880);
                          setChassisOverride('gold-24k');
                        }}
                      >
                        3. Ouro 24K Straylight
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="keycap-btn"
                    onClick={() => setSealsModalOpen(true)}
                  >
                    ABRIR INVENTÁRIO DE SELOS ({unlockedSeals.length}/12) ★
                  </button>
                </div>
              </div>
            </section>

            {/* ================================================================
                SECTION 5: ESPERANZA HARDWARE COMMUNICATION PORTS (CONTACT)
                ================================================================ */}
            <section id="sec-contact" aria-labelledby="ports-heading">
              <div className="section-header-bar">
                <div>
                  <h2 id="ports-heading">04 // Portas de Comunicação Direta (Escolha um Conector)</h2>
                  <p>
                    Conecte-se diretamente com Miqueias Carvalho para oportunidades Backend, C#/.NET, SQL Server ou Java.
                  </p>
                </div>
              </div>

              <div className="ports-grid">
                <div className="port-socket-card">
                  <div>
                    <div className="port-pin-header">
                      <span>PORTA RS-232 // E-MAIL</span>
                      <span>[ONLINE]</span>
                    </div>
                    <h3 style={{ marginTop: '6px' }}>Correio Eletrônico</h3>
                    <p style={{ marginTop: '4px' }}>{PROFILE_DATA.email}</p>
                  </div>
                  <button
                    type="button"
                    className="keycap-btn primary"
                    onClick={() => handleCopyText(PROFILE_DATA.email, 'E-mail de Miqueias')}
                  >
                    COPIAR E-MAIL
                  </button>
                </div>

                <a
                  href={PROFILE_DATA.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="port-socket-card"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <div>
                    <div className="port-pin-header">
                      <span>PORTA VID-PHON // WHATSAPP</span>
                      <span>[DIRETO]</span>
                    </div>
                    <h3 style={{ marginTop: '6px' }}>Linha Direta Goiânia</h3>
                    <p style={{ marginTop: '4px' }}>{PROFILE_DATA.phoneDisplay}</p>
                  </div>
                  <span className="keycap-btn">CHAMAR NO WHATSAPP ↗</span>
                </a>

                <a
                  href={PROFILE_DATA.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="port-socket-card"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <div>
                    <div className="port-pin-header">
                      <span>PORTA HOSAKA NET // LINKEDIN</span>
                      <span>[PERFIL]</span>
                    </div>
                    <h3 style={{ marginTop: '6px' }}>LinkedIn Profissional</h3>
                    <p style={{ marginTop: '4px' }}>in/miqueias-henrique-88503b218</p>
                  </div>
                  <span className="keycap-btn">ABRIR LINKEDIN ↗</span>
                </a>

                <a
                  href={PROFILE_DATA.cvPdf}
                  download="Curriculo_Miqueias_Carvalho.pdf"
                  className="port-socket-card"
                  onClick={() => unlockSeal('seal_dossier')}
                >
                  <div>
                    <div className="port-pin-header">
                      <span>HARD COPY // DOSSIÊ PDF</span>
                      <span>[53 KB]</span>
                    </div>
                    <h3 style={{ marginTop: '6px' }}>Currículo Oficial PDF</h3>
                    <p style={{ marginTop: '4px' }}>Curriculo_Miqueias_Carvalho.pdf</p>
                  </div>
                  <span className="keycap-btn primary">BAIXAR PDF ⬇</span>
                </a>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ====================================================================
          FOOTER SERIAL PLATE
          ==================================================================== */}
      <footer className="serial-footer">
        <div className="chassis-frame serial-footer-inner">
          <div>
            <strong>ONO-SENDAI CYBERSPACE VII // TYRELL-84</strong> · Desenvolvido por Miqueias Carvalho · Goiânia, GO
          </div>
          <div className="stack-badges-strip">
            {['C# / .NET', 'SQL Server', 'VB6', 'Java 17 & Spring Boot 3', 'Node.js & NestJS', 'PostgreSQL & MySQL', 'Docker'].map(
              (tech) => (
                <span key={tech} className="stack-mini-pill">
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MODAL 1: VOIGHT-KAMPFF SEALS & HARDWARE CHASSIS VAULT
          ==================================================================== */}
      {sealsModalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seals-modal-title"
          onClick={() => setSealsModalOpen(false)}
        >
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span id="seals-modal-title">
                ★ INVENTÁRIO DE SELOS VOIGHT-KAMPFF ({unlockedSeals.length}/12)
              </span>
              <button
                type="button"
                className="os-win-ctrl-btn"
                onClick={() => setSealsModalOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  Desbloqueie selos explorando a bancada ou libere todos para testar a transformação em Ouro 24K:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="keycap-btn primary"
                    onClick={() => {
                      const allIds = EMPATHY_SEALS.map((s) => s.id);
                      setUnlockedSeals(allIds);
                      setChassisOverride(null);
                      setOwlSpeech(OWL_QUOTES.gold_upgrade);
                      notify('Todos os 12 Selos Voight-Kampff liberados! Chassi Ouro 24K ativo.');
                    }}
                  >
                    LIBERAR TODOS (12/12)
                  </button>
                  <button
                    type="button"
                    className="keycap-btn"
                    onClick={() => {
                      setUnlockedSeals(['seal_boot']);
                      setChassisOverride(null);
                      notify('Progresso de selos reiniciado.');
                    }}
                  >
                    ZERAR
                  </button>
                </div>
              </div>

              <div className="seals-grid">
                {EMPATHY_SEALS.map((seal) => {
                  const isUnlocked = unlockedSeals.includes(seal.id);
                  return (
                    <div
                      key={seal.id}
                      className={`seal-badge-card ${isUnlocked ? 'unlocked' : ''}`}
                    >
                      <strong>
                        [{seal.code}] {seal.title}
                      </strong>
                      <span>{seal.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: QUICK COMMAND PALETTE (CTRL+K)
          ==================================================================== */}
      {cmdOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmd-modal-title"
          onClick={() => setCmdOpen(false)}
        >
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <span id="cmd-modal-title">⌘ TERMINAL DE COMANDO RÁPIDO ONO-SENDAI</span>
              <button type="button" className="os-win-ctrl-btn" onClick={() => setCmdOpen(false)}>
                ×
              </button>
            </header>
            <div className="modal-body">
              <input
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Buscar fita ROM, modo Hosaka OS, lente Voight-Kampff..."
                aria-label="Filtrar comandos da estação"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  background: 'var(--crt-bg)',
                  color: 'var(--phosphor-primary)',
                  border: '2px solid var(--chassis-border)',
                  borderRadius: '4px',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {commandItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="keycap-btn"
                    style={{ justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                    onClick={() => {
                      item.action();
                      setCmdOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    <small style={{ color: 'var(--ink-muted)' }}>{item.sub}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TOAST NOTIFICATION
          ==================================================================== */}
      {toastMsg && (
        <div className="hardware-toast" role="status" aria-live="polite">
          ◆ {toastMsg}
        </div>
      )}
    </>
  );
}
