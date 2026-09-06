import { matchesConversationConditions } from './socialSystem.js';
import { resolveSocialSituation } from './socialSituation.js';

export function createCouncilSnapshot(session) {
  return {
    characterId: session.characterId,
    currentBeat: session.currentBeat,
    stats: { ...session.stats },
    history: session.history.map((entry) => ({ ...entry })),
    signals: [...session.signals],
    situation: resolveSocialSituation(session),
  };
}

export function canUseCouncil(session, beatIndex, councilConfig) {
  return Boolean(
    councilConfig
    && !session.councilUsed
    && beatIndex >= councilConfig.availableFromBeatIndex,
  );
}

function hashContext(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectCouncilLine(lines, contextKey, recentLineIds = []) {
  const availableLines = lines.filter(({ id }) => !recentLineIds.includes(id));
  const candidates = availableLines.length > 0 ? availableLines : lines;
  if (candidates.length === 1) return candidates[0];
  return candidates[hashContext(contextKey) % candidates.length];
}

function createLineContextKey(snapshot, member, matchingRule) {
  const choices = snapshot.history.map(({ beatId, choiceId }) => `${beatId}:${choiceId}`);
  const stats = ['attraction', 'trust', 'intensity']
    .map((stat) => snapshot.stats[stat] ?? 0);

  return [
    snapshot.characterId,
    snapshot.currentBeat,
    member.id,
    matchingRule?.id ?? 'fallback',
    choices.join('|'),
    [...snapshot.signals].sort().join('|'),
    stats.join('|'),
  ].join('::');
}

export function resolveCouncilAdvice(session, member) {
  const snapshot = createCouncilSnapshot(session);
  const matchingRule = [...member.rules]
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))
    .find((rule) => (
      matchesConversationConditions(snapshot, rule.when)
      && (rule.when?.latestSignals ?? []).every((signal) => (
        snapshot.history.at(-1)?.emittedSignals?.includes(signal)
      ))
    ));
  const lines = matchingRule?.lines ?? member.fallbackLines;
  const contextKey = createLineContextKey(snapshot, member, matchingRule);
  const line = selectCouncilLine(lines, contextKey, session.councilLineHistory);

  return {
    ...line,
    advisorId: member.id,
    ruleId: matchingRule?.id ?? 'fallback',
    situation: snapshot.situation,
  };
}

export function markCouncilUsed(session, advice) {
  if (session.councilUsed) return session;
  return {
    ...session,
    councilUsed: true,
    councilLineHistory: [...session.councilLineHistory, advice.id],
  };
}
