const LEADERBOARD_KEY = "segmente-tabla-leaderboard-v1";
const PLAYER_NAME_KEY = "segmente-tabla-player-name-v1";

export const LEADERBOARD_MAX_ENTRIES = 10;
const NAME_MAX_LENGTH = 20;

function toCount(value) {
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function sanitizeName(value) {
  if (typeof value !== "string") {
    return "Anonim";
  }
  const trimmed = value.trim().slice(0, NAME_MAX_LENGTH);
  return trimmed || "Anonim";
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const total = toCount(raw.total);
  if (total <= 0) {
    return null;
  }
  return {
    name: sanitizeName(raw.name),
    score: Math.min(toCount(raw.score), total),
    total,
    elapsedMs: toCount(raw.elapsedMs),
    completedAt: toCount(raw.completedAt),
  };
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.elapsedMs !== b.elapsedMs) {
      return a.elapsedMs - b.elapsedMs;
    }
    return a.completedAt - b.completedAt;
  });
}

export function loadLeaderboard() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const cleaned = parsed.map(sanitizeEntry).filter(Boolean);
    return sortEntries(cleaned).slice(0, LEADERBOARD_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry) {
  const nextEntry = sanitizeEntry({
    ...entry,
    completedAt: entry?.completedAt ?? Date.now(),
  });

  if (!nextEntry) {
    return { entries: loadLeaderboard(), rank: null, savedEntry: null };
  }

  const current = loadLeaderboard();
  const merged = sortEntries([...current, nextEntry]).slice(0, LEADERBOARD_MAX_ENTRIES);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(merged));
    } catch {
      // ignore — keep the game playable even if storage is unavailable
    }
  }

  const rankIndex = merged.findIndex(
    (item) =>
      item.name === nextEntry.name &&
      item.score === nextEntry.score &&
      item.elapsedMs === nextEntry.elapsedMs &&
      item.completedAt === nextEntry.completedAt,
  );

  return {
    entries: merged,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    savedEntry: nextEntry,
  };
}

export function loadPlayerName() {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const raw = window.localStorage.getItem(PLAYER_NAME_KEY);
    if (!raw) {
      return "";
    }
    return sanitizeName(raw);
  } catch {
    return "";
  }
}

export function savePlayerName(name) {
  if (typeof window === "undefined") {
    return;
  }
  const cleaned = sanitizeName(name);
  try {
    window.localStorage.setItem(PLAYER_NAME_KEY, cleaned);
  } catch {
    // ignore
  }
}

export function clearPlayerName() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(PLAYER_NAME_KEY);
  } catch {
    // ignore
  }
}

export function formatElapsedTime(elapsedMs) {
  const totalSeconds = Math.max(0, Math.floor((elapsedMs || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
