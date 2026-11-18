// ============================================================================
// PURE BACKEND ALGORITHM ENGINES (AVL TREE, BST, CPF MOD-11 HASH, CNPJ ALFA)
// 100% deterministic, zero side effects — powers the interactive ROM Lab.
// ============================================================================

function nodeHeight(node) {
  return node ? node.height : 0;
}

function balanceFactor(node) {
  return node ? nodeHeight(node.left) - nodeHeight(node.right) : 0;
}

function makeNode(value, left = null, right = null) {
  return {
    value,
    left,
    right,
    height: 1 + Math.max(nodeHeight(left), nodeHeight(right)),
  };
}

function rotateRight(y) {
  const x = y.left;
  const t2 = x.right;
  const newY = makeNode(y.value, t2, y.right);
  return makeNode(x.value, x.left, newY);
}

function rotateLeft(x) {
  const y = x.right;
  const t2 = y.left;
  const newX = makeNode(x.value, x.left, t2);
  return makeNode(y.value, newX, y.right);
}

/**
 * Pure immutable AVL insertion returning the new root and any rotation executed.
 */
export function insertAvl(root, value) {
  let rotation = null;
  let rotatedAt = null;

  function insert(node) {
    if (!node) return makeNode(value);
    if (value === node.value) return node;

    const next =
      value < node.value
        ? makeNode(node.value, insert(node.left), node.right)
        : makeNode(node.value, node.left, insert(node.right));

    const bf = balanceFactor(next);

    // Left-Left
    if (bf > 1 && value < next.left.value) {
      rotation = 'LL (Rotação Simples à Direita)';
      rotatedAt = next.value;
      return rotateRight(next);
    }
    // Right-Right
    if (bf < -1 && value > next.right.value) {
      rotation = 'RR (Rotação Simples à Esquerda)';
      rotatedAt = next.value;
      return rotateLeft(next);
    }
    // Left-Right
    if (bf > 1 && value > next.left.value) {
      rotation = 'LR (Rotação Dupla Esq → Dir)';
      rotatedAt = next.value;
      const fixedLeft = rotateLeft(next.left);
      return rotateRight(makeNode(next.value, fixedLeft, next.right));
    }
    // Right-Left
    if (bf < -1 && value < next.right.value) {
      rotation = 'RL (Rotação Dupla Dir → Esq)';
      rotatedAt = next.value;
      const fixedRight = rotateRight(next.right);
      return rotateLeft(makeNode(next.value, next.left, fixedRight));
    }
    return next;
  }

  return { root: insert(root), rotation, rotatedAt };
}

/**
 * Pure immutable unbalanced BST insertion for O(n) vs O(log n) comparison.
 */
export function insertBst(root, value) {
  if (!root) return makeNode(value);
  if (value === root.value) return root;
  if (value < root.value) {
    return makeNode(root.value, insertBst(root.left, value), root.right);
  }
  return makeNode(root.value, root.left, insertBst(root.right, value));
}

export function buildTrees(values) {
  let avl = null;
  let bst = null;
  let lastRotation = null;
  let lastRotatedAt = null;
  let rotationCount = 0;

  values.forEach((v) => {
    const res = insertAvl(avl, v);
    avl = res.root;
    if (res.rotation) {
      lastRotation = res.rotation;
      lastRotatedAt = res.rotatedAt;
      rotationCount += 1;
    }
    bst = insertBst(bst, v);
  });

  return {
    avl,
    bst,
    avlHeight: nodeHeight(avl),
    bstHeight: nodeHeight(bst),
    lastRotation,
    lastRotatedAt,
    rotationCount,
  };
}

/**
 * Computes clean SVG coordinates for any binary tree up to depth 6.
 */
export function layoutBinaryTree(root, width = 560, topY = 28, levelStep = 44) {
  const nodes = [];
  const edges = [];

  function walk(node, depth, minX, maxX, parentPos) {
    if (!node || depth > 5) return;
    const x = (minX + maxX) / 2;
    const y = topY + depth * levelStep;
    const bf = balanceFactor(node);
    nodes.push({
      value: node.value,
      x,
      y,
      bf,
      height: node.height,
      depth,
    });
    if (parentPos) {
      edges.push({ x1: parentPos.x, y1: parentPos.y, x2: x, y2: y });
    }
    walk(node.left, depth + 1, minX, x, { x, y });
    walk(node.right, depth + 1, x, maxX, { x, y });
  }

  walk(root, 0, 20, width - 20, null);
  return { nodes, edges };
}

/**
 * Official Brazilian Receita Federal NT 2026 Alphanumeric CNPJ Modulo-11 validator.
 * Uses ASCII(char) - 48 for [0-9A-Z] preserving 100% compatibility with legacy numeric CNPJs.
 */
export function validateCnpjAlfa(rawInput) {
  const clean = (rawInput || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (clean.length !== 14) {
    return {
      valid: false,
      clean,
      reason: `Tamanho inválido (${clean.length}/14 caracteres). THROW 50001 disparado.`,
      expectedDv: null,
      actualDv: null,
      isAlphanumeric: /[A-Z]/.test(clean),
    };
  }

  const base12 = clean.slice(0, 12);
  const actualDv = clean.slice(12);
  if (!/^[0-9]{2}$/.test(actualDv)) {
    return {
      valid: false,
      clean,
      reason: 'Os 2 dígitos verificadores finais devem ser numéricos [0-9]. THROW 50001.',
      expectedDv: null,
      actualDv,
      isAlphanumeric: /[A-Z]/.test(base12),
    };
  }

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum1 = 0;
  for (let i = 0; i < 12; i += 1) {
    sum1 += (base12.charCodeAt(i) - 48) * w1[i];
  }
  const rem1 = sum1 % 11;
  const dv1 = rem1 < 2 ? 0 : 11 - rem1;

  const base13 = `${base12}${dv1}`;
  let sum2 = 0;
  for (let i = 0; i < 13; i += 1) {
    sum2 += (base13.charCodeAt(i) - 48) * w2[i];
  }
  const rem2 = sum2 % 11;
  const dv2 = rem2 < 2 ? 0 : 11 - rem2;

  const expectedDv = `${dv1}${dv2}`;
  const valid = expectedDv === actualDv;

  return {
    valid,
    clean,
    expectedDv,
    actualDv,
    isAlphanumeric: /[A-Z]/.test(base12),
    fixedCnpj: `${base12}${expectedDv}`,
    reason: valid
      ? `Módulo-11 NT 2026 válido (DV=${expectedDv}) · Pronto para UPDATE em dbo.UnidadesFarmacia.`
      : `Dígito verificador divergente: recebido "${actualDv}", esperado "${expectedDv}". THROW 50001.`,
  };
}

/**
 * Official Brazilian CPF Modulo-11 check + deterministic polynomial hash into 11 buckets.
 */
export function analyzeCpfHash(rawCpf, bucketCount = 11) {
  const digits = (rawCpf || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return {
      valid: false,
      digits,
      bucket: null,
      reason: 'CPF precisa de 11 dígitos não repetidos para cálculo Módulo-11.',
    };
  }

  let s1 = 0;
  for (let i = 0; i < 9; i += 1) s1 += Number(digits[i]) * (10 - i);
  const r1 = (s1 * 10) % 11;
  const d1 = r1 === 10 ? 0 : r1;

  let s2 = 0;
  for (let i = 0; i < 10; i += 1) s2 += Number(digits[i]) * (11 - i);
  const r2 = (s2 * 10) % 11;
  const d2 = r2 === 10 ? 0 : r2;

  const valid = d1 === Number(digits[9]) && d2 === Number(digits[10]);

  let hash = 0;
  for (let i = 0; i < digits.length; i += 1) {
    hash = (hash * 31 + digits.charCodeAt(i)) % 1000003;
  }
  const bucket = hash % bucketCount;

  return {
    valid,
    digits,
    expectedDv: `${d1}${d2}`,
    bucket,
    hash,
    reason: valid
      ? `CPF válido (DV ${d1}${d2}) · hash(cpf) % ${bucketCount} → Bucket #${bucket} em O(1).`
      : `DV inválido (esperado ${d1}${d2}) · Inserção bloqueada antes do espalhamento.`,
  };
}
