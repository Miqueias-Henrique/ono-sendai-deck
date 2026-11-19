import React, { useState, useEffect, useRef } from 'react';
import { CONSTRUCT_PERSONAS, LORE_CODEX, PROFILE_DATA } from '../data/portfolioData';
import { playKeyclick, playRelicGlitch } from '../utils/soundEngine';

function generateFreeReply(personaId, query) {
  const q = query.toLowerCase().trim();

  if (q.includes('ff:06') || q.includes('ff06') || q.includes('estátua') || q.includes('estatua')) {
    return personaId === 'dixie'
      ? 'FF:06:B5 é ruído de frequência fora da banda, cowboy. O único hex que segura uma transação na Matrix é lock otimista e índice B-Tree bem calibrado.'
      : 'Johnny-84: Passei décadas vendo netrunner queimar neurônio caçando esse código magenta em Night City. Quer decifrar algo que paga conta? Olha o T-SQL do Miqueias validando CNPJ alfanumérico NT-2026 sem dar deadlock.';
  }
  if (q.includes('arasaka') || q.includes('mikoshi') || q.includes('soulkiller') || q.includes('torre') || q.includes('tower')) {
    return personaId === 'rachel'
      ? 'Arasaka e Tyrell compartilham a mesma ambição: capturar memória em silício. A diferença aqui é que código versionado no Git não escraviza ninguém — ele escala sistemas honestos.'
      : 'Johnny-84: Arasaka trancava mentes dentro de servidores gelados em Mikoshi. Aqui nós abrimos o código no GitHub mesmo — API REST limpa, Swagger documentado e zero caixa preta corporativa.';
  }
  if (q.includes('zetti') || q.includes('sql') || q.includes('vb6') || q.includes('farm') || q.includes('cnpj')) {
    return personaId === 'dixie'
      ? 'Sustentação em produção é onde o gelo fica quente de verdade, cowboy. Desde dez/2025 o Miqueias escreve Views, Stored Procedures e migra regras do CNPJ alfanumérico no SQL Server + VB6 sem derrubar uma filial. Testa o validador NT-2026 logo abaixo na Fita ROM I.'
      : 'Johnny-84: Segura esse dado: dezenas de farmácias dependendo do banco todo dia na Zetti. Ele mete mão em SQL Server, T-SQL, VB6 e reforma tributária sem frescura. Pode testar o validador CNPJ Alfanumérico ao vivo na Seção 01.';
  }
  if (q.includes('avl') || q.includes('bst') || q.includes('hash') || q.includes('cpf') || q.includes('algoritmo')) {
    return personaId === 'dixie'
      ? 'Abre a Fita ROM VI na Seção 01, cowboy: tem uma Árvore AVL ao vivo onde você pode socar chaves ordenadas e ver a rotação RR segurar O(log n) enquanto a BST vira escada O(n).'
      : 'Johnny-84: Quer ver estrutura de dados de verdade sem framework maquiando? Puxa a Fita ROM VI — Árvore AVL e Tabela Hash CPF Módulo-11 rodando ao vivo no navegador.';
  }
  if (q.includes('stack') || q.includes('java') || q.includes('c#') || q.includes('.net') || q.includes('node') || q.includes('nest')) {
    return 'Stack principal detectada no barramento: C# / .NET, SQL Server, VB6, Java 17 (Spring Boot 3 + JPA + JavaFX DAO), Node.js (TypeScript, NestJS, Prisma, TypeORM), PostgreSQL, MySQL e Docker.';
  }
  if (q.includes('blackwall') || q.includes('wintermute') || q.includes('ice') || q.includes('neuromancer')) {
    return personaId === 'dixie'
      ? 'Além da Blackwall só tem IA selvagem e ICE preto, cowboy. Se quiser treinar seu deck, pula na Seção 03 e ativa o modo BLACKWALL (22s) no Breach Protocol.'
      : 'Johnny-84: A Blackwall só segura enquanto gente competente mantém os protocolos vivos. Vai lá na Seção 03 e tenta bater o Breach Protocol no modo Blackwall.';
  }
  if (q.includes('afterlife') || q.includes('drink') || q.includes('contratar') || q.includes('vaga') || q.includes('contato') || q.includes('email')) {
    return `Canal direto de recrutamento aberto: ${PROFILE_DATA.email} | WhatsApp Goiânia ${PROFILE_DATA.phoneDisplay} | Bacharelado Engenharia de Software UNIFAN (2027). Você também pode abrir o Briefing 30s ou baixar o PDF na Seção 04.`;
  }
  if (q.includes('chiba') || q.includes('gibson') || q.includes('case') || q.includes('molly')) {
    return 'Chiba City foi onde Case trocou nervos queimados por um Ono-Sendai Cyberspace 7 emprestado. Este deck usa o mesmo espírito: enxugar o excesso visual e deixar só sinal útil, onda neural e código que compila.';
  }
  if (q.includes('breach') || q.includes('daemon') || q.includes('1c') || q.includes('55') || q.includes('bd')) {
    return personaId === 'dixie'
      ? 'Breach Protocol ativo na Seção 03, cowboy: navegue com mouse ou setas do teclado, comece na linha 1 da matriz 5×5 e alterne coluna e linha para enviar DATAMINE_V1, ICEPICK e MASS_VULNERABILITY.'
      : 'Johnny-84: Quer invadir de verdade? Desce na Seção 03 e manda os 3 daemons no Breach Protocol (`1C 55 BD E9 7A FF`) — dá até pra ativar sobrecarga Blackwall de 22 segundos.';
  }
  if (q.includes('samurai') || q.includes('never fade') || q.includes('silverhand') || q.includes('2023')) {
    return 'Johnny-84: "A thing of beauty, I know — will never fade away." Em 2023 a Samurai fazia barulho na Torre Arasaka; hoje o barulho bom é query em 3ms e deploy sem rollback.';
  }
  if (q.includes('sandevistan') || q.includes('kiroshi') || q.includes('trauma') || q.includes('cyberware') || q.includes('netrunner')) {
    return personaId === 'rachel'
      ? 'Implantes Kiroshi ampliam a visão, mas é a disciplina de engenharia que enxerga gargalos antes que virem incidente em produção.'
      : 'Johnny-84: Sandevistan nenhum salva código mal indexado, choom. O que acelera sistema de verdade é Index Seek no SQL Server e rotina assíncrona bem escrita.';
  }
  if (q.includes('esper') || q.includes('blade runner') || q.includes('tears') || q.includes('chuva') || q.includes('voight')) {
    return 'Rachel-7: No terminal Esper 2019 (disponível no Hosaka OS) você pode aplicar zoom óptico no retrato e inspecionar a telemetria biométrica Voight-Kampff.';
  }
  if (q.includes('oi') || q.includes('olá') || q.includes('ola') || q.includes('salve') || q.includes('eai')) {
    return personaId === 'dixie'
      ? 'E aí, cowboy. Fita ROM girando a 640K sem engasgo. Pergunta sobre Zetti, Árvore AVL, Breach Protocol ou clique numa linha de diálogo.'
      : 'Johnny-84: Fala, choom. A cidade lá fora tá cheia de site igual cheio de caixinha brilhante. Aqui o papo é direto: código em produção, laboratório ao vivo e ZERO enfeite corporativo.';
  }

  return personaId === 'rachel'
    ? `Consulta processada sobre "${query}": Miqueias une base acadêmica sólida em Engenharia de Software (UNIFAN 2027) com experiência prática diária em SQL Server, VB6, C#/.NET, Java 17 e Node.js.`
    : personaId === 'dixie'
    ? `Sinal recebido sobre "${query}", cowboy. Dica rápida: tente perguntar por "zetti", "avl", "stack", "breach", "ff:06:b5", "mikoshi" ou "contratar", ou clique nas opções de diálogo acima.`
    : `Johnny-84 sobre "${query}": gostei da curiosidade, samurai. Se quiser resposta na veia, manda um "zetti", "avl", "stack", "breach", "samurai", "ff:06:b5" ou "afterlife" — ou usa os tópicos diretos logo acima.`;
}

function buildWavePath(phase, ampScale) {
  const pts = [];
  for (let i = 0; i <= 40; i += 1) {
    const x = (i / 40) * 200;
    const envelope = Math.sin((i / 40) * Math.PI);
    const wave =
      Math.sin(i * 0.42 + phase) * 0.65 +
      Math.sin(i * 0.95 - phase * 1.4) * 0.35;
    const y = 16 + wave * ampScale * envelope;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function RelicConstructDialog({
  soundOn,
  unlockSeal,
  onTriggerEffect,
  externalEvent,
  onOpenBriefing,
}) {
  const [personaId, setPersonaId] = useState('johnny');
  const [nodeId, setNodeId] = useState('start');
  const [relicSync, setRelicSync] = useState(28);
  const [customInput, setCustomInput] = useState('');
  const [history, setHistory] = useState([
    {
      id: 1,
      speaker: 'JOHNNY-84',
      text: CONSTRUCT_PERSONAS.johnny.greeting,
      tone: 'construct',
    },
  ]);
  const [activeLoreId, setActiveLoreId] = useState(LORE_CODEX[0].id);

  // Fast streaming typewriter reveal for the latest construct message
  const msgCounterRef = useRef(1);
  const latestEntry = history[history.length - 1];
  const [typedLen, setTypedLen] = useState(latestEntry.text.length);

  // Live SVG EEG path ref (direct DOM attribute update at ~30fps, zero React re-renders)
  const wavePathRef = useRef(null);
  const sectionRef = useRef(null);
  const speakingRef = useRef(false);

  const isStreaming =
    latestEntry &&
    latestEntry.tone === 'construct' &&
    typedLen < latestEntry.text.length;

  useEffect(() => {
    speakingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming || !latestEntry) return undefined;
    const total = latestEntry.text.length;
    const stepSize = Math.max(3, Math.ceil(total / 34));
    const timer = setInterval(() => {
      setTypedLen((prev) => {
        const next = Math.min(total, prev + stepSize);
        if (next >= total) clearInterval(timer);
        return next;
      });
    }, 18);
    return () => clearInterval(timer);
  }, [isStreaming, latestEntry]);

  // Live continuous EEG oscilloscope (pauses when offscreen or reduced-motion)
  useEffect(() => {
    const pathEl = wavePathRef.current;
    if (!pathEl) return undefined;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      pathEl.setAttribute('d', buildWavePath(1.2, 6.5));
      return undefined;
    }

    let rafId = 0;
    let phase = 0;
    let visible = true;
    let lastTime = 0;

    let io = null;
    if (sectionRef.current && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          visible = Boolean(entries[0]?.isIntersecting);
        },
        { threshold: 0.01 }
      );
      io.observe(sectionRef.current);
    }

    const tick = (ts) => {
      if (visible && ts - lastTime > 34) {
        lastTime = ts;
        phase += speakingRef.current ? 0.42 : 0.14;
        const amp = speakingRef.current ? 11.5 : 5.2;
        pathEl.setAttribute('d', buildWavePath(phase, amp));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      io?.disconnect();
    };
  }, []);

  const persona = CONSTRUCT_PERSONAS[personaId] || CONSTRUCT_PERSONAS.johnny;
  const activeNode = persona.nodes[nodeId] || persona.nodes.start;
  const activeLore = LORE_CODEX.find((item) => item.id === activeLoreId) || LORE_CODEX[0];

  const pushMessages = (entries) => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const last = entries[entries.length - 1];
    setTypedLen(
      reducedMotion || !last || last.tone !== 'construct' ? last?.text.length ?? 0 : 0
    );
    setHistory((prev) => {
      const tagged = entries.map((entry) => {
        msgCounterRef.current += 1;
        return { ...entry, id: msgCounterRef.current };
      });
      return [...prev.slice(-1), ...tagged];
    });
  };

  const handleSelectPersona = (nextPersonaId) => {
    const target = CONSTRUCT_PERSONAS[nextPersonaId];
    if (!target) return;
    playRelicGlitch(soundOn);
    setPersonaId(nextPersonaId);
    setNodeId('start');
    setRelicSync((s) => Math.min(100, s + 8));
    unlockSeal('seal_owl');
    pushMessages([
      {
        speaker: target.handle.split(' // ')[0],
        text: target.greeting,
        tone: 'construct',
      },
    ]);
  };

  const handlePickOption = (opt) => {
    playKeyclick(soundOn, 820);
    unlockSeal('seal_owl');
    setRelicSync((s) => Math.min(100, s + 14));

    if (opt.effect?.switchPersona) {
      handleSelectPersona(opt.effect.switchPersona);
      return;
    }

    if (opt.effect && onTriggerEffect) {
      onTriggerEffect(opt.effect);
    }

    const nextNodeKey = opt.nextNode || 'start';
    const nextNodeObj = persona.nodes[nextNodeKey] || persona.nodes.start;
    setNodeId(nextNodeKey);
    pushMessages([
      { speaker: 'VOCÊ', text: opt.label, tone: 'user' },
      {
        speaker: persona.handle.split(' // ')[0],
        text: nextNodeObj.speech,
        tone: 'construct',
      },
    ]);
  };

  const handleSendPrompt = (e) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    playRelicGlitch(soundOn);
    unlockSeal('seal_owl');
    setRelicSync((s) => Math.min(100, s + 12));

    const reply = generateFreeReply(personaId, trimmed);
    pushMessages([
      { speaker: 'VOCÊ', text: trimmed, tone: 'user' },
      { speaker: persona.handle.split(' // ')[0], text: reply, tone: 'construct' },
    ]);
    setCustomInput('');
  };

  const handleQuickPrompt = (keyword) => {
    playKeyclick(soundOn, 760);
    unlockSeal('seal_owl');
    setRelicSync((s) => Math.min(100, s + 10));
    const reply = generateFreeReply(personaId, keyword);
    pushMessages([
      { speaker: 'VOCÊ', text: `consulta --topic ${keyword}`, tone: 'user' },
      { speaker: persona.handle.split(' // ')[0], text: reply, tone: 'construct' },
    ]);
  };

  return (
    <div
      ref={sectionRef}
      id="sec-relic-chat"
      className="relic-construct-section"
      aria-labelledby="relic-heading"
    >
      {/* Borderless Top Rail Header */}
      <div className="relic-top-rail">
        <div className="relic-persona-tabs" role="group" aria-label="Canal do Constructo Neural">
          {Object.values(CONSTRUCT_PERSONAS).map((p) => {
            const active = p.id === personaId;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                className={`relic-tab-link ${active ? 'active' : ''}`}
                style={{ '--tab-accent': p.accentVar }}
                onClick={() => handleSelectPersona(p.id)}
              >
                <span>{p.handle.split(' // ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="relic-sync-telemetry">
          <svg viewBox="0 0 200 32" className="relic-wave-svg" aria-hidden="true">
            <path
              ref={wavePathRef}
              d="M 0 16 L 200 16"
              fill="none"
              stroke={persona.accentVar}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="relic-sync-stat">
            <span className="t-nums">
              {isStreaming ? 'Transmitindo sinal:' : 'Sincronia Relic:'} {relicSync}%
            </span>
            <div className="relic-sync-bar" aria-hidden="true">
              <div
                className="relic-sync-fill"
                style={{ width: `${relicSync}%`, background: persona.accentVar }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Borderless Interactive Dialogue Stream */}
      <div className="relic-dialogue-grid">
        <div className="relic-transcript-col">
          <div className="relic-speaker-meta" style={{ color: persona.accentVar }}>
            <span>{persona.handle.replace(' // ', ' · ')}</span>
            <span className="meta-sep">·</span>
            <span>{persona.origin}</span>
          </div>

          <div className="relic-heading-row">
            <h3 id="relic-heading" className="relic-section-title">
              Conversa com o Constructo Relic
            </h3>
            {onOpenBriefing && (
              <button
                type="button"
                className="cmd-link accent"
                onClick={() => {
                  playKeyclick(soundOn, 860);
                  onOpenBriefing();
                }}
              >
                Resumo Recrutador (30s) ↗
              </button>
            )}
          </div>

          {externalEvent && (
            <p className="relic-external-ping">
              Sinal da estação: {externalEvent}
            </p>
          )}

          <div
            className="relic-stream-log"
            aria-live="polite"
            onClick={() => {
              if (isStreaming && latestEntry) setTypedLen(latestEntry.text.length);
            }}
          >
            {history.map((entry, idx) => {
              const isLatest = idx === history.length - 1;
              const displayedText =
                isLatest && entry.tone === 'construct'
                  ? entry.text.slice(0, typedLen)
                  : entry.text;
              return (
                <div
                  key={entry.id}
                  className={`relic-utterance ${entry.tone} ${isLatest ? 'latest' : 'faded'}`}
                  style={isLatest ? { borderLeftColor: persona.accentVar } : undefined}
                >
                  <span className="utterance-tag">[{entry.speaker}]</span>
                  <p>
                    {displayedText}
                    {isLatest && isStreaming && <span className="relic-cursor" aria-hidden="true" />}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Cyberpunk 2077-Style Horizontal Choice Lines & Open Input */}
        <div className="relic-choices-col">
          <div className="relic-choices-kicker">Pergunte ao constructo ou escolha uma resposta</div>

          <div className="relic-choice-list" role="group" aria-label="Opções de diálogo com o constructo">
            {activeNode.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="relic-choice-line"
                style={{ '--choice-accent': opt.tagColor }}
                onClick={() => handlePickOption(opt)}
              >
                <span className="choice-arrow" aria-hidden="true">▸</span>
                <span className="choice-tag">[{opt.tag}]</span>
                <span className="choice-text">{opt.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSendPrompt} className="relic-prompt-form">
            <label htmlFor="relic-user-input" className="relic-prompt-prefix">
              ncity:~$
            </label>
            <input
              id="relic-user-input"
              type="text"
              className="relic-prompt-input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Pergunte sobre Zetti, AVL, stack, Breach, Samurai, FF:06:B5..."
              spellCheck={false}
            />
            <button type="submit" className="relic-send-link">
              Enviar ↵
            </button>
          </form>

          <div className="relic-quick-topics" aria-label="Tópicos rápidos de lore e engenharia">
            <span>Tópicos:</span>
            {['zetti', 'avl', 'stack', 'breach', 'samurai', 'arasaka', 'ff:06:b5', 'afterlife'].map((topic) => (
              <button
                key={topic}
                type="button"
                className="relic-topic-link"
                onClick={() => handleQuickPrompt(topic)}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slim Hairline Cyberpunk Lore & Aesthetics Codex */}
      <div className="relic-lore-codex">
        <div className="codex-nav-strip" role="group" aria-label="Referências e Estética Cyberpunk">
          <span className="codex-label">Referências Cyberpunk:</span>
          {LORE_CODEX.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === activeLoreId}
              className={`codex-tab-btn ${item.id === activeLoreId ? 'active' : ''}`}
              onClick={() => {
                playKeyclick(soundOn, 700);
                setActiveLoreId(item.id);
              }}
            >
              <span>{item.year}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        <div className="codex-active-readout">
          <span className="codex-source">{activeLore.source}</span>
          <p>{activeLore.body}</p>
        </div>
      </div>
    </div>
  );
}
