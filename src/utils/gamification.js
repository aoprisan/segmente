const STORAGE_KEY = "segmente-progress-v1";

export const CATEGORY_LABELS = {
  suma: "Suma segmentelor",
  diferenta: "Diferența segmentelor",
  dublu: "Dublu / Jumătate",
  mixt: "Probleme mixte",
  tabla: "Tabla înmulțirii",
  ordinea: "Ordinea operațiilor",
  romanToArabic: "Numere romane → arabe",
  arabicToRoman: "Numere arabe → romane",
};

const CATEGORY_IDS = Object.keys(CATEGORY_LABELS);

const ACHIEVEMENT_DEFINITIONS = {
  no_hints: {
    id: "no_hints",
    title: "Fără indicii",
    description: "Ai terminat runda fără să folosești niciun indiciu.",
  },
  streak_3: {
    id: "streak_3",
    title: "3 corecte la rând",
    description: "Ai păstrat un șir de trei răspunsuri corecte consecutive.",
  },
  perfect_suma: {
    id: "perfect_suma",
    title: "Perfect la sumă",
    description: "Ai rezolvat perfect o rundă din categoria Suma segmentelor.",
  },
  perfect_diferenta: {
    id: "perfect_diferenta",
    title: "Perfect la diferență",
    description: "Ai rezolvat perfect o rundă din categoria Diferența segmentelor.",
  },
  perfect_dublu: {
    id: "perfect_dublu",
    title: "Perfect la dublu",
    description: "Ai rezolvat perfect o rundă din categoria Dublu / Jumătate.",
  },
  perfect_mixt: {
    id: "perfect_mixt",
    title: "Perfect la mixt",
    description: "Ai rezolvat perfect o rundă din categoria Probleme mixte.",
  },
  perfect_tabla: {
    id: "perfect_tabla",
    title: "Maestru al tablei",
    description: "Ai răspuns corect la toate cele 10 înmulțiri.",
  },
  perfect_ordinea: {
    id: "perfect_ordinea",
    title: "Stăpân al ordinii",
    description: "Ai rezolvat corect toate cele 10 probleme cu ordinea operațiilor.",
  },
  perfect_romanToArabic: {
    id: "perfect_romanToArabic",
    title: "Cititor de cifre romane",
    description: "Ai citit corect toate cele 10 numere romane.",
  },
  perfect_arabicToRoman: {
    id: "perfect_arabicToRoman",
    title: "Scrib roman",
    description: "Ai scris corect toate cele 10 numere cu cifre romane.",
  },
};

export const TOTAL_BADGES = Object.keys(ACHIEVEMENT_DEFINITIONS).length;

function createCategoryBestStars() {
  return CATEGORY_IDS.reduce((acc, categoryId) => {
    acc[categoryId] = 0;
    return acc;
  }, {});
}

function createCategoryStats() {
  return CATEGORY_IDS.reduce((acc, categoryId) => {
    acc[categoryId] = { problems: 0, correct: 0, sessions: 0, elapsedMs: 0 };
    return acc;
  }, {});
}

export function createEmptyStats() {
  return {
    totalProblems: 0,
    totalCorrect: 0,
    totalHintsUsed: 0,
    totalElapsedMs: 0,
    firstPlayedAt: null,
    lastPlayedDate: null,
    currentStreak: 0,
    longestStreak: 0,
    daysActive: {},
    perCategory: createCategoryStats(),
    recentSessions: [],
  };
}

export function createEmptyProgress() {
  return {
    totalStars: 0,
    sessionsPlayed: 0,
    bestStreak: 0,
    badges: [],
    categoryBestStars: createCategoryBestStars(),
    dailyChallengeHistory: {},
    stats: createEmptyStats(),
  };
}

function toCount(value) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function sanitizeCategoryBestStars(raw) {
  const base = createCategoryBestStars();

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }

  CATEGORY_IDS.forEach((categoryId) => {
    base[categoryId] = toCount(raw[categoryId]);
  });

  return base;
}

const RECENT_SESSIONS_LIMIT = 10;

const SESSION_MODES = new Set(["standard", "daily"]);

function toTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}

function isValidDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitizeDaysActive(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return Object.keys(raw).reduce((acc, key) => {
    if (isValidDateKey(key) && raw[key]) {
      acc[key] = true;
    }
    return acc;
  }, {});
}

function sanitizeCategoryStats(raw) {
  const base = createCategoryStats();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }
  CATEGORY_IDS.forEach((categoryId) => {
    const entry = raw[categoryId];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return;
    }
    const problems = toCount(entry.problems);
    base[categoryId] = {
      problems,
      correct: Math.min(toCount(entry.correct), problems),
      sessions: toCount(entry.sessions),
      elapsedMs: toCount(entry.elapsedMs),
    };
  });
  return base;
}

function sanitizeRecentSession(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const total = toCount(raw.total);
  if (total <= 0 || !CATEGORY_LABELS[raw.category]) {
    return null;
  }
  const completedAt = toTimestamp(raw.completedAt);
  if (!completedAt) {
    return null;
  }
  return {
    completedAt,
    category: raw.category,
    mode: SESSION_MODES.has(raw.mode) ? raw.mode : "standard",
    score: Math.min(toCount(raw.score), total),
    total,
    hintsUsed: toCount(raw.hintsUsed),
    bestStreak: toCount(raw.bestStreak),
    elapsedMs: toCount(raw.elapsedMs),
    stars: Math.min(toCount(raw.stars), 3),
  };
}

function sanitizeRecentSessions(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(sanitizeRecentSession)
    .filter(Boolean)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, RECENT_SESSIONS_LIMIT);
}

function sanitizeStats(raw) {
  const defaults = createEmptyStats();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }
  const totalProblems = toCount(raw.totalProblems);
  return {
    totalProblems,
    totalCorrect: Math.min(toCount(raw.totalCorrect), totalProblems),
    totalHintsUsed: toCount(raw.totalHintsUsed),
    totalElapsedMs: toCount(raw.totalElapsedMs),
    firstPlayedAt: toTimestamp(raw.firstPlayedAt),
    lastPlayedDate: isValidDateKey(raw.lastPlayedDate) ? raw.lastPlayedDate : null,
    currentStreak: toCount(raw.currentStreak),
    longestStreak: toCount(raw.longestStreak),
    daysActive: sanitizeDaysActive(raw.daysActive),
    perCategory: sanitizeCategoryStats(raw.perCategory),
    recentSessions: sanitizeRecentSessions(raw.recentSessions),
  };
}

function sanitizeDailyChallengeHistory(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return Object.entries(raw).reduce((acc, [challengeId, entry]) => {
    if (!challengeId || !entry || typeof entry !== "object" || Array.isArray(entry)) {
      return acc;
    }

    acc[challengeId] = {
      completedAt: toCount(entry.completedAt),
      stars: toCount(entry.stars),
      bonus: toCount(entry.bonus),
    };
    return acc;
  }, {});
}

function sanitizeProgress(raw) {
  const defaults = createEmptyProgress();

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaults;
  }

  return {
    totalStars: toCount(raw.totalStars),
    sessionsPlayed: toCount(raw.sessionsPlayed),
    bestStreak: toCount(raw.bestStreak),
    badges: Array.from(
      new Set(
        (Array.isArray(raw.badges) ? raw.badges : []).filter(
          (badgeId) => ACHIEVEMENT_DEFINITIONS[badgeId],
        ),
      ),
    ),
    categoryBestStars: sanitizeCategoryBestStars(raw.categoryBestStars),
    dailyChallengeHistory: sanitizeDailyChallengeHistory(raw.dailyChallengeHistory),
    stats: sanitizeStats(raw.stats),
  };
}

function yesterdayKey(todayKey) {
  if (!isValidDateKey(todayKey)) {
    return null;
  }
  const [year, month, day] = todayKey.split("-").map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadProgress() {
  if (typeof window === "undefined") {
    return createEmptyProgress();
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return createEmptyProgress();
    }
    return sanitizeProgress(JSON.parse(rawValue));
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage write failures and keep the game playable.
  }
}

export function getTodayChallengeKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDailyChallengeComplete(progress, challengeId) {
  return Boolean(progress?.dailyChallengeHistory?.[challengeId]);
}

export function calculateStars({ score, total, hintsUsed }) {
  const ratio = total > 0 ? score / total : 0;

  if (score === total && hintsUsed === 0) {
    return 3;
  }

  if (score === total || ratio >= 0.8) {
    return 2;
  }

  if (ratio >= 0.6) {
    return 1;
  }

  return 0;
}

export function getSessionAchievements({ score, total, hintsUsed, bestStreak, category }) {
  const achievements = [];

  if (hintsUsed === 0) {
    achievements.push("no_hints");
  }

  if (bestStreak >= 3) {
    achievements.push("streak_3");
  }

  if (score === total && CATEGORY_LABELS[category]) {
    achievements.push(`perfect_${category}`);
  }

  return achievements;
}

export function buildSessionResult({
  score,
  total,
  hintsUsed,
  bestStreak,
  category,
  mode = "standard",
  sessionId = null,
  sessionLabel = null,
  elapsedMs = null,
  timedOut = false,
}) {
  const stars = calculateStars({ score, total, hintsUsed });
  return {
    score,
    total,
    wrong: total - score,
    hintsUsed,
    bestStreak,
    stars,
    category,
    mode,
    sessionId,
    sessionLabel,
    elapsedMs,
    timedOut,
    achievements: getSessionAchievements({
      score,
      total,
      hintsUsed,
      bestStreak,
      category,
    }),
  };
}

export function getAchievementDetails(achievementIds = []) {
  return achievementIds
    .map((achievementId) => ACHIEVEMENT_DEFINITIONS[achievementId] || null)
    .filter(Boolean);
}

export function applySessionProgress(progress, sessionResult) {
  const nextProgress = sanitizeProgress(progress);
  const nextBadges = new Set(nextProgress.badges);
  const newlyUnlockedIds = [];

  nextProgress.sessionsPlayed += 1;
  nextProgress.totalStars += sessionResult.stars;
  nextProgress.bestStreak = Math.max(nextProgress.bestStreak, sessionResult.bestStreak);
  nextProgress.categoryBestStars[sessionResult.category] = Math.max(
    nextProgress.categoryBestStars[sessionResult.category] || 0,
    sessionResult.stars,
  );

  sessionResult.achievements.forEach((achievementId) => {
    if (!ACHIEVEMENT_DEFINITIONS[achievementId] || nextBadges.has(achievementId)) {
      return;
    }
    nextBadges.add(achievementId);
    newlyUnlockedIds.push(achievementId);
  });

  let dailyBonusAwarded = false;

  if (sessionResult.mode === "daily" && sessionResult.sessionId) {
    if (!nextProgress.dailyChallengeHistory[sessionResult.sessionId]) {
      nextProgress.dailyChallengeHistory[sessionResult.sessionId] = {
        completedAt: Date.now(),
        stars: sessionResult.stars,
        bonus: 1,
      };
      nextProgress.totalStars += 1;
      dailyBonusAwarded = true;
    } else {
      const previousEntry = nextProgress.dailyChallengeHistory[sessionResult.sessionId];
      nextProgress.dailyChallengeHistory[sessionResult.sessionId] = {
        completedAt: previousEntry.completedAt || Date.now(),
        stars: Math.max(previousEntry.stars || 0, sessionResult.stars),
        bonus: previousEntry.bonus || 0,
      };
    }
  }

  nextProgress.badges = Array.from(nextBadges);

  const stats = nextProgress.stats;
  const sessionScore = toCount(sessionResult.score);
  const sessionTotal = toCount(sessionResult.total);
  const sessionHints = toCount(sessionResult.hintsUsed);
  const sessionElapsed = toCount(sessionResult.elapsedMs);
  const completedAt = Date.now();

  stats.totalProblems += sessionTotal;
  stats.totalCorrect += sessionScore;
  stats.totalHintsUsed += sessionHints;
  stats.totalElapsedMs += sessionElapsed;

  if (CATEGORY_LABELS[sessionResult.category]) {
    const catStats = stats.perCategory[sessionResult.category];
    catStats.problems += sessionTotal;
    catStats.correct += sessionScore;
    catStats.sessions += 1;
    catStats.elapsedMs += sessionElapsed;
  }

  if (!stats.firstPlayedAt) {
    stats.firstPlayedAt = completedAt;
  }

  const today = getTodayChallengeKey();
  if (stats.lastPlayedDate === today) {
    stats.currentStreak = Math.max(stats.currentStreak, 1);
  } else if (stats.lastPlayedDate && stats.lastPlayedDate === yesterdayKey(today)) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }
  stats.lastPlayedDate = today;
  stats.daysActive[today] = true;
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);

  const sessionEntry = {
    completedAt,
    category: sessionResult.category,
    mode: SESSION_MODES.has(sessionResult.mode) ? sessionResult.mode : "standard",
    score: sessionScore,
    total: sessionTotal,
    hintsUsed: sessionHints,
    bestStreak: toCount(sessionResult.bestStreak),
    elapsedMs: sessionElapsed,
    stars: Math.min(toCount(sessionResult.stars), 3),
  };
  stats.recentSessions = [sessionEntry, ...stats.recentSessions].slice(
    0,
    RECENT_SESSIONS_LIMIT,
  );

  return {
    progress: nextProgress,
    dailyBonusAwarded,
    totalStarsAdded: sessionResult.stars + (dailyBonusAwarded ? 1 : 0),
    sessionAchievements: getAchievementDetails(sessionResult.achievements),
    newlyUnlockedBadges: getAchievementDetails(newlyUnlockedIds),
  };
}

export function getOverallAccuracy(stats) {
  if (!stats || !stats.totalProblems) {
    return 0;
  }
  return stats.totalCorrect / stats.totalProblems;
}

export function getDaysActiveCount(stats) {
  if (!stats || !stats.daysActive) {
    return 0;
  }
  return Object.keys(stats.daysActive).length;
}

export function getBestCategory(progress) {
  const categoryBestStars = progress?.categoryBestStars || {};
  let bestCategoryId = null;
  let bestStars = 0;

  CATEGORY_IDS.forEach((categoryId) => {
    const categoryStars = toCount(categoryBestStars[categoryId]);
    if (categoryStars > bestStars) {
      bestCategoryId = categoryId;
      bestStars = categoryStars;
    }
  });

  if (!bestCategoryId) {
    return null;
  }

  return {
    id: bestCategoryId,
    label: CATEGORY_LABELS[bestCategoryId],
    stars: bestStars,
  };
}
