// ============================================================================
// BREACH PROTOCOL ENGINE — Cyberpunk 2077-style code matrix (pure functions)
// Deterministic seeded generator so puzzles are always solvable & lint-pure.
// ============================================================================

export const BREACH_CODES = ['1C', '55', 'BD', 'E9', '7A', 'FF'];
export const BREACH_SIZE = 5;
export const BREACH_BUFFER = 6;
export const BREACH_TIME = 45; // seconds, starts on first pick

export const DAEMON_BLUEPRINTS = [
  {
    id: 'datamine',
    name: 'DATAMINE_V1',
    skill: 'SQL Server · T-SQL',
    reward: 'Stored Procedures, Views e Index Seek sustentando farmácias em produção na Zetti.',
    slice: [0, 2],
  },
  {
    id: 'icepick',
    name: 'ICEPICK',
    skill: 'C# / .NET · APIs REST',
    reward: 'POO, Entity Framework e Clean Architecture aplicados a serviços REST.',
    slice: [2, 5],
  },
  {
    id: 'massvuln',
    name: 'MASS_VULNERABILITY',
    skill: 'Java 17 · Spring Boot 3 · NestJS',
    reward: 'APIs com JPA, Prisma Transactions e Docker — código aberto no GitHub.',
    slice: [3, 6],
  },
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a 5x5 matrix with a guaranteed 6-step solution path that alternates
 * row → column → row… starting on the first row (official Breach rule).
 */
export function generateBreachPuzzle(seed) {
  const rand = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const path = [];
    const used = new Set();
    let row = 0;
    let col = Math.floor(rand() * BREACH_SIZE);
    path.push([row, col]);
    used.add(`${row}-${col}`);
    let ok = true;

    for (let step = 1; step < BREACH_BUFFER; step += 1) {
      const candidates = [];
      for (let i = 0; i < BREACH_SIZE; i += 1) {
        const r = step % 2 === 1 ? i : row;
        const c = step % 2 === 1 ? col : i;
        if (!used.has(`${r}-${c}`)) candidates.push([r, c]);
      }
      if (candidates.length === 0) {
        ok = false;
        break;
      }
      [row, col] = pick(candidates);
      path.push([row, col]);
      used.add(`${row}-${col}`);
    }
    if (!ok) continue;

    const solution = path.map(() => pick(BREACH_CODES));
    // Avoid trivially repetitive daemons (e.g. "55 55")
    if (solution[0] === solution[1] || solution[2] === solution[3]) continue;

    const matrix = Array.from({ length: BREACH_SIZE }, () =>
      Array.from({ length: BREACH_SIZE }, () => pick(BREACH_CODES))
    );
    path.forEach(([r, c], i) => {
      matrix[r][c] = solution[i];
    });

    const daemons = DAEMON_BLUEPRINTS.map((d) => ({
      ...d,
      sequence: solution.slice(d.slice[0], d.slice[1]),
    }));

    return { seed, matrix, path, daemons };
  }

  // Extremely unlikely fallback: static solvable board
  return generateBreachPuzzle(seed + 7919);
}

/** True when `seq` appears contiguously inside `buffer`. */
export function bufferContains(buffer, seq) {
  if (seq.length > buffer.length) return false;
  for (let i = 0; i <= buffer.length - seq.length; i += 1) {
    let match = true;
    for (let j = 0; j < seq.length; j += 1) {
      if (buffer[i + j] !== seq[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

/** Longest daemon prefix currently matching the tail of the buffer. */
export function daemonProgress(buffer, seq) {
  if (bufferContains(buffer, seq)) return seq.length;
  for (let k = Math.min(seq.length - 1, buffer.length); k > 0; k -= 1) {
    let match = true;
    for (let j = 0; j < k; j += 1) {
      if (buffer[buffer.length - k + j] !== seq[j]) {
        match = false;
        break;
      }
    }
    if (match) return k;
  }
  return 0;
}

/** Active axis for the next pick: row 0 first, then alternating column/row. */
export function activeLine(selection) {
  const len = selection.length;
  if (len === 0) return { axis: 'row', index: 0 };
  const [lastR, lastC] = selection[len - 1];
  return len % 2 === 1 ? { axis: 'col', index: lastC } : { axis: 'row', index: lastR };
}
