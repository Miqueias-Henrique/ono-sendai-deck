import React, { useState, useEffect, useMemo } from 'react';
import {
  buildTrees,
  layoutBinaryTree,
  validateCnpjAlfa,
  analyzeCpfHash,
} from '../utils/avlEngine';
import {
  playKeyclick,
  playRotationChime,
  playConflictBuzz,
} from '../utils/soundEngine';

const STANDARD_PIPELINES = {
  'api-gestao-produtos': {
    title: 'FLUXO REST CONTAINERIZADO // NODE + TYPEORM + MYSQL 8',
    happyLabel: 'GET /products?page=1 (200 OK)',
    guardLabel: 'POST inválido (400 Guard)',
    nodes: [
      { code: 'CLIENT', label: 'Swagger / HTTP', sub: 'REST JSON' },
      { code: 'CTRL', label: 'Express Router', sub: 'Payload Guard' },
      { code: 'ORM', label: 'TypeORM Repo', sub: 'findAndCount()' },
      { code: 'DB', label: 'MySQL 8 Docker', sub: 'Healthcheck OK' },
    ],
    happyLog: '[200 OK · 9.4ms] findAndCount(take: 20) via índice ativo → 20 itens + total em 1 round-trip.',
    guardLog: '[400 BAD REQUEST · 1.2ms] Payload barrado antes de abrir transação no MySQL 8.',
  },
  'vital-conscious-api': {
    title: 'PIPELINE SPRING BOOT 3 // JAVA 17 + JPA + POSTGRESQL',
    happyLabel: 'POST /api/v1/vitals (201 Created)',
    guardLabel: '@Valid DTO falhou (400)',
    nodes: [
      { code: 'HTTP', label: 'JSON Request', sub: 'CreateVitalDTO' },
      { code: 'REST', label: 'Controller @Valid', sub: 'Bean Validation' },
      { code: 'JPA', label: 'Spring Data JPA', sub: 'Hibernate Tx' },
      { code: 'PG', label: 'PostgreSQL', sub: 'Commit 201' },
    ],
    happyLog: '[201 CREATED · 11.8ms] @Valid aprovado → VitalService.save() persistido com ResponseEntity.',
    guardLog: '[400 BAD REQUEST · 0.9ms] Bean Validation rejeitou DTO imutável via ControllerAdvice global.',
  },
  'controle-estoque-javafx': {
    title: 'ARQUITETURA DESKTOP MVC // JAVAFX + JDBC PURO (DAO)',
    happyLabel: 'UPDATE Estoque (PreparedStatement)',
    guardLabel: 'Tentativa SQL Injection (Bloqueada)',
    nodes: [
      { code: 'FXML', label: 'JavaFX TableView', sub: 'UI Event' },
      { code: 'MVC', label: 'EstoqueController', sub: 'Regra Local' },
      { code: 'DAO', label: 'ProdutoDAO JDBC', sub: 'PreparedStmt ?' },
      { code: 'PG', label: 'PostgreSQL Pool', sub: 'try-with-res' },
    ],
    happyLog: '[JDBC OK · 14.0ms] PreparedStatement parametrizado executou UPDATE e fechou conexão com segurança.',
    guardLog: '[SAFE · 2.1ms] Parâmetro escapado pelo PreparedStatement ("1 OR 1=1" tratado como literal, zero SQLi).',
  },
};

function ZettiSqlLab({ soundOn, unlockSeal, onRelicPing }) {
  const [cnpjInput, setCnpjInput] = useState('12ABC34501DE35');
  const [scanMode, setScanMode] = useState('seek'); // 'seek' | 'scan'
  const [step, setStep] = useState(4);
  const [runId, setRunId] = useState(0);

  const check = useMemo(() => validateCnpjAlfa(cnpjInput), [cnpjInput]);

  useEffect(() => {
    if (runId === 0) return undefined;
    const stepDelay = scanMode === 'seek' ? 140 : 420;
    const maxStep = check.valid ? 4 : 2;
    let current = 1;
    const timer = setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= maxStep) {
        clearInterval(timer);
      }
    }, stepDelay);
    return () => clearInterval(timer);
  }, [runId, scanMode, check.valid]);

  const triggerRun = (nextCnpj = cnpjInput, nextMode = scanMode) => {
    const res = validateCnpjAlfa(nextCnpj);
    setCnpjInput(nextCnpj);
    setScanMode(nextMode);
    setStep(1);
    setRunId((r) => r + 1);
    unlockSeal?.('seal_runner');
    if (res.valid) {
      playRotationChime(soundOn);
      if (nextMode === 'scan') {
        onRelicPing?.('Dixie Flatline: Table Scan em 148ms?! Ativa o Index Seek B-Tree pra cair pra 0.0032s, cowboy.');
      } else {
        onRelicPing?.(`Johnny-84: CNPJ ${res.clean} validado no padrão NT-2026 e salvo via Index Seek em 0.0032s.`);
      }
    } else {
      playConflictBuzz(soundOn);
      onRelicPing?.(`Johnny-84: THROW 50001 segurou o CNPJ "${nextCnpj}" na porta — dado sujo não entra no SQL Server.`);
    }
  };

  const stages = [
    { x: 64, code: 'VB6', name: 'Módulo Fiscal', sub: 'Entrada 14 pos.' },
    { x: 214, code: 'NT26', name: 'Validador Mód-11', sub: check.valid ? `DV ${check.expectedDv} OK` : 'THROW 50001' },
    {
      x: 364,
      code: scanMode === 'seek' ? 'SEEK' : 'SCAN',
      name: scanMode === 'seek' ? 'Index Seek B-Tree' : 'Table Scan Full',
      sub: scanMode === 'seek' ? '0.0032s · 4 páginas' : '148.4ms · 18.400 pág.',
    },
    { x: 514, code: 'SYNC', name: '148 Filiais', sub: 'READ COMMITTED' },
  ];

  const failedGate = !check.valid && step >= 2;
  const activeColor = failedGate
    ? 'var(--phosphor-alert)'
    : scanMode === 'scan'
    ? 'var(--phosphor-alert)'
    : 'var(--phosphor-secondary)';

  return (
    <div className="rom-lab-stage">
      <div className="rom-lab-head">
        <span className="rom-lab-kicker">Simulador ao vivo: Validador CNPJ Alfanumérico (NT 2026) &amp; Plano SQL Server</span>
        <div className="rom-lab-mode-row" role="group" aria-label="Plano de execução SQL">
          <button
            type="button"
            className={`lab-tab-btn ${scanMode === 'seek' ? 'active' : ''}`}
            onClick={() => triggerRun(cnpjInput, 'seek')}
          >
            Index Seek (0.0032s)
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${scanMode === 'scan' ? 'active is-warn' : ''}`}
            onClick={() => triggerRun(cnpjInput, 'scan')}
          >
            Table Scan (148.4ms)
          </button>
        </div>
      </div>

      <svg viewBox="0 0 580 112" className="rom-pipeline-svg" role="img" aria-label="Pipeline de execução T-SQL Zetti">
        <line x1="64" y1="42" x2="514" y2="42" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="3 5" />
        <line
          x1="64"
          y1="42"
          x2={stages[Math.min(stages.length - 1, Math.max(0, step - 1))].x}
          y2="42"
          stroke={activeColor}
          strokeWidth="2.2"
          className="pipeline-active-beam"
        />

        {stages.map((st, idx) => {
          const stageNum = idx + 1;
          const reached = step >= stageNum && !(failedGate && stageNum > 2);
          const isError = failedGate && stageNum === 2;
          const strokeCol = isError
            ? 'var(--phosphor-alert)'
            : reached
            ? activeColor
            : 'var(--hairline-strong)';
          return (
            <g key={st.code}>
              <circle
                cx={st.x}
                cy="42"
                r={reached ? 20 : 17}
                fill="var(--bg)"
                stroke={strokeCol}
                strokeWidth={reached ? 2 : 1.2}
                className="pipeline-node-circle"
              />
              {reached && (
                <circle
                  cx={st.x}
                  cy="42"
                  r="26"
                  fill="none"
                  stroke={strokeCol}
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                />
              )}
              <text
                x={st.x}
                y="46"
                textAnchor="middle"
                fill={reached ? strokeCol : 'var(--ink-muted)'}
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight="500"
              >
                {st.code}
              </text>
              <text
                x={st.x}
                y="82"
                textAnchor="middle"
                fill={reached ? 'var(--ink-primary)' : 'var(--ink-muted)'}
                fontSize="10.5"
                fontFamily="var(--font-sans)"
              >
                {st.name}
              </text>
              <text
                x={st.x}
                y="98"
                textAnchor="middle"
                fill={isError ? 'var(--phosphor-alert)' : 'var(--ink-muted)'}
                fontSize="9.5"
                fontFamily="var(--font-mono)"
              >
                {st.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="rom-lab-controls">
        <div className="lab-input-line">
          <label htmlFor="zetti-cnpj-input" className="lab-input-prefix">
            @CnpjAlfa =
          </label>
          <input
            id="zetti-cnpj-input"
            type="text"
            maxLength={18}
            className="lab-mono-input t-nums"
            value={cnpjInput}
            onChange={(e) => setCnpjInput(e.target.value.toUpperCase())}
            placeholder="12ABC34501DE35"
            spellCheck={false}
          />
          <button type="button" className="cmd-link accent" onClick={() => triggerRun(cnpjInput, scanMode)}>
            ▶ Validar &amp; Executar
          </button>
          {!check.valid && check.fixedCnpj && (
            <button
              type="button"
              className="cmd-link"
              onClick={() => triggerRun(check.fixedCnpj, scanMode)}
            >
              Corrigir DV ({check.expectedDv})
            </button>
          )}
        </div>

        <div className="lab-presets-row">
          <span>Casos reais:</span>
          <button type="button" className="relic-topic-link" onClick={() => triggerRun('12ABC34501DE35', scanMode)}>
            12ABC34501DE35 (NT-2026 OK)
          </button>
          <button type="button" className="relic-topic-link" onClick={() => triggerRun('11222333000181', scanMode)}>
            11222333000181 (Legado OK)
          </button>
          <button type="button" className="relic-topic-link" onClick={() => triggerRun('98Z71K22000100', scanMode)}>
            98Z71K22000100 (DV Inválido)
          </button>
        </div>

        <div className={`lab-telemetry-out t-nums ${check.valid ? 'is-ok' : 'is-err'}`}>
          {check.valid ? '✔ ' : '✕ '}
          {check.reason}
          {check.valid && (
            <span>
              {' '}
              · Ganho Index Seek vs Table Scan: <strong>46× menor latência</strong>.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CinemaConcurrencyLab({ soundOn, unlockSeal, onRelicPing }) {
  const [useTx, setUseTx] = useState(true);
  const [phase, setPhase] = useState('done'); // 'racing' | 'done'
  const [raceTick, setRaceTick] = useState(0);

  useEffect(() => {
    if (raceTick === 0) return undefined;
    const t = setTimeout(() => {
      setPhase('done');
    }, 620);
    return () => clearTimeout(t);
  }, [raceTick]);

  const fireRace = (nextUseTx = useTx) => {
    setUseTx(nextUseTx);
    setPhase('racing');
    setRaceTick((c) => c + 1);
    unlockSeal?.('seal_runner');
    if (nextUseTx) {
      playRotationChime(soundOn);
      onRelicPing?.('Johnny-84: Prisma $transaction segurou a corrida no Assento D-07 — Cliente A levou 201, Cliente B tomou 409 Conflict.');
    } else {
      playConflictBuzz(soundOn);
      onRelicPing?.('Dixie Flatline: Sem $transaction deu venda dupla no mesmo assento! É por isso que ACID existe, cowboy.');
    }
  };

  const clientBColor = useTx ? 'var(--phosphor-alert)' : 'var(--phosphor-primary)';

  return (
    <div className="rom-lab-stage">
      <div className="rom-lab-head">
        <span className="rom-lab-kicker">Simulador ao vivo: Concorrência no Assento D-07 (Prisma $transaction)</span>
        <div className="rom-lab-mode-row" role="group" aria-label="Isolamento transacional">
          <button
            type="button"
            className={`lab-tab-btn ${useTx ? 'active' : ''}`}
            onClick={() => fireRace(true)}
          >
            Com $transaction (ACID)
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${!useTx ? 'active is-warn' : ''}`}
            onClick={() => fireRace(false)}
          >
            Sem Lock (Race Bug)
          </button>
        </div>
      </div>

      <svg viewBox="0 0 580 144" className="rom-pipeline-svg" role="img" aria-label="Simulador de reserva concorrente de assento">
        {/* Dual client cubic rails converging into Transaction Gate */}
        <path
          d="M 68 34 C 155 34, 185 72, 268 72 L 502 72"
          fill="none"
          stroke="var(--phosphor-green)"
          strokeWidth="2"
          strokeDasharray={phase === 'racing' ? '6 6' : 'none'}
        />
        <path
          d={useTx ? 'M 68 110 C 155 110, 185 72, 268 72' : 'M 68 110 C 155 110, 185 72, 268 72 L 502 72'}
          fill="none"
          stroke={clientBColor}
          strokeWidth="1.8"
          strokeDasharray={useTx ? '4 5' : 'none'}
        />

        {/* Client A */}
        <circle cx="68" cy="34" r="16" fill="var(--bg)" stroke="var(--phosphor-green)" strokeWidth="1.8" />
        <text x="68" y="38" textAnchor="middle" fill="var(--phosphor-green)" fontSize="9.5" fontFamily="var(--font-mono)">CLI-A</text>
        <text x="128" y="24" textAnchor="middle" fill="var(--ink-sub)" fontSize="9.5" fontFamily="var(--font-mono)">t=0ms · D-07</text>

        {/* Client B */}
        <circle cx="68" cy="110" r="16" fill="var(--bg)" stroke={clientBColor} strokeWidth="1.8" />
        <text x="68" y="114" textAnchor="middle" fill={clientBColor} fontSize="9.5" fontFamily="var(--font-mono)">CLI-B</text>
        <text x="128" y="130" textAnchor="middle" fill="var(--ink-sub)" fontSize="9.5" fontFamily="var(--font-mono)">t=2ms · D-07</text>

        {/* Prisma Transaction Gate */}
        <circle
          cx="286"
          cy="72"
          r="24"
          fill="var(--bg)"
          stroke={useTx ? 'var(--phosphor-secondary)' : 'var(--phosphor-alert)'}
          strokeWidth="2"
        />
        <text
          x="286"
          y="69"
          textAnchor="middle"
          fill={useTx ? 'var(--phosphor-secondary)' : 'var(--phosphor-alert)'}
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          {useTx ? '$TX' : 'NO-TX'}
        </text>
        <text x="286" y="81" textAnchor="middle" fill="var(--ink-muted)" fontSize="8" fontFamily="var(--font-mono)">
          {useTx ? 'LOCK' : 'RACE'}
        </text>
        <text x="286" y="114" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-sans)">
          Prisma Lock Guard
        </text>

        {/* PostgreSQL Commit Node */}
        <circle cx="502" cy="72" r="22" fill="var(--bg)" stroke={useTx ? 'var(--phosphor-green)' : 'var(--phosphor-alert)'} strokeWidth="2" />
        <text x="502" y="75" textAnchor="middle" fill={useTx ? 'var(--phosphor-green)' : 'var(--phosphor-alert)'} fontSize="9.5" fontFamily="var(--font-mono)">
          PG-SQL
        </text>
        <text x="502" y="114" textAnchor="middle" fill="var(--ink-primary)" fontSize="10" fontFamily="var(--font-sans)">
          {useTx ? '1 Ticket Commit' : '2 Tickets (BUG!)'}
        </text>

        {/* Outcome labels */}
        <text x="394" y="54" textAnchor="middle" fill="var(--phosphor-green)" fontSize="9.5" fontFamily="var(--font-mono)">
          {phase === 'racing' ? 'CLI-A ▶ disputando...' : 'CLI-A → 201 CREATED'}
        </text>
        <text x="394" y="96" textAnchor="middle" fill={clientBColor} fontSize="9.5" fontFamily="var(--font-mono)">
          {phase === 'racing'
            ? 'CLI-B ▶ disputando...'
            : useTx
            ? 'CLI-B → 409 CONFLICT'
            : 'CLI-B → 201 DUPLICADO!'}
        </text>
      </svg>

      <div className="rom-lab-controls">
        <div className="lab-action-strip">
          <button type="button" className="cmd-link accent" onClick={() => fireRace(useTx)}>
            ▶ Disparar 2 requisições simultâneas
          </button>
          <span className={`lab-telemetry-inline t-nums ${useTx ? 'is-ok' : 'is-err'}`}>
            {useTx
              ? '✔ ACID garantido: ConflictException(409) impediu venda dupla do Assento D-07.'
              : '✕ Race Condition: sem $transaction, ambos os clientes compraram o mesmo assento!'}
          </span>
        </div>
      </div>
    </div>
  );
}

const INITIAL_AVL_KEYS = [30, 15, 45, 10, 22];

function AvlHashLab({ soundOn, unlockSeal, onRelicPing }) {
  const [subTab, setSubTab] = useState('avl'); // 'avl' | 'cpf'
  const [treeMode, setTreeMode] = useState('avl'); // 'avl' | 'bst'
  const [keys, setKeys] = useState(INITIAL_AVL_KEYS);
  const [keyInput, setKeyInput] = useState('50');
  const [cpfInput, setCpfInput] = useState('52998224725');

  const trees = useMemo(() => buildTrees(keys), [keys]);
  const layout = useMemo(
    () => layoutBinaryTree(treeMode === 'avl' ? trees.avl : trees.bst, 560, 28, 42),
    [trees, treeMode]
  );
  const cpfRes = useMemo(() => analyzeCpfHash(cpfInput, 11), [cpfInput]);

  const insertValues = (incoming) => {
    const validNums = incoming.filter((n) => Number.isFinite(n) && n >= 1 && n <= 999);
    if (!validNums.length) return;
    const merged = [...keys];
    validNums.forEach((n) => {
      if (!merged.includes(n) && merged.length < 15) merged.push(n);
    });
    const prevRot = trees.rotationCount;
    const nextTrees = buildTrees(merged);
    setKeys(merged);
    unlockSeal?.('seal_runner');
    if (nextTrees.rotationCount > prevRot) {
      playRotationChime(soundOn);
      onRelicPing?.(
        `Dixie Flatline: ${nextTrees.lastRotation} no nó ${nextTrees.lastRotatedAt}! Altura AVL ${nextTrees.avlHeight} vs BST ${nextTrees.bstHeight}.`
      );
    } else {
      playKeyclick(soundOn, 780);
    }
  };

  const handleAddKey = (e) => {
    e.preventDefault();
    const num = Number.parseInt(keyInput, 10);
    if (!Number.isFinite(num)) return;
    insertValues([num]);
    setKeyInput(String(Math.min(99, num + 10)));
  };

  const handleStressSorted = () => {
    insertValues([50, 60, 70, 80]);
  };

  const handleResetTree = () => {
    playKeyclick(soundOn, 560);
    setKeys(INITIAL_AVL_KEYS);
    setKeyInput('50');
  };

  const svgHeight = Math.max(152, (treeMode === 'avl' ? trees.avlHeight : trees.bstHeight) * 44 + 28);

  return (
    <div className="rom-lab-stage">
      <div className="rom-lab-head">
        <span className="rom-lab-kicker">Simulador ao vivo: Árvore AVL Auto-Balanceada &amp; Tabela Hash CPF</span>
        <div className="rom-lab-mode-row" role="group" aria-label="Alternar estrutura de dados">
          <button
            type="button"
            className={`lab-tab-btn ${subTab === 'avl' ? 'active' : ''}`}
            onClick={() => {
              playKeyclick(soundOn, 740);
              setSubTab('avl');
            }}
          >
            Árvore AVL vs BST
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${subTab === 'cpf' ? 'active' : ''}`}
            onClick={() => {
              playKeyclick(soundOn, 740);
              setSubTab('cpf');
            }}
          >
            Tabela Hash CPF (Mód-11)
          </button>
        </div>
      </div>

      {subTab === 'avl' ? (
        <>
          <div className="avl-meta-bar t-nums">
            <div className="avl-toggle-pair">
              <button
                type="button"
                className={`cmd-link ${treeMode === 'avl' ? 'accent' : ''}`}
                onClick={() => {
                  playKeyclick(soundOn, 820);
                  setTreeMode('avl');
                }}
              >
                AVL O(log n) · Altura {trees.avlHeight}
              </button>
              <button
                type="button"
                className={`cmd-link ${treeMode === 'bst' ? 'accent' : ''}`}
                onClick={() => {
                  playKeyclick(soundOn, 660);
                  setTreeMode('bst');
                }}
              >
                BST Comum · Altura {trees.bstHeight}
              </button>
            </div>
            <span className="avl-rot-stat">
              {trees.lastRotation
                ? `Última rotação: ${trees.lastRotation} (nó ${trees.lastRotatedAt})`
                : `Nós: ${keys.length} · Fator |FB| ≤ 1 estável`}
            </span>
          </div>

          <svg
            viewBox={`0 0 560 ${svgHeight}`}
            className="rom-tree-svg"
            role="img"
            aria-label={`Visualização de ${treeMode === 'avl' ? 'Árvore AVL' : 'Árvore BST'} com ${keys.length} nós`}
          >
            {layout.edges.map((e, i) => (
              <line
                key={i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="var(--hairline-strong)"
                strokeWidth="1.3"
              />
            ))}
            {layout.nodes.map((n) => {
              const unbalanced = Math.abs(n.bf) > 1;
              const isLatest = n.value === keys[keys.length - 1];
              const strokeCol = unbalanced
                ? 'var(--phosphor-alert)'
                : isLatest
                ? 'var(--phosphor-secondary)'
                : 'var(--phosphor-primary)';
              return (
                <g key={n.value}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="15"
                    fill="var(--bg)"
                    stroke={strokeCol}
                    strokeWidth={isLatest || unbalanced ? 2 : 1.4}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill="var(--ink-primary)"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                  >
                    {n.value}
                  </text>
                  <text
                    x={n.x + 19}
                    y={n.y - 7}
                    fill={unbalanced ? 'var(--phosphor-alert)' : 'var(--ink-muted)'}
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                  >
                    {n.bf > 0 ? `+${n.bf}` : n.bf}
                  </text>
                </g>
              );
            })}
          </svg>

          <form className="lab-input-line" onSubmit={handleAddKey}>
            <label htmlFor="avl-key-input" className="lab-input-prefix">
              insert(key) =
            </label>
            <input
              id="avl-key-input"
              type="number"
              min="1"
              max="999"
              className="lab-mono-input narrow t-nums"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
            <button type="submit" className="cmd-link accent">
              + Inserir Nó
            </button>
            <button type="button" className="cmd-link" onClick={handleStressSorted}>
              ⚡ Stress Ordenado (+50..80)
            </button>
            <button type="button" className="cmd-link" onClick={handleResetTree}>
              Resetar ↺
            </button>
          </form>
        </>
      ) : (
        <div className="rom-lab-controls">
          <div className="lab-input-line">
            <label htmlFor="cpf-hash-input" className="lab-input-prefix">
              hash(CPF) =
            </label>
            <input
              id="cpf-hash-input"
              type="text"
              maxLength={14}
              className="lab-mono-input t-nums"
              value={cpfInput}
              onChange={(e) => setCpfInput(e.target.value)}
              placeholder="52998224725"
            />
            <button
              type="button"
              className="relic-topic-link"
              onClick={() => {
                playRotationChime(soundOn);
                setCpfInput('52998224725');
              }}
            >
              529.982.247-25 (OK)
            </button>
            <button
              type="button"
              className="relic-topic-link"
              onClick={() => {
                playRotationChime(soundOn);
                setCpfInput('11144477735');
              }}
            >
              111.444.777-35 (OK)
            </button>
            <button
              type="button"
              className="relic-topic-link"
              onClick={() => {
                playConflictBuzz(soundOn);
                setCpfInput('52998224799');
              }}
            >
              DV Inválido
            </button>
          </div>

          <svg viewBox="0 0 560 76" className="rom-pipeline-svg" role="img" aria-label="11 buckets da Tabela Hash de CPF">
            <line x1="25" y1="36" x2="535" y2="36" stroke="var(--hairline)" strokeWidth="1" />
            {Array.from({ length: 11 }, (_, b) => {
              const cx = 28 + b * 50.4;
              const hit = cpfRes.valid && cpfRes.bucket === b;
              return (
                <g key={b}>
                  <circle
                    cx={cx}
                    cy="36"
                    r={hit ? 16 : 11}
                    fill="var(--bg)"
                    stroke={hit ? 'var(--phosphor-secondary)' : 'var(--hairline-strong)'}
                    strokeWidth={hit ? 2.2 : 1.1}
                  />
                  <text
                    x={cx}
                    y="40"
                    textAnchor="middle"
                    fill={hit ? 'var(--phosphor-secondary)' : 'var(--ink-muted)'}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    #{b}
                  </text>
                  {hit && (
                    <text
                      x={cx}
                      y="68"
                      textAnchor="middle"
                      fill="var(--phosphor-primary)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                    >
                      O(1) HIT
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className={`lab-telemetry-out t-nums ${cpfRes.valid ? 'is-ok' : 'is-err'}`}>
            {cpfRes.valid ? '✔ ' : '✕ '}
            {cpfRes.reason}
          </div>
        </div>
      )}
    </div>
  );
}

function StandardPipelineLab({ romId, soundOn, unlockSeal }) {
  const cfg = STANDARD_PIPELINES[romId];
  const [scenario, setScenario] = useState('happy'); // 'happy' | 'guard'
  const [step, setStep] = useState(4);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (tick === 0) return undefined;
    const maxStep = scenario === 'happy' ? 4 : 2;
    let cur = 1;
    const id = setInterval(() => {
      cur += 1;
      setStep(cur);
      if (cur >= maxStep) clearInterval(id);
    }, 150);
    return () => clearInterval(id);
  }, [tick, scenario]);

  if (!cfg) return null;

  const fire = (nextScenario) => {
    setScenario(nextScenario);
    setStep(1);
    setTick((t) => t + 1);
    unlockSeal?.('seal_runner');
    if (nextScenario === 'happy') {
      playRotationChime(soundOn);
    } else {
      playConflictBuzz(soundOn);
    }
  };

  const xs = [64, 214, 364, 514];
  const isGuard = scenario === 'guard';
  const beamCol = isGuard ? 'var(--phosphor-alert)' : 'var(--phosphor-secondary)';

  return (
    <div className="rom-lab-stage">
      <div className="rom-lab-head">
        <span className="rom-lab-kicker">Fluxo de requisição ao vivo: {cfg.title}</span>
        <div className="rom-lab-mode-row">
          <button
            type="button"
            className={`lab-tab-btn ${!isGuard ? 'active' : ''}`}
            onClick={() => fire('happy')}
          >
            {cfg.happyLabel}
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${isGuard ? 'active is-warn' : ''}`}
            onClick={() => fire('guard')}
          >
            {cfg.guardLabel}
          </button>
        </div>
      </div>

      <svg viewBox="0 0 580 112" className="rom-pipeline-svg" role="img" aria-label={cfg.title}>
        <line x1="64" y1="42" x2="514" y2="42" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="3 5" />
        <line
          x1="64"
          y1="42"
          x2={xs[Math.min(3, Math.max(0, step - 1))]}
          y2="42"
          stroke={beamCol}
          strokeWidth="2.2"
          className="pipeline-active-beam"
        />
        {cfg.nodes.map((node, idx) => {
          const x = xs[idx];
          const num = idx + 1;
          const reached = step >= num && !(isGuard && num > 2);
          const blocked = isGuard && num === 2;
          const strokeCol = blocked ? 'var(--phosphor-alert)' : reached ? beamCol : 'var(--hairline-strong)';
          return (
            <g key={node.code}>
              <circle cx={x} cy="42" r={reached ? 20 : 17} fill="var(--bg)" stroke={strokeCol} strokeWidth={reached ? 2 : 1.2} />
              <text x={x} y="46" textAnchor="middle" fill={reached ? strokeCol : 'var(--ink-muted)'} fontSize="10" fontFamily="var(--font-mono)">
                {node.code}
              </text>
              <text x={x} y="82" textAnchor="middle" fill={reached ? 'var(--ink-primary)' : 'var(--ink-muted)'} fontSize="10.5" fontFamily="var(--font-sans)">
                {node.label}
              </text>
              <text x={x} y="98" textAnchor="middle" fill="var(--ink-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
                {node.sub}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="rom-lab-controls">
        <div className="lab-action-strip">
          <button type="button" className="cmd-link accent" onClick={() => fire(scenario)}>
            ▶ Pulsar requisição
          </button>
          <span className={`lab-telemetry-inline t-nums ${isGuard ? 'is-err' : 'is-ok'}`}>
            {isGuard ? cfg.guardLog : cfg.happyLog}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RomSignalLab({ romId, soundOn, unlockSeal, onRelicPing }) {
  if (romId === 'zetti-prod') {
    return <ZettiSqlLab key={romId} soundOn={soundOn} unlockSeal={unlockSeal} onRelicPing={onRelicPing} />;
  }
  if (romId === 'vosso-cinema-api') {
    return <CinemaConcurrencyLab key={romId} soundOn={soundOn} unlockSeal={unlockSeal} onRelicPing={onRelicPing} />;
  }
  if (romId === 'estruturas-dados-java') {
    return <AvlHashLab key={romId} soundOn={soundOn} unlockSeal={unlockSeal} onRelicPing={onRelicPing} />;
  }
  return <StandardPipelineLab key={romId} romId={romId} soundOn={soundOn} unlockSeal={unlockSeal} />;
}
