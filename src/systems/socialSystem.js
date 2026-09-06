import { resolveSocialSituation } from './socialSituation.js';

const SOCIAL_STAT_KEYS = ['attraction', 'trust', 'intensity'];

export function createSocialStats(initialStats = {}) {
  return SOCIAL_STAT_KEYS.reduce((stats, key) => ({
    ...stats,
    [key]: initialStats[key] ?? 0,
  }), {});
}

export function createConversationSession(characterId, initialBeat = 'beat-1') {
  return {
    characterId,
    currentBeat: initialBeat,
    stats: createSocialStats(),
    history: [],
    signals: [],
    councilUsed: false,
    councilLineHistory: [],
  };
}

export function applySocialEffects(stats, effects = {}) {
  return SOCIAL_STAT_KEYS.reduce((nextStats, key) => ({
    ...nextStats,
    [key]: stats[key] + (effects[key] ?? 0),
  }), {});
}

export function combineSocialEffects(...effectsList) {
  return effectsList.reduce((combined, effects = {}) => (
    SOCIAL_STAT_KEYS.reduce((next, key) => ({
      ...next,
      [key]: (next[key] ?? 0) + (effects[key] ?? 0),
    }), combined)
  ), createSocialStats());
}

export function matchesSocialConditions(stats, conditions = {}) {
  return Object.entries(conditions).every(([stat, limits]) => {
    const value = stats[stat] ?? 0;
    if (limits.gte !== undefined && value < limits.gte) return false;
    if (limits.lte !== undefined && value > limits.lte) return false;
    if (limits.gt !== undefined && value <= limits.gt) return false;
    if (limits.lt !== undefined && value >= limits.lt) return false;
    if (limits.eq !== undefined && value !== limits.eq) return false;
    return true;
  });
}

function includesAll(values, expected = []) {
  return expected.every((value) => values.includes(value));
}

function includesAny(values, expected = []) {
  return expected.length === 0 || expected.some((value) => values.includes(value));
}

function includesNone(values, rejected = []) {
  return rejected.every((value) => !values.includes(value));
}

export function matchesConversationConditions(session, conditions = {}) {
  const stats = session.stats ?? session;
  const signals = session.signals ?? [];
  const history = session.history ?? [];
  const situation = session.situation ?? resolveSocialSituation(session);
  const situationTags = situation.tags ?? [];
  const choiceKeys = history.map(({ beatId, choiceId }) => `${beatId}:${choiceId}`);

  if (conditions.stats && !matchesSocialConditions(stats, conditions.stats)) return false;
  if (!includesAll(signals, conditions.allSignals)) return false;
  if (!includesAny(signals, conditions.anySignals)) return false;
  if (!includesNone(signals, conditions.noSignals)) return false;
  if (!includesAll(situationTags, conditions.allSituations)) return false;
  if (!includesAny(situationTags, conditions.anySituations)) return false;
  if (!includesNone(situationTags, conditions.noSituations)) return false;
  if (!includesAll(choiceKeys, conditions.allChoices)) return false;
  if (!includesAny(choiceKeys, conditions.anyChoices)) return false;
  if (!includesNone(choiceKeys, conditions.noChoices)) return false;
  if (
    conditions.historyLength
    && !matchesSocialConditions({ historyLength: history.length }, {
      historyLength: conditions.historyLength,
    })
  ) return false;

  return true;
}

export function resolveOutcome(sessionOrStats, rules) {
  const session = sessionOrStats.stats
    ? sessionOrStats
    : { stats: sessionOrStats, history: [], signals: [] };
  const situation = resolveSocialSituation(session);
  const context = { ...session, situation };
  const match = rules.ordered.find((rule) => (
    matchesConversationConditions(context, rule.when)
  ));
  return match?.outcome ?? rules.fallback;
}
