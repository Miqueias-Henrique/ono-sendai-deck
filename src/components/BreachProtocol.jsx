import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import WintermuteCoreSvg from './WintermuteCoreSvg';
import {
  BREACH_BUFFER,
  BREACH_TIME,
  generateBreachPuzzle,
  bufferContains,
  daemonProgress,
  activeLine,
} from '../utils/breachEngine';
import {
  playKeyclick,
  playRelicGlitch,
  playVangelisChord,
  playDaemonUpload,
} from '../utils/soundEngine';

const INITIAL_LOG = [
  'BREACH PROTOCOL v2.2 // alvo: ICE Wintermute (Tessier-Ashpool).',
  'Mouse ou setas + Enter: comece na 1ª linha e alterne coluna ↕ / linha ↔.',
];

const TIERS = {
  corp: { id: 'corp', label: 'CORPORATIVO · 45s', seconds: BREACH_TIME },
  blackwall: { id: 'blackwall', label: 'BLACKWALL · 22s', seconds: 22 },
};

export default function BreachProtocol({ soundOn, unlockSeal, onRelicPing, notify }) {
  const [seed, setSeed] = useState(2077);
  const [tier, setTier] = useState('corp');
  const [streak, setStreak] = useState(0);
  const puzzle = useMemo(() => generateBreachPuzzle(seed), [seed]);

  const [selection, setSelection] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [timeLeft, setTimeLeft] = useState(TIERS.corp.seconds);
  const [hoverCode, setHoverCode] = useState(null);
  const [hintOn, setHintOn] = useState(false);
  const [log, setLog] = useState(INITIAL_LOG);

  const deadlineRef = useRef(0);
  const bufferRef = useRef([]);
  const finalizeRef = useRef(null);
  const cellRefs = useRef({});

  const totalSeconds = TIERS[tier].seconds;
  const buffer = selection.map(([r, c]) => puzzle.matrix[r][c]);
  const line = activeLine(selection);
  const usedSet = new Set(selection.map(([r, c]) => `${r}-${c}`));

  const finalize = useCallback(
    (finalBuffer, reason) => {
      const done = puzzle.daemons.filter((d) => bufferContains(finalBuffer, d.sequence));
      setPhase('done');

      const reasonLine =
        reason === 'timeout'
          ? '✕ TEMPO ESGOTADO — o ICE fechou a conexão.'
          : reason === 'blocked'
          ? '✕ SEM CAMINHO — nenhum código disponível na linha ativa.'
          : reason === 'all'
          ? `★ TODOS OS DAEMONS ENVIADOS — ICE Wintermute desmontado${tier === 'blackwall' ? ' (MODO BLACKWALL)' : ''}.`
          : '■ BUFFER CHEIO — upload encerrado.';

      setLog([
        reasonLine,
        done.length > 0
          ? `Daemons enviados: ${done.map((d) => d.name).join(' · ')} (${done.length}/3).`
          : 'Nenhum daemon completo. Reinicie e tente outra rota.',
      ]);

      if (done.length > 0) {
        unlockSeal('seal_icebreaker');
      }
      if (done.length === 3) {
        setStreak((s) => s + 1);
        playVangelisChord(soundOn);
        onRelicPing?.(
          tier === 'blackwall'
            ? 'Johnny-84: 3/3 na Blackwall em 22 segundos?! Você é netrunner de elite, samurai.'
            : 'Johnny-84: Três daemons na veia! Esse ICE virou sucata — igual query sem índice depois que o Miqueias passa.'
        );
        notify?.(
          tier === 'blackwall'
            ? 'BLACKWALL BREACH 3/3 — ICE Wintermute aniquilado!'
            : 'Breach Protocol 3/3 — ICE Wintermute desmontado.'
        );
      } else if (done.length > 0) {
        setStreak(0);
        playRelicGlitch(soundOn);
        onRelicPing?.(`Dixie Flatline: ${done.length}/3 daemons no alvo, cowboy. Dá pra fazer melhor — reinicia a matriz.`);
      } else {
        setStreak(0);
        onRelicPing?.('Johnny-84: Flatline, choom. Respira e escolhe a rota pensando dois passos à frente.');
      }
    },
    [puzzle, tier, unlockSeal, onRelicPing, notify, soundOn]
  );

  useEffect(() => {
    finalizeRef.current = finalize;
  }, [finalize]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    deadlineRef.current = Date.now() + totalSeconds * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(id);
        finalizeRef.current?.(bufferRef.current, 'timeout');
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, totalSeconds]);

  const isSelectable = (r, c) => {
    if (phase === 'done') return false;
    if (usedSet.has(`${r}-${c}`)) return false;
    return line.axis === 'row' ? r === line.index : c === line.index;
  };

  const handlePick = (r, c) => {
    if (!isSelectable(r, c)) return;
    const code = puzzle.matrix[r][c];
    const nextSel = [...selection, [r, c]];
    const nextBuf = [...buffer, code];
    bufferRef.current = nextBuf;
    setSelection(nextSel);

    if (phase === 'idle') {
      setPhase('running');
    }

    const justDone = puzzle.daemons.filter(
      (d) => bufferContains(nextBuf, d.sequence) && !bufferContains(buffer, d.sequence)
    );
    const totalDoneNow = puzzle.daemons.filter((d) => bufferContains(nextBuf, d.sequence)).length;

    if (justDone.length > 0) {
      playDaemonUpload(soundOn, totalDoneNow);
    } else {
      playKeyclick(soundOn, 620 + nextSel.length * 60);
    }

    setLog((prev) => [
      ...prev.slice(-2),
      `▸ ${code} carregado [L${r + 1}:C${c + 1}]${justDone.length ? ` — ${justDone.map((d) => d.name).join(', ')} ENVIADO` : ''}`,
    ]);

    const allDone = totalDoneNow === puzzle.daemons.length;
    if (allDone) {
      finalize(nextBuf, 'all');
      return;
    }
    if (nextBuf.length >= BREACH_BUFFER) {
      finalize(nextBuf, 'full');
      return;
    }
    const nextLine = activeLine(nextSel);
    const nextUsed = new Set(nextSel.map(([rr, cc]) => `${rr}-${cc}`));
    let firstValid = null;
    for (let i = 0; i < puzzle.matrix.length; i += 1) {
      const rr = nextLine.axis === 'row' ? nextLine.index : i;
      const cc = nextLine.axis === 'row' ? i : nextLine.index;
      if (!nextUsed.has(`${rr}-${cc}`)) {
        firstValid = [rr, cc];
        break;
      }
    }
    if (!firstValid) {
      finalize(nextBuf, 'blocked');
    }
  };

  const handleReset = (nextTier = tier) => {
    playKeyclick(soundOn, 520);
    setTier(nextTier);
    setSeed((s) => s + 1);
    setSelection([]);
    bufferRef.current = [];
    setPhase('idle');
    setTimeLeft(TIERS[nextTier].seconds);
    setHintOn(false);
    setLog([
      `MATRIZ RECOMPILADA [${TIERS[nextTier].label}] — nova rota de códigos gerada.`,
      INITIAL_LOG[1],
    ]);
  };

  const handleHint = () => {
    playKeyclick(soundOn, 880);
    setHintOn((h) => !h);
    if (!hintOn) {
      onRelicPing?.('Dixie Flatline: Segue o código piscando, cowboy. Eu já morri três vezes nessa matriz.');
    }
  };

  const handleCellKeyDown = (e, r, c) => {
    const size = puzzle.matrix.length;
    let nr = r;
    let nc = c;
    const k = e.key.toLowerCase();
    if (k === 'arrowright' || k === 'd') nc = (c + 1) % size;
    else if (k === 'arrowleft' || k === 'a') nc = (c - 1 + size) % size;
    else if (k === 'arrowdown' || k === 's') nr = (r + 1) % size;
    else if (k === 'arrowup' || k === 'w') nr = (r - 1 + size) % size;
    else return;

    e.preventDefault();
    cellRefs.current[`${nr}-${nc}`]?.focus();
  };

  // Hint only while the player is still on the guaranteed path
  const onPath = selection.every(
    ([r, c], i) => puzzle.path[i] && puzzle.path[i][0] === r && puzzle.path[i][1] === c
  );
  const hintCell = hintOn && onPath && phase !== 'done' ? puzzle.path[selection.length] : null;

  const doneCount = puzzle.daemons.filter((d) => bufferContains(buffer, d.sequence)).length;
  const iceShield = doneCount === 3 ? 0 : Math.round(100 - doneCount * 33.4);
  const timePct = Math.round((timeLeft / totalSeconds) * 100);

  // SVG vector route connecting picked cells across the 5x5 matrix (viewBox 0..100)
  const routePoints = selection
    .map(([r, c]) => `${c * 20 + 10},${r * 20 + 10}`)
    .join(' ');

  return (
    <div className="breach-stage">
      <div className="breach-matrix-col">
        <div className="breach-meta-row t-nums">
          <span>
            Matriz Hexadecimal {puzzle.matrix.length}×{puzzle.matrix.length}
            {streak > 0 ? ` · Sequência ${streak}★` : ''}
          </span>
          <span
            className={`breach-timer ${timeLeft < 10 && phase === 'running' ? 'is-critical' : ''}`}
            aria-live="off"
          >
            {phase === 'idle'
              ? `Tempo ${totalSeconds.toFixed(1)}s · inicia no 1º código`
              : `Tempo ${timeLeft.toFixed(1)}s`}
          </span>
        </div>
        <div className="breach-timer-track" aria-hidden="true">
          <div className="breach-timer-fill" style={{ transform: `scaleX(${timePct / 100})` }} />
        </div>

        <div className="breach-tier-strip" role="group" aria-label="Nível de ICE do Breach Protocol">
          {Object.values(TIERS).map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tier === t.id}
              className={`lab-tab-btn ${tier === t.id ? (t.id === 'blackwall' ? 'active is-warn' : 'active') : ''}`}
              onClick={() => handleReset(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className={`breach-matrix ${phase === 'done' ? 'is-done' : ''}`}
          role="grid"
          aria-label="Matriz de códigos do Breach Protocol"
        >
          {/* Hairline SVG netrunner trace etched across selected cells (non-scaling stroke) */}
          {selection.length > 0 && (
            <>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="breach-route-svg" aria-hidden="true">
                {selection.length > 1 && (
                  <polyline
                    points={routePoints}
                    fill="none"
                    stroke="var(--phosphor-secondary)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    strokeOpacity="0.65"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
              <div className="breach-route-dots" aria-hidden="true">
                {selection.map(([r, c], idx) => (
                  <span
                    key={`${r}-${c}`}
                    className={`breach-route-dot ${idx === selection.length - 1 ? 'is-head' : ''}`}
                    style={{ left: `${c * 20 + 10}%`, top: `${r * 20 + 10}%` }}
                  />
                ))}
              </div>
            </>
          )}

          {puzzle.matrix.map((rowCodes, r) => (
            <div className="breach-row" role="row" key={r}>
              {rowCodes.map((code, c) => {
                const used = usedSet.has(`${r}-${c}`);
                const selectable = isSelectable(r, c);
                const inLine =
                  phase !== 'done' && (line.axis === 'row' ? r === line.index : c === line.index);
                const isHint = hintCell && hintCell[0] === r && hintCell[1] === c;
                const matchesHover = hoverCode && code === hoverCode && !used;
                return (
                  <button
                    key={c}
                    ref={(el) => {
                      cellRefs.current[`${r}-${c}`] = el;
                    }}
                    type="button"
                    role="gridcell"
                    className={[
                      'breach-cell',
                      inLine ? 'in-line' : '',
                      used ? 'is-used' : '',
                      isHint ? 'is-hint' : '',
                      matchesHover ? 'is-echo' : '',
                    ].join(' ')}
                    aria-disabled={!selectable}
                    aria-label={`Linha ${r + 1}, coluna ${c + 1}: ${used ? 'usado' : code}${selectable ? ', disponível' : ''}`}
                    onClick={() => handlePick(r, c)}
                    onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                    onMouseEnter={() => setHoverCode(code)}
                    onMouseLeave={() => setHoverCode(null)}
                    onFocus={() => setHoverCode(code)}
                    onBlur={() => setHoverCode(null)}
                  >
                    {used ? '··' : code}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="breach-buffer" aria-label="Buffer de upload">
          <span className="breach-buffer-label">Buffer</span>
          <div className="breach-buffer-slots t-nums">
            {Array.from({ length: BREACH_BUFFER }, (_, i) => (
              <span key={i} className={`breach-slot ${buffer[i] ? 'filled' : ''}`}>
                {buffer[i] || '__'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="breach-side-col">
        <div className="breach-core-row">
          <WintermuteCoreSvg iceShield={iceShield} playerIntegrity={phase === 'done' && doneCount === 0 ? 0 : 100} />
          <div className="breach-log" aria-live="polite">
            {log.map((entry, idx) => (
              <div key={`${idx}-${entry}`}>{entry}</div>
            ))}
          </div>
        </div>

        <div className="breach-daemons">
          <span className="breach-daemons-kicker">Sequências de upload</span>
          {puzzle.daemons.map((d) => {
            const complete = bufferContains(buffer, d.sequence);
            const failed = phase === 'done' && !complete;
            const progress = complete ? d.sequence.length : daemonProgress(buffer, d.sequence);
            return (
              <div
                key={d.id}
                className={`breach-daemon ${complete ? 'is-complete' : ''} ${failed ? 'is-failed' : ''}`}
              >
                <div className="breach-daemon-seq t-nums">
                  {d.sequence.map((code, i) => (
                    <span
                      key={i}
                      className={[
                        i < progress ? 'hit' : '',
                        !complete && i === progress && hoverCode === code ? 'next' : '',
                      ].join(' ')}
                    >
                      {code}
                    </span>
                  ))}
                </div>
                <div className="breach-daemon-info">
                  <strong>
                    {d.name}
                    <span className="breach-daemon-state">
                      {complete ? ' · ENVIADO' : failed ? ' · FALHOU' : ''}
                    </span>
                  </strong>
                  <span>{complete ? d.reward : d.skill}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="breach-actions">
          <button type="button" className="deck-cta" onClick={() => handleReset(tier)}>
            {phase === 'done' ? 'Nova incursão ↺' : 'Recompilar matriz ↺'}
          </button>
          <button
            type="button"
            className="cmd-link accent"
            aria-pressed={hintOn}
            onClick={handleHint}
            disabled={phase === 'done'}
          >
            {hintOn ? 'Dica do Dixie: ativa' : 'Pedir dica ao Dixie'}
          </button>
        </div>
      </div>
    </div>
  );
}
