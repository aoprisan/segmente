const STORAGE_KEY = "segmente-progress-v1";

export const CATEGORY_LABELS = {
  suma: "Suma segmentelor",
  diferenta: "Diferența segmentelor",
  dublu: "Dublu / Jumătate",
  mixt: "Probleme mixte",
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
};

export const TOTAL_BADGES = Object.keys(ACHIEVEMENT_DEFINITIONS).length;

function createCategoryBestStars() {
  return CATEGORY_IDS.reduce((acc, categoryId) => {
    acc[categoryId] = 0;
    return acc;
  }, {});
}

export function createEmptyProgress() {
  return {
    totalStars: 0,
    sessionsPlayed: 0,
    bestStreak: 0,
    badges: [],
    categoryBestStars: createCategoryBestStars(),
    dailyChallengeHistory: {},
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
  };
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

  return {
    progress: nextProgress,
    dailyBonusAwarded,
    totalStarsAdded: sessionResult.stars + (dailyBonusAwarded ? 1 : 0),
    sessionAchievements: getAchievementDetails(sessionResult.achievements),
    newlyUnlockedBadges: getAchievementDetails(newlyUnlockedIds),
  };
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
