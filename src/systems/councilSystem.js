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

export function resolveCouncilAdvice(session, member) {
  const snapshot = createCouncilSnapshot(session);
  const matchingRule = [...member.rules]
    .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0))
    .find((rule) => matchesConversationConditions(snapshot, rule.when));
  const lines = matchingRule?.lines ?? member.fallbackLines;
  const line = lines.find(({ id }) => !session.councilLineHistory.includes(id)) ?? lines[0];

  return {
    ...line,
    advisorId: member.id,
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
