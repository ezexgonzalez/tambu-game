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
  };

  gameState.player.points += outcome.reward.points;
  gameState.player.lives = Math.max(0, gameState.player.lives + outcome.reward.lives);
  return true;
}
