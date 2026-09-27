import { BATHROOM_RESULT_CONFIG } from '../data/bathroomResultConfig.js';

export function createGameState() {
  return {
    player: {
      lives: 3,
      alcohol: 0,
      points: 0,
    },
    relationships: {},
  };
}

export function isCharacterResolved(gameState, characterId) {
  return gameState.relationships[characterId]?.resolved === true;
}

export function getCharacterOutcome(gameState, characterId) {
  return gameState.relationships[characterId]?.outcome ?? null;
}

export function getBathroomResult(gameState, characterId) {
  return gameState.relationships[characterId]?.bathroomResult ?? null;
}

export function getSecuredBathroomCount(gameState) {
  return Object.values(gameState.relationships)
    .filter((relationship) => (
      relationship.outcome === 'bathroom' && relationship.bathroomResult === 'secured'
    ))
    .length;
}

export function getBathroomAttemptNumber(gameState) {
  const completedAttempts = Object.values(gameState?.relationships ?? {})
    .filter((relationship) => (
      relationship.outcome === 'bathroom'
      && ['secured', 'interrupted'].includes(relationship.bathroomResult)
    ))
    .length;
  return Math.min(3, completedAttempts + 1);
}

export function canStartMainConversation(gameState, characterId) {
  return Boolean(characterId) && !isCharacterResolved(gameState, characterId);
}

export function canStartPostOutcomeInteraction(gameState, characterId) {
  return isCharacterResolved(gameState, characterId)
    && Boolean(getCharacterOutcome(gameState, characterId));
}

// Resolved characters remain physically present and available for short reactions.
export function canInteractWithCharacter(gameState, characterId) {
  return Boolean(gameState && characterId);
}

export function commitConversationOutcome(gameState, session, outcome) {
  if (!canStartMainConversation(gameState, session.characterId)) return false;

  const isBathroom = outcome.id === 'bathroom';
  gameState.relationships[session.characterId] = {
    ...session.stats,
    history: session.history.map((entry) => ({
      beatId: entry.beatId,
      choiceId: entry.choiceId,
      intent: entry.intent,
      variantId: entry.variantId,
      emittedSignals: [...entry.emittedSignals],
    })),
    signals: [...session.signals],
    resolved: true,
    outcome: outcome.id,
    ...(isBathroom ? { bathroomResult: null, rewardSettled: false } : {}),
  };

  if (!isBathroom) {
    gameState.player.points += outcome.reward.points;
    gameState.player.lives = Math.max(0, gameState.player.lives + outcome.reward.lives);
  }
  return true;
}

export function settleBathroomResult(gameState, characterId, result) {
  const relationship = gameState.relationships[characterId];
  const resultConfig = BATHROOM_RESULT_CONFIG[result];
  if (
    relationship?.outcome !== 'bathroom'
    || relationship.rewardSettled === true
    || !resultConfig
  ) return false;

  relationship.bathroomResult = resultConfig.bathroomResult;
  relationship.rewardSettled = true;
  gameState.player.points += resultConfig.points;
  return true;
}
