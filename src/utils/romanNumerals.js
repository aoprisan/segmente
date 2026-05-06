const ROMAN_PAIRS = [
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const ROMAN_VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100 };

export function toRoman(n) {
  let result = "";
  let rest = n;
  for (const [value, symbol] of ROMAN_PAIRS) {
    while (rest >= value) {
      result += symbol;
      rest -= value;
    }
  }
  return result;
}

export function fromRoman(s) {
  let total = 0;
  for (let i = 0; i < s.length; i += 1) {
    const cur = ROMAN_VALUES[s[i]];
    const next = ROMAN_VALUES[s[i + 1]];
    if (next && next > cur) {
      total += next - cur;
      i += 1;
    } else {
      total += cur;
    }
  }
  return total;
}

function buildSteps(n, roman) {
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  if (tens > 0 && ones > 0) {
    return [
      `${tens} = ${toRoman(tens)}`,
      `${ones} = ${toRoman(ones)}`,
      `${tens} + ${ones} = ${n} → ${roman}`,
    ];
  }
  return [`${n} = ${roman}`];
}

function buildRomanToArabicProblem(n) {
  const roman = toRoman(n);
  return {
    category: "romanToArabic",
    text: "Scrie numărul arab corespunzător.",
    question: `${roman} = ?`,
    answer: n,
    hint: "I = 1, V = 5, X = 10, L = 50, C = 100. Adună de la stânga la dreapta. Dacă o cifră mai mică e înaintea uneia mai mari, scade-o (IV = 4, IX = 9, XL = 40, XC = 90).",
    steps: buildSteps(n, roman),
    segments: [],
    roman,
    arabic: n,
  };
}

function buildArabicToRomanProblem(n) {
  const roman = toRoman(n);
  return {
    category: "arabicToRoman",
    text: "Scrie numărul roman corespunzător.",
    question: `${n} = ?`,
    answer: roman,
    hint: "I = 1, V = 5, X = 10, L = 50, C = 100. Sparge numărul în zeci și unități, apoi scrie fiecare parte cu cifre romane.",
    steps: buildSteps(n, roman),
    segments: [],
    roman,
    arabic: n,
  };
}

export const ROMAN_SESSION_SIZE = 10;

const ROMAN_NUMBER_RANGE = 100;

function pickUniqueNumbers(rng, count) {
  const pool = Array.from({ length: ROMAN_NUMBER_RANGE }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function generateRomanToArabicSession(rng = Math.random) {
  return pickUniqueNumbers(rng, ROMAN_SESSION_SIZE).map(buildRomanToArabicProblem);
}

export function generateArabicToRomanSession(rng = Math.random) {
  return pickUniqueNumbers(rng, ROMAN_SESSION_SIZE).map(buildArabicToRomanProblem);
}
