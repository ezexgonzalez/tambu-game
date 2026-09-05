import test from 'node:test';
import assert from 'node:assert/strict';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import {
  applySocialEffects,
  createConversationSession,
  resolveContextualAdvice,
  resolveOutcome,
} from '../src/systems/socialSystem.js';
import { commitConversationOutcome, createGameState } from '../src/state/gameState.js';

const { outcomeRules } = SOFI_CONVERSATION;

test('resuelve DATE', () => {
  assert.equal(resolveOutcome({ attraction: 18, trust: 15, intensity: 8 }, outcomeRules), 'date');
});

test('resuelve FRIENDZONE', () => {
  assert.equal(resolveOutcome({ attraction: 5, trust: 22, intensity: 3 }, outcomeRules), 'friendzone');
});

test('resuelve INSTAGRAM', () => {
  assert.equal(resolveOutcome({ attraction: 13, trust: 10, intensity: 5 }, outcomeRules), 'instagram');
});

test('prioriza REJECTION por intensidad', () => {
  assert.equal(resolveOutcome({ attraction: 25, trust: 15, intensity: 24 }, outcomeRules), 'rejection');
});

test('usa REJECTION como fallback', () => {
  assert.equal(resolveOutcome({ attraction: 4, trust: 3, intensity: 2 }, outcomeRules), 'rejection');
});

test('aplica efectos sin mutar las estadísticas anteriores', () => {
  const initial = { attraction: 4, trust: 5, intensity: 0 };
  const updated = applySocialEffects(initial, { attraction: 5, trust: 7, intensity: 1 });

  assert.deepEqual(updated, { attraction: 9, trust: 12, intensity: 1 });
  assert.deepEqual(initial, { attraction: 4, trust: 5, intensity: 0 });
});

test('la sesión temporal comienza limpia', () => {
  assert.deepEqual(createConversationSession('sofi'), {
    characterId: 'sofi',
    roundIndex: 0,
    stats: { attraction: 0, trust: 0, intensity: 0 },
    councilUsed: false,
  });
});

test('el consejo interpreta el estado sin revelar números', () => {
  const pitity = SOFI_CONVERSATION.council.members[0];
  assert.equal(
    resolveContextualAdvice({ attraction: 4, trust: 15, intensity: 2 }, pitity.advice),
    'Está cómoda. No significa todo.',
  );
});

test('el outcome se guarda una sola vez y las vidas no bajan de cero', () => {
  const gameState = createGameState();
  gameState.player.lives = 0;
  const session = {
    characterId: 'sofi',
    stats: { attraction: 4, trust: 3, intensity: 2 },
  };
  const rejection = SOFI_CONVERSATION.outcomes.rejection;

  assert.equal(commitConversationOutcome(gameState, session, rejection), true);
  assert.equal(commitConversationOutcome(gameState, session, rejection), false);
  assert.equal(gameState.player.lives, 0);
  assert.equal(gameState.relationships.sofi.outcome, 'rejection');
});

test('Sofi tiene exactamente tres rondas de cuatro respuestas', () => {
  assert.equal(SOFI_CONVERSATION.rounds.length, 3);
  SOFI_CONVERSATION.rounds.forEach((round) => assert.equal(round.answers.length, 4));
});

test('las rutas de Sofi permiten alcanzar los cuatro outcomes', () => {
  const outcomes = new Set();

  for (let first = 0; first < 4; first += 1) {
    for (let second = 0; second < 4; second += 1) {
      for (let third = 0; third < 4; third += 1) {
        let stats = createConversationSession('sofi').stats;
        [first, second, third].forEach((answerIndex, roundIndex) => {
          stats = applySocialEffects(
            stats,
            SOFI_CONVERSATION.rounds[roundIndex].answers[answerIndex].effects,
          );
        });
        outcomes.add(resolveOutcome(stats, outcomeRules));
      }
    }
  }

  assert.deepEqual([...outcomes].sort(), ['date', 'friendzone', 'instagram', 'rejection']);
});

test('las decisiones quedan temporales hasta confirmar el outcome', () => {
  const gameState = createGameState();
  const session = createConversationSession('sofi');
  const route = [1, 3, 0];

  route.forEach((answerIndex, roundIndex) => {
    session.stats = applySocialEffects(
      session.stats,
      SOFI_CONVERSATION.rounds[roundIndex].answers[answerIndex].effects,
    );
  });

  assert.deepEqual(gameState.relationships, {});
  assert.equal(gameState.player.points, 0);

  const outcomeId = resolveOutcome(session.stats, outcomeRules);
  commitConversationOutcome(gameState, session, SOFI_CONVERSATION.outcomes[outcomeId]);

  assert.equal(outcomeId, 'date');
  assert.equal(gameState.player.points, 500);
  assert.deepEqual(gameState.relationships.sofi, {
    attraction: 17,
    trust: 13,
    intensity: 8,
    resolved: true,
    outcome: 'date',
  });
});
