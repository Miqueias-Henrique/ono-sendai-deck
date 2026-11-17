import React, { useState } from 'react';
import { PROFILE_DATA, ROM_CARTRIDGES, SQL_PRESETS } from '../data/portfolioData';
import { playKeyclick, playVangelisChord } from '../utils/soundEngine';

const OS_APPS = [
  { id: 'explorer', title: 'ROM_EXPLORER.EXE', label: 'Cartuchos ROM', glyph: '[ROM]' },
  { id: 'sqlbench', title: 'ZETTI_SQL_BENCH.EXE', label: 'SQL Bench', glyph: '[SQL]' },
  { id: 'esper', title: 'ESPER_PHOTOLAB.EXE', label: 'Esper 2019', glyph: '[ESP]' },
  { id: 'synth', title: 'CS80_VANGELIS.EXE', label: 'Deck CS-80', glyph: '[SYN]' },
  { id: 'flatline', title: 'DIXIE_CONSTRUCT.SH', label: 'Dixie CLI', glyph: '[CLI]' },
  { id: 'biometry', title: 'DOSSIE_VK84.SYS', label: 'Ficha VK-84', glyph: '[BIO]' },
];

const SYNTH_PADS = [
  { id: 'tears', label: 'Tears in Rain (Lá Menor)', notes: [220.0, 261.63, 329.63, 392.0], freqLabel: '220Hz · CS-80 Brass' },
  { id: 'chiba', label: 'Chiba City Blues (Ré Dórico)', notes: [146.83, 220.0, 261.63, 329.63], freqLabel: '146.8Hz · Hosaka Sub' },
  { id: 'straylight', label: 'Villa Straylight (Fá# 7M)', notes: [185.0, 277.18, 329.63, 440.0], freqLabel: '185Hz · Orbital Pad' },
  { id: 'tyrell', label: 'Tyrell Pyramid (Mi Suspenso)', notes: [164.81, 246.94, 293.66, 369.99], freqLabel: '164.8Hz · Rachel Owl' },
];

export default function HosakaDesktopOS({
  soundOn,
  unlockSeal,
  notify,
  unlockedSeals,
  chassisStage,
}) {
  const [openWindows, setOpenWindows] = useState(['explorer', 'sqlbench']);
  const [activeWin, setActiveWin] = useState('explorer');

  // Explorer state
  const [selectedRomId, setSelectedRomId] = useState(ROM_CARTRIDGES[0].id);

  // SQL Bench state
  const [selectedSqlId, setSelectedSqlId] = useState(SQL_PRESETS[0].id);
  const [customSql, setCustomSql] = useState(SQL_PRESETS[0].sql);
  const [sqlResultRows, setSqlResultRows] = useState(SQL_PRESETS[0].rows);
  const [sqlExecStatus, setSqlExecStatus] = useState('PRONTO · 3 LINHAS RETORNADAS (1.4ms)');

  // Esper 2019 PhotoLab state
  const [esperZoom, setEsperZoom] = useState(1);
  const [esperFilter, setEsperFilter] = useState('normal');
  const [esperSector, setEsperSector] = useState('SETOR 44-B · RETINA VALIDADA');

  // CS-80 Synth state
  const [lastPad, setLastPad] = useState(SYNTH_PADS[0]);

  // Dixie Flatline CLI state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    'ROM CONSTRUCT: McCoy Pauley "Dixie Flatline" (ONO-SENDAI BIOS v2.84)',
    'Digite "help", "stack", "zetti", "projetos", "unifan" ou "contato".',
  ]);

  const toggleAppWindow = (appId) => {
    playKeyclick(soundOn, 760);
    if (!openWindows.includes(appId)) {
      setOpenWindows((prev) => [...prev, appId]);
    }
    setActiveWin(appId);
  };

  const closeAppWindow = (appId) => {
    playKeyclick(soundOn, 420);
    setOpenWindows((prev) => prev.filter((id) => id !== appId));
    if (activeWin === appId) {
      const remaining = openWindows.filter((id) => id !== appId);
      setActiveWin(remaining[remaining.length - 1] || '');
    }
  };

  const runSqlPreset = (preset) => {
    playKeyclick(soundOn, 840);
    setSelectedSqlId(preset.id);
    setCustomSql(preset.sql);
    setSqlResultRows(preset.rows);
    setSqlExecStatus(`EXECUÇÃO OK · ${preset.rows.length} REGISTROS (${(Math.random() * 1.8 + 0.8).toFixed(2)}ms)`);
    unlockSeal('seal_sql_bench');
    notify('Consulta SQL executada no cluster Hosaka.');
  };

  const handleExecuteCustomSql = () => {
    playKeyclick(soundOn, 920);
    unlockSeal('seal_sql_bench');
    const currentPreset = SQL_PRESETS.find((p) => p.id === selectedSqlId) || SQL_PRESETS[0];
    setSqlResultRows(currentPreset.rows);
    setSqlExecStatus(`QUERY ANALISADA E EXECUTADA · ${currentPreset.rows.length} LINHAS AFETADAS`);
    notify('Plano de execução SQL validado (Index Seek).');
  };

  const handleEsperCommand = (zoomVal, filterVal, sectorLabel) => {
    playKeyclick(soundOn, 790);
    setEsperZoom(zoomVal);
    setEsperFilter(filterVal);
    setEsperSector(sectorLabel);
    unlockSeal('seal_esper');
  };

  const handleTriggerSynth = (pad) => {
    setLastPad(pad);
    playVangelisChord(soundOn || true, pad.notes);
    unlockSeal('seal_synth');
    notify(`Sintetizador CS-80: ${pad.label}`);
  };

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const raw = cliInput.trim();
    if (!raw) return;
    playKeyclick(soundOn, 720);
    const cmd = raw.toLowerCase();
    let reply = '';

    if (cmd === 'help') {
      reply = 'COMANDOS: stack | zetti | projetos | unifan | contato | clear';
    } else if (cmd === 'stack') {
      reply = 'BACKEND: C#/.NET, SQL Server, VB6, Java 17 (Spring Boot 3, JavaFX), Node.js (TypeScript, NestJS, Prisma, TypeORM), PostgreSQL, MySQL, Docker.';
    } else if (cmd === 'zetti') {
      reply = 'ZETTI (Dez/2025 - Atual): Desenvolvimento e otimização de queries, views e stored procedures em SQL Server + sustentação VB6 e CNPJ Alfanumérico.';
    } else if (cmd === 'projetos') {
      reply = 'REPOSITÓRIOS: api-gestao-produtos | vosso-cinema-api | vital-conscious-api | controle-estoque-javafx | catalogo-livros-avl-bst | tabela-hash-cpf-java';
    } else if (cmd === 'unifan') {
      reply = 'FORMAÇÃO: Bacharelado em Engenharia de Software na UNIFAN (Conclusão prevista: 2027).';
    } else if (cmd === 'contato') {
      reply = `E-MAIL: ${PROFILE_DATA.email} | WHATSAPP: ${PROFILE_DATA.phoneDisplay}`;
    } else if (cmd === 'clear') {
      setCliHistory(['Terminal limpo. Digite "help" para comandos.']);
      setCliInput('');
      return;
    } else {
      reply = `Dixie Flatline: Comando "${raw}" processado. Tente "stack", "zetti" ou "projetos".`;
    }

    setCliHistory((prev) => [...prev, `cowboy@ono-sendai:~$ ${raw}`, reply]);
    setCliInput('');
  };

  const selectedRom = ROM_CARTRIDGES.find((r) => r.id === selectedRomId) || ROM_CARTRIDGES[0];

  const getEsperFilterStyle = () => {
    let filterStr = 'none';
    if (esperFilter === 'amber') filterStr = 'sepia(0.9) hue-rotate(-10deg) contrast(1.35)';
    if (esperFilter === 'xray') filterStr = 'invert(0.92) hue-rotate(155deg) contrast(1.4)';
    if (esperFilter === 'highcontrast') filterStr = 'grayscale(1) contrast(1.65) brightness(1.05)';
    return {
      transform: `scale(${esperZoom})`,
      filter: filterStr,
    };
  };

  return (
    <section className="os-desktop-stage" aria-label="Área de Trabalho Multitarefa Hosaka H-84 OS">
      <div className="crt-monitor os-monitor-screen">
        {/* Top OS Status Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            marginBottom: '14px',
            borderBottom: '1px solid var(--crt-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            color: 'var(--phosphor-primary)',
            position: 'relative',
            zIndex: 3,
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>HOSAKA H-84 WORKSTATION OS // MEMÓRIA: 640K OK · {openWindows.length} JANELA(S) ATIVA(S)</span>
          <span>CLIQUE NOS ÍCONES DO DESKTOP PARA ABRIR APLICATIVOS DA ESTAÇÃO</span>
        </div>

        {/* Desktop Icons Grid */}
        <div className="os-desktop-icons" role="toolbar" aria-label="Aplicativos da Bancada">
          {OS_APPS.map((app) => {
            const isOpen = openWindows.includes(app.id);
            return (
              <button
                key={app.id}
                type="button"
                className={`os-desktop-icon-btn ${isOpen ? 'active' : ''}`}
                onClick={() => toggleAppWindow(app.id)}
              >
                <span className="os-icon-glyph">{app.glyph}</span>
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>

        {/* Open Windows Workspace */}
        <div className="os-windows-layer">
          {openWindows.length === 0 && (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                border: '1px dashed var(--crt-border)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--crt-text-muted)',
              }}
            >
              Nenhuma janela aberta no monitor CRT. Clique em qualquer ícone acima ([ROM], [SQL], [ESP], [SYN], [CLI]) para iniciar.
            </div>
          )}

          {/* WINDOW 1: ROM EXPLORER */}
          {openWindows.includes('explorer') && (
            <article
              className={`os-window ${activeWin === 'explorer' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('explorer')}
            >
              <header className="os-window-titlebar">
                <span>[ROM] C:\HOSAKA\FITAS_ROM\EXPLORER.EXE — {selectedRom.title}</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    title="Fechar janela"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('explorer');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(210px, 260px) 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {ROM_CARTRIDGES.map((rom) => (
                      <button
                        key={rom.id}
                        type="button"
                        className="keycap-btn crt-btn"
                        style={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          background: selectedRomId === rom.id ? 'var(--phosphor-primary)' : 'var(--crt-card)',
                          color: selectedRomId === rom.id ? '#120D04' : 'var(--crt-text)',
                        }}
                        onClick={() => {
                          playKeyclick(soundOn, 740);
                          setSelectedRomId(rom.id);
                          unlockSeal('seal_rom');
                        }}
                      >
                        {rom.title.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--phosphor-secondary)' }}>
                      {selectedRom.slot} · {selectedRom.period}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--phosphor-primary)' }}>
                      {selectedRom.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--crt-text-sub)' }}>{selectedRom.headline}</p>
                    <pre className="rom-code-terminal" translate="no">
                      {selectedRom.codeSnippet}
                    </pre>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <a
                        href={selectedRom.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="keycap-btn primary"
                      >
                        {selectedRom.linkLabel} ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* WINDOW 2: ZETTI SQL BENCH */}
          {openWindows.includes('sqlbench') && (
            <article
              className={`os-window ${activeWin === 'sqlbench' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('sqlbench')}
            >
              <header className="os-window-titlebar">
                <span>[SQL] ZETTI_SQL_SERVER_BENCH.EXE — CONSULTAS EM PRODUÇÃO</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    title="Fechar janela"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('sqlbench');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SQL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="keycap-btn crt-btn"
                      style={{
                        background: selectedSqlId === preset.id ? 'var(--phosphor-primary)' : 'var(--crt-card)',
                        color: selectedSqlId === preset.id ? '#120D04' : 'var(--phosphor-primary)',
                      }}
                      onClick={() => runSqlPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button type="button" className="keycap-btn primary" onClick={handleExecuteCustomSql}>
                    ▶ EXECUTAR T-SQL (F5)
                  </button>
                </div>

                <textarea
                  aria-label="Editor de consulta SQL"
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  rows={4}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    background: '#060503',
                    color: 'var(--phosphor-green)',
                    border: '1px solid var(--crt-border-strong)',
                    padding: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    borderRadius: '3px',
                  }}
                />

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--phosphor-secondary)' }}>
                  STATUS: {sqlExecStatus}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                    }}
                  >
                    <thead>
                      <tr style={{ background: 'var(--crt-card)', color: 'var(--phosphor-primary)' }}>
                        {sqlResultRows.length > 0 &&
                          Object.keys(sqlResultRows[0]).map((col) => (
                            <th
                              key={col}
                              style={{
                                border: '1px solid var(--crt-border)',
                                padding: '6px 10px',
                                textAlign: 'left',
                              }}
                            >
                              {col}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResultRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--crt-hairline)' }}>
                          {Object.values(row).map((val, cIdx) => (
                            <td
                              key={cIdx}
                              style={{
                                border: '1px solid var(--crt-border)',
                                padding: '6px 10px',
                                color: 'var(--crt-text-sub)',
                              }}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          )}

          {/* WINDOW 3: ESPER 2019 PHOTOLAB (Blade Runner "Enhance 224 to 176") */}
          {openWindows.includes('esper') && (
            <article
              className={`os-window ${activeWin === 'esper' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('esper')}
            >
              <header className="os-window-titlebar">
                <span>[ESP] ESPER_OPTICAL_ENHANCE_2019.EXE — ANÁLISE DE RETRATO</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('esper');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body">
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '18px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '190px',
                      height: '230px',
                      overflow: 'hidden',
                      border: '2px solid var(--phosphor-primary)',
                      position: 'relative',
                      background: '#050403',
                    }}
                  >
                    <img
                      src={PROFILE_DATA.portrait}
                      alt="Miqueias Carvalho no Esper PhotoLab"
                      width="272"
                      height="363"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease, filter 0.3s ease',
                        ...getEsperFilterStyle(),
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--phosphor-primary)' }}>
                      TELEMETRIA ESPER: {esperSector} · ZOOM: {esperZoom}x
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--crt-text-sub)' }}>
                      Inspirado na máquina Esper de Rick Deckard (Blade Runner). Aplique comandos de ampliação e espectro óptico sobre o retrato oficial (`portrait-2.webp`).
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="keycap-btn crt-btn"
                        onClick={() => handleEsperCommand(1, 'normal', 'QUADRO ORIGINAL 1.0x')}
                      >
                        1.0x Normal
                      </button>
                      <button
                        type="button"
                        className="keycap-btn crt-btn"
                        onClick={() => handleEsperCommand(1.22, 'amber', 'ENHANCE 224 TO 176 · FÓSFORO ÂMBAR')}
                      >
                        Enhance 1.22x Âmbar
                      </button>
                      <button
                        type="button"
                        className="keycap-btn crt-btn"
                        onClick={() => handleEsperCommand(1.38, 'xray', 'TRACK 45 RIGHT · ESPECTRO MATRIZ')}
                      >
                        Track 1.38x Espectro
                      </button>
                      <button
                        type="button"
                        className="keycap-btn crt-btn"
                        onClick={() => handleEsperCommand(1.15, 'highcontrast', 'HARD COPY PRINT · MONOCROMO')}
                      >
                        Hard Copy P&B
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* WINDOW 4: VANGELIS CS-80 SYNTH DECK */}
          {openWindows.includes('synth') && (
            <article
              className={`os-window ${activeWin === 'synth' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('synth')}
            >
              <header className="os-window-titlebar">
                <span>[SYN] YAMAHA_CS80_BLUES_SYNTH.EXE — SINTETIZADOR ANALÓGICO</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('synth');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--crt-text-sub)' }}>
                  Dispare acordes analógicos sintetizados em tempo real via WebAudio API (filtros passa-baixa ressonantes inspirados na trilha de Blade Runner).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {SYNTH_PADS.map((pad) => (
                    <button
                      key={pad.id}
                      type="button"
                      className="keycap-btn crt-btn"
                      style={{ justifyContent: 'space-between', padding: '12px' }}
                      onClick={() => handleTriggerSynth(pad)}
                    >
                      <span>♪ {pad.label}</span>
                      <small style={{ color: 'var(--phosphor-secondary)' }}>{pad.freqLabel}</small>
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--phosphor-primary)' }}>
                  ÚLTIMA FREQUÊNCIA ATIVA: {lastPad.label} ({lastPad.freqLabel})
                </div>
              </div>
            </article>
          )}

          {/* WINDOW 5: DIXIE FLATLINE ROM CONSTRUCT CLI */}
          {openWindows.includes('flatline') && (
            <article
              className={`os-window ${activeWin === 'flatline' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('flatline')}
            >
              <header className="os-window-titlebar">
                <span>[CLI] DIXIE_FLATLINE_CONSTRUCT.SH — TERMINAL NEUROMANCER</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('flatline');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="rom-code-terminal" style={{ maxHeight: '160px' }}>
                  {cliHistory.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                <form onSubmit={handleCliSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Digite stack, zetti, projetos, unifan ou contato..."
                    aria-label="Comando para o terminal Dixie Flatline"
                    style={{
                      flex: 1,
                      background: '#060503',
                      color: 'var(--phosphor-primary)',
                      border: '1px solid var(--crt-border-strong)',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}
                  />
                  <button type="submit" className="keycap-btn primary">
                    ENVIAR
                  </button>
                </form>
              </div>
            </article>
          )}

          {/* WINDOW 6: BIOMETRY & CHASSIS STATUS */}
          {openWindows.includes('biometry') && (
            <article
              className={`os-window ${activeWin === 'biometry' ? '' : 'inactive'}`}
              onClick={() => setActiveWin('biometry')}
            >
              <header className="os-window-titlebar">
                <span>[BIO] DOSSIE_ENGENHEIRO_VK84.SYS — PROPRIEDADES DO SISTEMA</span>
                <div className="os-win-controls">
                  <button
                    type="button"
                    className="os-win-ctrl-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeAppWindow('biometry');
                    }}
                  >
                    ×
                  </button>
                </div>
              </header>
              <div className="os-window-body" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <p><strong>ENGENHEIRO:</strong> {PROFILE_DATA.fullName}</p>
                <p><strong>CARGO ATUAL:</strong> {PROFILE_DATA.currentJob}</p>
                <p><strong>GRADUAÇÃO:</strong> {PROFILE_DATA.education}</p>
                <p><strong>CHASSI ATUAL:</strong> {chassisStage.toUpperCase()} ({unlockedSeals.length}/12 Selos VK)</p>
                <div style={{ marginTop: '12px' }}>
                  <a href={PROFILE_DATA.cvPdf} download="Curriculo_Miqueias_Carvalho.pdf" className="keycap-btn primary">
                    BAIXAR CURRÍCULO PDF
                  </a>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Bottom OS Taskbar */}
        <footer className="os-taskbar">
          <div className="os-taskbar-apps">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '12px', paddingRight: '8px' }}>
              ◆ HOSAKA START
            </span>
            {OS_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                className={`os-task-pill ${openWindows.includes(app.id) ? 'active' : ''}`}
                onClick={() => toggleAppWindow(app.id)}
              >
                {app.glyph} {app.label}
              </button>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            SELOS VK: {unlockedSeals.length}/12 · GOIÂNIA SECTOR
          </div>
        </footer>
      </div>
    </section>
  );
}
