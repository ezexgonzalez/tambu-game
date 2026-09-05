const SOCIAL_STAT_KEYS = ['attraction', 'trust', 'intensity'];

export function createSocialStats(initialStats = {}) {
  return SOCIAL_STAT_KEYS.reduce((stats, key) => ({
    ...stats,
    [key]: initialStats[key] ?? 0,
  }), {});
}

export function createConversationSession(characterId) {
  return {
    characterId,
    roundIndex: 0,
    stats: createSocialStats(),
    councilUsed: false,
  };
}

export function applySocialEffects(stats, effects = {}) {
  return SOCIAL_STAT_KEYS.reduce((nextStats, key) => ({
    ...nextStats,
    [key]: stats[key] + (effects[key] ?? 0),
  }), {});
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

export function resolveOutcome(stats, rules) {
  const match = rules.ordered.find((rule) => matchesSocialConditions(stats, rule.when));
  return match?.outcome ?? rules.fallback;
}

export function resolveContextualAdvice(stats, adviceOptions) {
  return adviceOptions.find((option) => (
    !option.when || matchesSocialConditions(stats, option.when)
  ))?.text ?? '';
}
