import React, { useState, useMemo } from 'react';
import { CONSTRUCT_PERSONAS, LORE_CODEX, PROFILE_DATA } from '../data/portfolioData';
import { playKeyclick, playRelicGlitch } from '../utils/soundEngine';

function generateFreeReply(personaId, query) {
  const q = query.toLowerCase().trim();

  if (q.includes('ff:06') || q.includes('ff06') || q.includes('estátua') || q.includes('estatua')) {
    return personaId === 'dixie'
      ? 'FF:06:B5 é ruído de frequência fora da banda, cowboy. O único hex que segura uma transação na Matrix é lock otimista e índice B-Tree bem calibrado.'
      : 'Johnny-84: Passei décadas vendo netrunner queimar neurônio caçando esse código magenta em Night City. Quer decifrar algo que paga conta? Olha o T-SQL do Miqueias validando CNPJ alfanumérico sem dar deadlock.';
  }
  if (q.includes('arasaka') || q.includes('mikoshi') || q.includes('soulkiller') || q.includes('torre') || q.includes('tower')) {
    return personaId === 'rachel'
      ? 'Arasaka e Tyrell compartilham a mesma ambição: capturar memória em silício. A diferença aqui é que código versionado no Git não escraviza ninguém — ele escala sistemas honestos.'
      : 'Johnny-84: Arasaka trancava mentes dentro de servidores gelados em Mikoshi. Aqui nós abrimos o código no GitHub mesmo — API REST limpa, Swagger documentado e zero caixa preta corporativa.';
  }
  if (q.includes('zetti') || q.includes('sql') || q.includes('vb6') || q.includes('farm') || q.includes('cnpj')) {
    return personaId === 'dixie'
      ? 'Sustentação em produção é onde o gelo fica quente de verdade, cowboy. Desde dez/2025 o Miqueias escreve Views, Stored Procedures e migra regras do CNPJ alfanumérico no SQL Server + VB6 sem derrubar uma filial.'
      : 'Johnny-84: Segura esse dado: dezenas de farmácias dependendo do banco todo dia na Zetti. Ele mete mão em SQL Server, T-SQL, VB6 e reforma tributária sem frescura. Respeito total.';
  }
  if (q.includes('stack') || q.includes('java') || q.includes('c#') || q.includes('.net') || q.includes('node') || q.includes('nest')) {
    return 'Stack principal detectada no barramento: C# / .NET, SQL Server, VB6, Java 17 (Spring Boot 3 + JPA + JavaFX DAO), Node.js (TypeScript, NestJS, Prisma, TypeORM), PostgreSQL, MySQL e Docker.';
  }
  if (q.includes('blackwall') || q.includes('wintermute') || q.includes('ice') || q.includes('neuromancer')) {
    return personaId === 'dixie'
      ? 'Além da Blackwall só tem IA selvagem e ICE preto, cowboy. Se quiser treinar seu deck, pula na Seção 03 e joga Rotação AVL O(log n) direto no núcleo da Wintermute.'
      : 'Johnny-84: A Blackwall só segura enquanto gente competente mantém os protocolos vivos. Vai lá embaixo e testa quebrar a fortaleza Wintermute com Index Seek e Async Pipelines.';
  }
  if (q.includes('afterlife') || q.includes('drink') || q.includes('contratar') || q.includes('vaga') || q.includes('contato') || q.includes('email')) {
    return `Canal direto de recrutamento aberto: ${PROFILE_DATA.email} | WhatsApp Goiânia ${PROFILE_DATA.phoneDisplay} | Bacharelado Engenharia de Software UNIFAN (2027). Pode puxar o currículo PDF logo ali na Seção 04.`;
  }
  if (q.includes('chiba') || q.includes('gibson') || q.includes('case') || q.includes('molly')) {
    return 'Chiba City foi onde Case trocou nervos queimados por um Ono-Sendai Cyberspace 7 emprestado. Este deck usa o mesmo espírito: enxugar o excesso visual e deixar só sinal útil, onda neural e código que compila.';
  }
  if (q.includes('breach') || q.includes('daemon') || q.includes('1c') || q.includes('55') || q.includes('bd')) {
    return personaId === 'dixie'
      ? 'Breach Protocol ativo na Seção 03, cowboy: comece na linha 1 da matriz 5×5 e alterne coluna e linha para enviar DATAMINE_V1, ICEPICK e MASS_VULNERABILITY.'
      : 'Johnny-84: Quer invadir de verdade? Desce na Seção 03 e manda os 3 daemons no Breach Protocol (`1C 55 BD E9 7A FF`) antes do relógio zerar.';
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
      ? 'E aí, cowboy. Fita ROM girando a 640K sem engasgo. Pergunta sobre Zetti, Java AVL, Breach Protocol ou clique numa linha de diálogo.'
      : 'Johnny-84: Fala, choom. A cidade lá fora tá cheia de site igual cheio de caixinha brilhante. Aqui o papo é direto: código em produção, SQL afiado e ZERO enfeite corporativo.';
  }

  return personaId === 'rachel'
    ? `Consulta processada sobre "${query}": Miqueias une base acadêmica sólida em Engenharia de Software (UNIFAN 2027) com experiência prática diária em SQL Server, VB6, C#/.NET, Java 17 e Node.js.`
    : personaId === 'dixie'
    ? `Sinal recebido sobre "${query}", cowboy. Dica rápida: tente perguntar por "zetti", "stack", "breach", "ff:06:b5", "mikoshi" ou "contratar", ou clique nas opções de diálogo acima.`
    : `Johnny-84 sobre "${query}": gostei da curiosidade, samurai. Se quiser resposta na veia, manda um "zetti", "stack", "breach", "samurai", "ff:06:b5" ou "afterlife" — ou usa os tópicos diretos logo acima.`;
}

export default function RelicConstructDialog({
  soundOn,
  unlockSeal,
  onTriggerEffect,
  externalEvent,
}) {
  const [personaId, setPersonaId] = useState('johnny');
  const [nodeId, setNodeId] = useState('start');
  const [relicSync, setRelicSync] = useState(28);
  const [customInput, setCustomInput] = useState('');
  const [glitchTick, setGlitchTick] = useState(0);
  const [history, setHistory] = useState([
    {
      speaker: 'JOHNNY-84',
      text: CONSTRUCT_PERSONAS.johnny.greeting,
      tone: 'construct',
    },
  ]);
  const [activeLoreId, setActiveLoreId] = useState(LORE_CODEX[0].id);

  const persona = CONSTRUCT_PERSONAS[personaId] || CONSTRUCT_PERSONAS.johnny;
  const activeNode = persona.nodes[nodeId] || persona.nodes.start;
  const activeLore = LORE_CODEX.find((item) => item.id === activeLoreId) || LORE_CODEX[0];

  const handleSelectPersona = (nextPersonaId) => {
    const target = CONSTRUCT_PERSONAS[nextPersonaId];
    if (!target) return;
    playRelicGlitch(soundOn);
    setPersonaId(nextPersonaId);
    setNodeId('start');
    setGlitchTick((g) => g + 1);
    setRelicSync((s) => Math.min(100, s + 8));
    unlockSeal('seal_owl');
    setHistory((prev) => [
      ...prev.slice(-2),
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
    setGlitchTick((g) => g + 1);

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
    setHistory((prev) => [
      ...prev.slice(-1),
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
    setGlitchTick((g) => g + 1);

    const reply = generateFreeReply(personaId, trimmed);
    setHistory((prev) => [
      ...prev.slice(-1),
      { speaker: 'VOCÊ', text: trimmed, tone: 'user' },
      { speaker: persona.handle.split(' // ')[0], text: reply, tone: 'construct' },
    ]);
    setCustomInput('');
  };

  const handleQuickPrompt = (keyword) => {
    playKeyclick(soundOn, 760);
    unlockSeal('seal_owl');
    setRelicSync((s) => Math.min(100, s + 10));
    setGlitchTick((g) => g + 1);
    const reply = generateFreeReply(personaId, keyword);
    setHistory((prev) => [
      ...prev.slice(-1),
      { speaker: 'VOCÊ', text: `consulta --topic ${keyword}`, tone: 'user' },
      { speaker: persona.handle.split(' // ')[0], text: reply, tone: 'construct' },
    ]);
  };

  const wavePath = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 36; i++) {
      const x = (i / 36) * 200;
      const amp = 4 + ((relicSync % 24) / 24) * 7;
      const freq = 0.48 + (glitchTick % 3) * 0.14;
      const y = 16 + Math.sin(i * freq + glitchTick) * amp * Math.cos(i * 0.12);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [relicSync, glitchTick]);

  return (
    <section
      id="sec-relic-chat"
      className="space-section wrap relic-construct-section reveal"
      aria-labelledby="relic-heading"
    >
      {/* Borderless Top Rail Header */}
      <div className="relic-top-rail">
        <div className="relic-persona-tabs" role="group" aria-label="Canal do Constructo Neural">
          {Object.values(CONSTRUCT_PERSONAS).map((p, idx) => {
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
                <span className="relic-tab-num">0{idx + 1}</span>
                <span>{p.handle.split(' // ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="relic-sync-telemetry">
          <svg viewBox="0 0 200 32" className="relic-wave-svg" aria-hidden="true">
            <path
              d={wavePath}
              fill="none"
              stroke={persona.accentVar}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <div className="relic-sync-stat">
            <span className="t-nums">SINCRONIA RELIC // {relicSync}%</span>
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
            <span>{persona.handle}</span>
            <span className="meta-sep">·</span>
            <span>{persona.origin}</span>
          </div>

          <h2 id="relic-heading" className="relic-section-title glitch-title" data-text="Diálogo Neural Aberto">
            Diálogo Neural Aberto
          </h2>

          {externalEvent && (
            <p className="relic-external-ping">
              [INTERRUPÇÃO AO VIVO // TELEMETRIA]: {externalEvent}
            </p>
          )}

          <div className="relic-stream-log" aria-live="polite">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className={`relic-utterance ${entry.tone} ${idx === history.length - 1 ? 'latest' : 'faded'}`}
                style={idx === history.length - 1 ? { borderLeftColor: persona.accentVar } : undefined}
              >
                <span className="utterance-tag">[{entry.speaker}]</span>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cyberpunk 2077-Style Horizontal Choice Lines & Open Input */}
        <div className="relic-choices-col">
          <div className="relic-choices-kicker">RESPOSTAS SINÁPTICAS DISPONÍVEIS</div>

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
              V@ono-sendai:~$
            </label>
            <input
              id="relic-user-input"
              type="text"
              className="relic-prompt-input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Pergunte sobre Zetti, stack, Breach, Samurai, FF:06:B5..."
              spellCheck={false}
            />
            <button type="submit" className="relic-send-link">
              Transmitir ↵
            </button>
          </form>

          <div className="relic-quick-topics" aria-label="Tópicos rápidos de lore e engenharia">
            <span>Atalhos:</span>
            {['zetti', 'stack', 'breach', 'samurai', 'arasaka', 'ff:06:b5', 'afterlife'].map((topic) => (
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
          <span className="codex-label">ARQUIVO LORE &amp; REFERÊNCIAS //</span>
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
    </section>
  );
}
