import React, { useState } from 'react';
import { PROFILE_DATA, ROM_CARTRIDGES, SQL_PRESETS } from '../data/portfolioData';
import { playKeyclick, playRelicGlitch, playVangelisChord } from '../utils/soundEngine';

const OS_APPS = [
  { id: 'explorer', num: '01', code: 'ROM_EXPLORER', label: 'Cartuchos ROM' },
  { id: 'sqlbench', num: '02', code: 'SQL_BENCH', label: 'SQL Bench' },
  { id: 'esper', num: '03', code: 'ESPER_2019', label: 'Esper 2019' },
  { id: 'synth', num: '04', code: 'CS80_SYNTH', label: 'Deck CS-80' },
  { id: 'flatline', num: '05', code: 'CONSTRUCT_CLI', label: 'Constructo CLI' },
  { id: 'biometry', num: '06', code: 'DOSSIE_VK84', label: 'Ficha VK-84' },
];

const SYNTH_PADS = [
  {
    id: 'tears',
    label: 'Tears in Rain (Lá Menor)',
    notes: [220.0, 261.63, 329.63, 392.0],
    freqLabel: '220Hz · CS-80 Brass',
    waveAmp: 11,
  },
  {
    id: 'chiba',
    label: 'Chiba City Blues (Ré Dórico)',
    notes: [146.83, 220.0, 261.63, 329.63],
    freqLabel: '146.8Hz · Hosaka Sub',
    waveAmp: 15,
  },
  {
    id: 'straylight',
    label: 'Villa Straylight (Fá# 7M)',
    notes: [185.0, 277.18, 329.63, 440.0],
    freqLabel: '185Hz · Orbital Pad',
    waveAmp: 9,
  },
  {
    id: 'tyrell',
    label: 'Tyrell Pyramid (Mi Suspenso)',
    notes: [164.81, 246.94, 293.66, 369.99],
    freqLabel: '164.8Hz · Rachel Owl',
    waveAmp: 13,
  },
];

function executeMiniSql(sqlText, baseRows) {
  let rows = [...baseRows];
  const upper = sqlText.toUpperCase();
  let usedFilter = false;
  let usedSort = false;

  // Safe lightweight WHERE matching: LIKE '%term%' or = 'value'
  const likeMatch = sqlText.match(/WHERE\s+[\w.]+\s+LIKE\s+'%([^']+)%'/i);
  const eqMatch = sqlText.match(/WHERE\s+([\w.]+)\s*=\s*'([^']+)'/i);

  if (likeMatch) {
    const needle = likeMatch[1].toLowerCase();
    rows = rows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(needle))
    );
    usedFilter = true;
  } else if (eqMatch) {
    const colRaw = eqMatch[1].split('.').pop().toLowerCase();
    const val = eqMatch[2].toLowerCase();
    const matched = rows.filter((r) => {
      const key = Object.keys(r).find((k) => k.toLowerCase() === colRaw);
      if (!key) return true;
      return String(r[key]).toLowerCase() === val;
    });
    rows = matched;
    usedFilter = true;
  }

  // ORDER BY col ASC/DESC
  const orderMatch = sqlText.match(/ORDER\s+BY\s+([\w.]+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch && rows.length > 1) {
    const colRaw = orderMatch[1].split('.').pop().toLowerCase();
    const dir = (orderMatch[2] || 'ASC').toUpperCase();
    const key = Object.keys(rows[0]).find((k) => k.toLowerCase() === colRaw);
    if (key) {
      rows.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), 'pt-BR');
        return dir === 'DESC' ? -cmp : cmp;
      });
      usedSort = true;
    }
  }

  // TOP N support
  const topMatch = upper.match(/SELECT\s+TOP\s+(\d+)/);
  if (topMatch) {
    const n = Number.parseInt(topMatch[1], 10);
    if (n > 0) rows = rows.slice(0, n);
  }

  const planNodes = [
    { op: 'INDEX SEEK', cost: usedSort ? '54%' : '68%', sub: 'B-Tree Clustered' },
    { op: usedFilter ? 'FILTER PRED' : 'COMPUTE', cost: usedFilter ? '18%' : '14%', sub: usedFilter ? 'WHERE Match' : 'Projection' },
    { op: usedSort ? 'SORT STREAM' : 'STREAM AGG', cost: usedSort ? '20%' : '10%', sub: usedSort ? 'ORDER BY' : 'Zero Spill' },
    { op: 'SELECT OUT', cost: '8%', sub: `${rows.length} rows` },
  ];

  return { rows, planNodes };
}

export default function HosakaDesktopOS({
  soundOn,
  ambientOn,
  onToggleAmbient,
  unlockSeal,
  notify,
  unlockedSeals,
  chassisStage,
  onRelicPing,
  onReturnToSpace,
}) {
  const [activeApp, setActiveApp] = useState('explorer');
  const [splitSql, setSplitSql] = useState(false);

  // Explorer state
  const [selectedRomId, setSelectedRomId] = useState(ROM_CARTRIDGES[0].id);

  // SQL Bench state
  const [selectedSqlId, setSelectedSqlId] = useState(SQL_PRESETS[0].id);
  const [customSql, setCustomSql] = useState(SQL_PRESETS[0].sql);
  const [sqlResultRows, setSqlResultRows] = useState(SQL_PRESETS[0].rows);
  const [sqlPlan, setSqlPlan] = useState(() => executeMiniSql(SQL_PRESETS[0].sql, SQL_PRESETS[0].rows).planNodes);
  const [sqlExecStatus, setSqlExecStatus] = useState('PRONTO · 3 REGISTROS RETORNADOS (1.4ms)');

  // Esper 2019 PhotoLab state
  const [esperZoom, setEsperZoom] = useState(1);
  const [esperFilter, setEsperFilter] = useState('normal');
  const [esperSector, setEsperSector] = useState('SETOR 44-B · RETINA VALIDADA');

  // CS-80 Synth state
  const [lastPad, setLastPad] = useState(SYNTH_PADS[0]);

  // Constructo CLI state (Johnny-84 + Dixie Flatline)
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    'ONO-SENDAI BIOS v2.84 // CONSTRUCTOS CARREGADOS: [DIXIE-ROM] & [JOHNNY-84]',
    'Digite "help", "johnny", "zetti", "stack", "projetos", "ff:06:b5" ou "contato".',
  ]);

  const handleSelectApp = (appId) => {
    playKeyclick(soundOn, 760);
    setActiveApp(appId);
  };

  const runSqlPreset = (preset) => {
    playKeyclick(soundOn, 840);
    setSelectedSqlId(preset.id);
    setCustomSql(preset.sql);
    const { rows, planNodes } = executeMiniSql(preset.sql, preset.rows);
    setSqlResultRows(rows);
    setSqlPlan(planNodes);
    const execMs = (0.75 + rows.length * 0.24).toFixed(2);
    setSqlExecStatus(`EXECUÇÃO OK · ${rows.length} REGISTROS (${execMs}ms)`);
    unlockSeal('seal_sql_bench');
    notify('Consulta SQL executada no cluster Hosaka.');
    onRelicPing?.('Johnny-84: Query disparada direto no SQL Bench sem engasgar uma tabela.');
  };

  const handleExecuteCustomSql = () => {
    playKeyclick(soundOn, 920);
    unlockSeal('seal_sql_bench');
    const currentPreset = SQL_PRESETS.find((p) => p.id === selectedSqlId) || SQL_PRESETS[0];
    const { rows, planNodes } = executeMiniSql(customSql, currentPreset.rows);
    setSqlResultRows(rows);
    setSqlPlan(planNodes);
    setSqlExecStatus(`PLANO DE EXECUÇÃO: INDEX SEEK · ${rows.length} LINHA(S) RETORNADA(S)`);
    notify('Plano de execução SQL validado (Index Seek).');
    onRelicPing?.('Dixie Flatline: Plano Index Seek limpo — nada de Table Scan aqui, cowboy.');
  };

  const handleEsperCommand = (zoomVal, filterVal, sectorLabel) => {
    playKeyclick(soundOn, 790);
    setEsperZoom(zoomVal);
    setEsperFilter(filterVal);
    setEsperSector(sectorLabel);
    unlockSeal('seal_esper');
    onRelicPing?.(`Rachel-7: Espectro Esper ajustado para "${sectorLabel}".`);
  };

  const handleTriggerSynth = (pad) => {
    setLastPad(pad);
    playVangelisChord(soundOn || true, pad.notes);
    unlockSeal('seal_synth');
    notify(`Sintetizador CS-80: ${pad.label}`);
    onRelicPing?.(`Rachel-7: Acorde analógico "${pad.label}" ressoando no estúdio.`);
  };

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const raw = cliInput.trim();
    if (!raw) return;
    playRelicGlitch(soundOn);
    const cmd = raw.toLowerCase();
    let reply = '';

    if (cmd === 'help') {
      reply = 'COMANDOS: johnny | zetti | stack | projetos | breach | ff:06:b5 | mikoshi | afterlife | wake up | unifan | contato | clear';
    } else if (cmd === 'johnny' || cmd === 'samurai') {
      reply = 'JOHNNY-84: "Corta o excesso, choom. A Zetti usa SQL Server e VB6 de verdade; o resto é só vitrine."';
    } else if (cmd === 'wake up' || cmd === 'wakeup') {
      reply = 'RELIC OVERRIDE // "Wake the f*** up, Samurai — we have a database to index."';
    } else if (cmd === 'never fade away' || cmd === 'neverfadeaway') {
      reply = 'SAMURAI 2023 // "A thing of beauty, I know — will never fade away." Código limpo também não.';
    } else if (cmd === 'afterlife') {
      reply = 'ROGUE AMENDIARES // "Drink Miqueias Carvalho: dose dupla de SQL Server & C#/.NET, dash de Java 17 e gelo quebrado em NestJS."';
    } else if (cmd === 'breach') {
      reply = 'BREACH PROTOCOL // Volte ao Ciberespaço (Seção 03) para invadir a matriz 5×5 e enviar DATAMINE_V1, ICEPICK e MASS_VULNERABILITY.';
    } else if (cmd === 'ff:06:b5' || cmd === 'ff06b5') {
      reply = 'RELIC // FF:06:B5: Enigmas são ótimos, mas índice B-Tree bem calibrado economiza horas de plantão.';
    } else if (cmd === 'mikoshi' || cmd === 'arasaka') {
      reply = 'MIKOSHI INTERCEPT: Ao contrário da torre Arasaka, todos os projetos deste engenheiro são abertos no GitHub.';
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
      reply = `Dixie Flatline: Sinal "${raw}" processado. Tente "johnny", "zetti", "stack", "breach", "wake up" ou "ff:06:b5".`;
    }

    setCliHistory((prev) => [...prev.slice(-10), `cowboy@ono-sendai:~$ ${raw}`, reply]);
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

  const renderRomPane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">01 / ROM EXPLORER</span>
          <h3>{selectedRom.title}</h3>
        </div>
        <a
          href={selectedRom.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="deck-cta"
        >
          {selectedRom.linkLabel} ↗
        </a>
      </div>

      <div className="os-rom-split">
        <div className="rom-index-rail" role="listbox" aria-label="Cartuchos ROM na estação">
          {ROM_CARTRIDGES.map((rom) => {
            const isSelected = rom.id === selectedRomId;
            return (
              <button
                key={rom.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`rom-index-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  playKeyclick(soundOn, 740);
                  setSelectedRomId(rom.id);
                  unlockSeal('seal_rom');
                }}
              >
                <div className="rom-index-meta">
                  <span>{rom.slot.split(' · ')[0]}</span>
                  <span>{isSelected ? 'Ativo ●' : 'Abrir →'}</span>
                </div>
                <div className="rom-index-title">{rom.title.split(' (')[0]}</div>
                <div className="rom-index-sub">{rom.period}</div>
              </button>
            );
          })}
        </div>

        <div className="os-rom-stream">
          <div className="os-rom-slot-meta">
            <span>{selectedRom.slot}</span>
            <span className="meta-sep">·</span>
            <span>{selectedRom.period}</span>
          </div>
          <p className="os-rom-summary">{selectedRom.headline}</p>
          <div className="cyberspace-code-deck">
            <div className="code-deck-bar">
              <span>FONTE EXECUTÁVEL // {selectedRom.id}</span>
              <button
                type="button"
                className="cmd-link"
                onClick={() => {
                  setActiveApp('sqlbench');
                  setSplitSql(false);
                  playKeyclick(soundOn, 810);
                }}
              >
                Abrir SQL Bench →
              </button>
            </div>
            <pre className="rom-code-pre" translate="no">
              {selectedRom.codeSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSqlPane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">02 / ZETTI SQL SERVER BENCH</span>
          <h3>Consultas &amp; Planos de Execução</h3>
        </div>
        <button type="button" className="deck-cta" onClick={handleExecuteCustomSql}>
          ▶ Executar T-SQL (F5)
        </button>
      </div>

      <div className="os-subtabs" role="tablist" aria-label="Consultas SQL prontas">
        {SQL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="tab"
            aria-selected={selectedSqlId === preset.id}
            className={`os-subtab-btn ${selectedSqlId === preset.id ? 'active' : ''}`}
            onClick={() => runSqlPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <textarea
        aria-label="Editor de consulta T-SQL"
        className="os-code-textarea"
        value={customSql}
        onChange={(e) => setCustomSql(e.target.value)}
        rows={4}
        spellCheck={false}
      />

      <div className="os-status-readout t-nums">STATUS: {sqlExecStatus}</div>

      {/* Borderless SVG SQL Server Execution Plan */}
      <div className="os-sql-plan-strip" aria-label="Plano de execução SQL Server">
        <span className="rom-lab-kicker">PLANO DE EXECUÇÃO ESTIMADO // SSMS COST GRAPH</span>
        <svg viewBox="0 0 580 84" className="rom-pipeline-svg" role="img" aria-label="Árvore de custo do plano de execução T-SQL">
          <line x1="64" y1="30" x2="514" y2="30" stroke="var(--phosphor-secondary)" strokeWidth="1.4" strokeDasharray="3 4" />
          {sqlPlan.map((node, idx) => {
            const x = 64 + idx * 150;
            return (
              <g key={`${node.op}-${idx}`}>
                <circle cx={x} cy="30" r="16" fill="var(--bg)" stroke="var(--phosphor-primary)" strokeWidth="1.6" />
                <text x={x} y="34" textAnchor="middle" fill="var(--phosphor-primary)" fontSize="9.5" fontFamily="var(--font-mono)">
                  {node.cost}
                </text>
                <text x={x} y="62" textAnchor="middle" fill="var(--ink-primary)" fontSize="9.5" fontFamily="var(--font-mono)">
                  {node.op}
                </text>
                <text x={x} y="76" textAnchor="middle" fill="var(--ink-muted)" fontSize="8.8" fontFamily="var(--font-mono)">
                  {node.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="os-table-scroll">
        <table className="os-ledger-table">
          <thead>
            <tr>
              {sqlResultRows.length > 0 &&
                Object.keys(sqlResultRows[0]).map((col) => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {sqlResultRows.length > 0 ? (
              sqlResultRows.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="t-nums">
                      {val}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="t-nums">0 linhas retornadas para o filtro WHERE informado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEsperPane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">03 / BLADE RUNNER ESPER PHOTOLAB</span>
          <h3>Análise Óptica de Retrato (Enhance 224 → 176)</h3>
        </div>
      </div>

      <div className="os-esper-grid">
        <div className="os-esper-lens-stage">
          <div className="os-esper-aperture">
            <img
              src={PROFILE_DATA.portrait}
              alt="Miqueias Carvalho analisado no Esper PhotoLab"
              width="272"
              height="363"
              style={getEsperFilterStyle()}
            />
          </div>
        </div>

        <div className="os-esper-controls">
          <div className="os-status-readout t-nums">
            TELEMETRIA ESPER: {esperSector} · ZOOM: {esperZoom}x
          </div>
          <p className="os-rom-summary">
            Comandos de ampliação e espectro óptico inspirados na unidade Esper de Rick Deckard aplicadas em tempo real sobre <code>portrait-2.webp</code>.
          </p>

          <div className="os-command-stack">
            <button
              type="button"
              className={`relic-choice-line ${esperFilter === 'normal' ? 'is-selected' : ''}`}
              style={{ '--choice-accent': 'var(--phosphor-primary)' }}
              onClick={() => handleEsperCommand(1, 'normal', 'QUADRO ORIGINAL 1.0x')}
            >
              <span className="choice-arrow">▸</span>
              <span className="choice-tag">[1.0x NORMAL]</span>
              <span className="choice-text">Restaurar enquadramento biométrico padrão</span>
            </button>
            <button
              type="button"
              className={`relic-choice-line ${esperFilter === 'amber' ? 'is-selected' : ''}`}
              style={{ '--choice-accent': 'var(--phosphor-primary)' }}
              onClick={() => handleEsperCommand(1.22, 'amber', 'ENHANCE 224 TO 176 · FÓSFORO ÂMBAR')}
            >
              <span className="choice-arrow">▸</span>
              <span className="choice-tag">[1.22x ENHANCE]</span>
              <span className="choice-text">Ampliar vetor 224→176 em fósforo âmbar P3</span>
            </button>
            <button
              type="button"
              className={`relic-choice-line ${esperFilter === 'xray' ? 'is-selected' : ''}`}
              style={{ '--choice-accent': 'var(--phosphor-secondary)' }}
              onClick={() => handleEsperCommand(1.38, 'xray', 'TRACK 45 RIGHT · ESPECTRO MATRIZ')}
            >
              <span className="choice-arrow">▸</span>
              <span className="choice-tag">[1.38x MATRIZ]</span>
              <span className="choice-text">Track 45 Right em inversão ciberespaço</span>
            </button>
            <button
              type="button"
              className={`relic-choice-line ${esperFilter === 'highcontrast' ? 'is-selected' : ''}`}
              style={{ '--choice-accent': 'var(--phosphor-green)' }}
              onClick={() => handleEsperCommand(1.15, 'highcontrast', 'HARD COPY PRINT · MONOCROMO')}
            >
              <span className="choice-arrow">▸</span>
              <span className="choice-tag">[1.15x HARD COPY]</span>
              <span className="choice-text">Imprimir contraste fotográfico monocromático</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSynthPane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">04 / YAMAHA CS-80 WEBAUDIO SYNTH</span>
          <h3>Sintetizador Analógico de Fósforo</h3>
        </div>
        <div className="code-deck-actions">
          {onToggleAmbient && (
            <button
              type="button"
              className="deck-cta"
              aria-pressed={ambientOn}
              onClick={onToggleAmbient}
            >
              {ambientOn ? '■ Parar Drone Noturno CS-80' : '▶ Ligar Drone Noturno CS-80'}
            </button>
          )}
          <span className="os-status-readout t-nums">
            FREQUÊNCIA ATIVA: {lastPad.freqLabel}
          </span>
        </div>
      </div>

      <p className="os-rom-summary">
        Acordes dente-de-serra e drone contínuo filtrados em tempo real via WebAudio API sem arquivos MP3 externos, modelados nos filtros passa-baixa de Los Angeles 2019.
      </p>

      <svg viewBox="0 0 640 44" style={{ width: '100%', maxWidth: '640px', height: '44px' }} aria-hidden="true">
        <path
          d={Array.from({ length: 49 }, (_, i) => {
            const x = (i / 48) * 640;
            const y = 22 + Math.sin(i * 0.45) * lastPad.waveAmp * Math.cos(i * 0.08);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="var(--phosphor-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      <div className="contact-ledger">
        {SYNTH_PADS.map((pad, idx) => {
          const isCurrent = lastPad.id === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              className={`contact-row ${isCurrent ? 'highlight-row' : ''}`}
              onClick={() => handleTriggerSynth(pad)}
            >
              <span className="contact-port-code">OSC-0{idx + 1} // CS-80</span>
              <strong className="contact-title">♪ {pad.label}</strong>
              <span className="contact-endpoint t-nums">{pad.freqLabel}</span>
              <span className="contact-action">{isCurrent ? 'Tocando ●' : 'Disparar acorde →'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFlatlinePane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">05 / ONO-SENDAI ROM SHELL</span>
          <h3>Constructo CLI: Dixie Flatline &amp; Johnny-84</h3>
        </div>
        <button
          type="button"
          className="cmd-link"
          onClick={() => setCliHistory(['Terminal limpo. Digite "help" para comandos.'])}
        >
          Limpar buffer ↺
        </button>
      </div>

      <div className="os-cli-stream" aria-live="polite">
        {cliHistory.map((line, i) => (
          <div key={i} className={line.startsWith('cowboy@') ? 'cli-user-line' : 'cli-bot-line'}>
            {line}
          </div>
        ))}
      </div>

      <form onSubmit={handleCliSubmit} className="relic-prompt-form" style={{ marginTop: '16px' }}>
        <label htmlFor="os-cli-input" className="relic-prompt-prefix">
          cowboy@ono-sendai:~$
        </label>
        <input
          id="os-cli-input"
          type="text"
          className="relic-prompt-input"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          placeholder="Digite johnny, zetti, stack, projetos, ff:06:b5 ou contato..."
          spellCheck={false}
        />
        <button type="submit" className="relic-send-link">
          Executar ↵
        </button>
      </form>
    </div>
  );

  const renderBiometryPane = () => (
    <div className="os-pane-section">
      <div className="os-pane-header">
        <div>
          <span className="section-kicker">06 / DOSSIÊ BIOMÉTRICO TYRELL</span>
          <h3>Especificações do Engenheiro</h3>
        </div>
        <a
          href={PROFILE_DATA.cvPdf}
          download="Curriculo_Miqueias_Carvalho.pdf"
          className="deck-cta"
          onClick={() => unlockSeal('seal_dossier')}
        >
          Baixar Currículo PDF ⬇
        </a>
      </div>

      <div className="contact-ledger">
        <div className="contact-row">
          <span className="contact-port-code">IDENTIDADE // BIO</span>
          <strong className="contact-title">Engenheiro Responsável</strong>
          <span className="contact-endpoint">{PROFILE_DATA.fullName}</span>
          <span className="contact-action">Verificado</span>
        </div>
        <div className="contact-row">
          <span className="contact-port-code">PRODUÇÃO // ZETTI</span>
          <strong className="contact-title">Atuação Atual</strong>
          <span className="contact-endpoint">{PROFILE_DATA.currentJob}</span>
          <span className="contact-action">Ativo</span>
        </div>
        <div className="contact-row">
          <span className="contact-port-code">GRADUAÇÃO // UNIFAN</span>
          <strong className="contact-title">Formação Acadêmica</strong>
          <span className="contact-endpoint">{PROFILE_DATA.education}</span>
          <span className="contact-action">Em curso</span>
        </div>
        <div className="contact-row">
          <span className="contact-port-code">CHASSI // SELOS VK</span>
          <strong className="contact-title">Liga &amp; Empatia Atual</strong>
          <span className="contact-endpoint t-nums">
            {chassisStage.toUpperCase()} · {unlockedSeals.length}/12 Selos
          </span>
          <span className="contact-action">Em operação</span>
        </div>
      </div>
    </div>
  );

  const currentAppMeta = OS_APPS.find((a) => a.id === activeApp) || OS_APPS[0];

  return (
    <section className="os-workstation-stage wrap" aria-label="Estação de Trabalho Hosaka H-84">
      {/* Borderless Top Kernel Rail */}
      <div className="os-top-rail">
        <div className="os-app-dock" role="group" aria-label="Módulos da Workstation OS">
          {OS_APPS.map((app) => {
            const isCurrent = activeApp === app.id;
            return (
              <button
                key={app.id}
                type="button"
                aria-pressed={isCurrent}
                className={`os-dock-tab ${isCurrent ? 'active' : ''}`}
                onClick={() => handleSelectApp(app.id)}
              >
                <span className="os-tab-num">{app.num}</span>
                <span>{app.label}</span>
              </button>
            );
          })}
        </div>

        <div className="os-rail-actions">
          <button
            type="button"
            className="cmd-link"
            onClick={() => {
              playKeyclick(soundOn, 700);
              setSplitSql((s) => !s);
            }}
          >
            {splitSql ? 'Layout: Único [ ]' : 'Split SQL [||]'}
          </button>
          {onReturnToSpace && (
            <button
              type="button"
              className="cmd-link accent"
              onClick={onReturnToSpace}
            >
              Falar com Johnny-84 →
            </button>
          )}
        </div>
      </div>

      {/* Main Borderless Spatial Canvas (Zero Enclosing CRT Box Frame) */}
      <div className={`os-workstation-canvas ${splitSql ? 'is-split' : ''}`}>
        <div className="os-primary-pane">
          {activeApp === 'explorer' && renderRomPane()}
          {activeApp === 'sqlbench' && renderSqlPane()}
          {activeApp === 'esper' && renderEsperPane()}
          {activeApp === 'synth' && renderSynthPane()}
          {activeApp === 'flatline' && renderFlatlinePane()}
          {activeApp === 'biometry' && renderBiometryPane()}
        </div>

        {splitSql && (
          <div className="os-secondary-split-pane">
            {activeApp === 'sqlbench' ? renderRomPane() : renderSqlPane()}
          </div>
        )}
      </div>

      {/* Minimal Bottom Hairline Telemetry Bar */}
      <div className="os-bottom-status">
        <span>
          HOSAKA KERNEL // MÓDULO {currentAppMeta.num} [{currentAppMeta.code}]
        </span>
        <span className="t-nums">
          MEMÓRIA: 640K OK · SELOS VOIGHT-KAMPFF: {unlockedSeals.length}/12
        </span>
      </div>
    </section>
  );
}
