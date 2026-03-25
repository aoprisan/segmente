const NAMES = [
  ["Ana", "Bogdan"],
  ["Maria", "Costin"],
  ["Elena", "Radu"],
  ["Ioana", "Mihai"],
  ["Daria", "Luca"],
  ["Sara", "Alex"],
  ["Mara", "David"],
  ["Irina", "Andrei"],
  ["Sorina", "Vlad"],
  ["Clara", "Tudor"],
];

const OBJECTS = [
  { name: "o panglică", short: "panglica" },
  { name: "o sfoară", short: "sfoara" },
  { name: "un drum", short: "drumul" },
  { name: "o sârmă", short: "sârma" },
  { name: "un gard", short: "gardul" },
  { name: "o bandă", short: "banda" },
  { name: "o frânghie", short: "frânghia" },
  { name: "un segment", short: "segmentul" },
];

function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function rand(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

function createSeedHash(seedText) {
  let hash = 1779033703 ^ seedText.length;

  for (let i = 0; i < seedText.length; i += 1) {
    hash = Math.imul(hash ^ seedText.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return hash >>> 0;
}

export function createSeededRng(seedInput) {
  let state = createSeedHash(String(seedInput));

  return function seededRandom() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a single problem for the given category.
 * Returns: { text, question, answer, hint, steps, segments[], category }
 *
 * `segments` is an array of { label, length, color } used to draw
 * a reference diagram on the canvas so kids know what to draw.
 */
export function generateProblem(category, rng = Math.random) {
  const [n1, n2] = pick(NAMES, rng);
  const obj = pick(OBJECTS, rng);

  if (category === "mixt") {
    const cats = ["suma", "diferenta", "dublu"];
    return generateProblem(pick(cats, rng), rng);
  }

  if (category === "suma") {
    const a = rand(5, 45, rng);
    const b = rand(5, 40, rng);
    return {
      category: "suma",
      text: `${n1} are ${obj.name} de ${a} cm. ${n2} are ${obj.name} de ${b} cm.`,
      question: `Cât măsoară cele două la un loc?`,
      answer: a + b,
      hint: `Desenează cele două segmente unul după altul și adună lungimile.`,
      steps: [
        `Segmentul lui ${n1} = ${a} cm`,
        `Segmentul lui ${n2} = ${b} cm`,
        `${a} + ${b} = ${a + b} cm`,
      ],
      segments: [
        { label: `${n1}: ${a} cm`, length: a, color: "blue" },
        { label: `${n2}: ${b} cm`, length: b, color: "coral" },
      ],
    };
  }

  if (category === "diferenta") {
    const big = rand(20, 50, rng);
    const small = rand(5, big - 3, rng);
    return {
      category: "diferenta",
      text: `${n1} are ${obj.name} de ${big} cm. ${n2} are ${obj.name} de ${small} cm.`,
      question: `Cu cât este mai lung ${obj.short} lui ${n1} decât al lui ${n2}?`,
      answer: big - small,
      hint: `Desenează ambele segmente și scade pe cel mic din cel mare.`,
      steps: [
        `Segmentul lui ${n1} = ${big} cm`,
        `Segmentul lui ${n2} = ${small} cm`,
        `${big} - ${small} = ${big - small} cm`,
      ],
      segments: [
        { label: `${n1}: ${big} cm`, length: big, color: "coral" },
        { label: `${n2}: ${small} cm`, length: small, color: "amber" },
      ],
    };
  }

  if (category === "dublu") {
    const isDublu = rng() > 0.5;
    if (isDublu) {
      const a = rand(5, 35, rng);
      return {
        category: "dublu",
        text: `${n1} are ${obj.name} de ${a} cm. ${n2} are ${obj.name} de două ori mai lungă.`,
        question: `Cât măsoară ${obj.short} lui ${n2}?`,
        answer: a * 2,
        hint: `Dublul înseamnă × 2. Desenează un segment și apoi încă unul la fel de lung.`,
        steps: [
          `Segmentul lui ${n1} = ${a} cm`,
          `Dublul = ${a} × 2`,
          `= ${a * 2} cm`,
        ],
        segments: [
          { label: `${n1}: ${a} cm`, length: a, color: "teal" },
          { label: `${n2}: ? cm`, length: a * 2, color: "purple" },
        ],
      };
    } else {
      const half = rand(5, 30, rng);
      const full = half * 2;
      return {
        category: "dublu",
        text: `${n1} are ${obj.name} de ${full} cm. ${n2} are jumătate din cât ${n1}.`,
        question: `Cât măsoară ${obj.short} lui ${n2}?`,
        answer: half,
        hint: `Jumătate înseamnă ÷ 2. Împarte segmentul în două părți egale.`,
        steps: [
          `Segmentul lui ${n1} = ${full} cm`,
          `Jumătate = ${full} ÷ 2`,
          `= ${half} cm`,
        ],
        segments: [
          { label: `${n1}: ${full} cm`, length: full, color: "purple" },
          { label: `${n2}: ? cm`, length: half, color: "teal" },
        ],
      };
    }
  }

  // fallback
  return generateProblem("suma", rng);
}

/**
 * Generate a full game session (array of problems).
 */
export function generateSession(category, count = 5, rng = Math.random) {
  return Array.from({ length: count }, () => generateProblem(category, rng));
}
