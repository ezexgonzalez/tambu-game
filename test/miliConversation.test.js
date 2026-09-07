import test from 'node:test';
import assert from 'node:assert/strict';
import { MILI_CONVERSATION } from '../src/data/conversations/miliConversation.js';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import {
  advanceConversationSession,
  applyConversationChoice,
  getConversationBeat,
} from '../src/systems/conversationFlow.js';
import { resolveCouncilAdvice } from '../src/systems/councilSystem.js';
import { createConversationSession, resolveOutcome } from '../src/systems/socialSystem.js';
import { commitConversationOutcome, createGameState } from '../src/state/gameState.js';

function playConversation(conversation, characterId, route) {
  let session = createConversationSession(characterId, conversation.initialBeat);
  let presentation = null;

  route.forEach((choiceIndex) => {
    const beat = getConversationBeat(conversation, session.currentBeat);
    const result = applyConversationChoice(session, beat, beat.choices[choiceIndex]);
    session = result.presentation.nextBeat
      ? advanceConversationSession(result.session, result.presentation.nextBeat)
      : result.session;
    presentation = result.presentation;
  });

  return {
    session,
    presentation,
    outcome: route.length === conversation.beats.length
      ? resolveOutcome(session, conversation.outcomeRules)
      : null,
  };
}

function playMili(route) {
  return playConversation(MILI_CONVERSATION, 'mili', route);
}

function routes(length) {
  if (length === 0) return [[]];
  return routes(length - 1).flatMap((prefix) => [0, 1, 2, 3].map((choice) => [...prefix, choice]));
}

test('Mili V1 tiene cuatro beats, cuatro opciones y una opción Tambu contextual por beat', () => {
  assert.equal(MILI_CONVERSATION.beats.length, 4);
  const tambuChoices = ['claim-drink', 'accelerate-chaos', 'you-cant-dance', 'best-material'];

  MILI_CONVERSATION.beats.forEach((beat, index) => {
    assert.equal(beat.choices.length, 4);
    assert.equal(beat.choices[3].id, tambuChoices[index]);
    assert.match(beat.choices[3].intent, /^unfiltered-/);
  });
});

test('Mili aplica efectos y guarda señales de su primer intercambio', () => {
  const result = playMili([0]);

  assert.deepEqual(result.session.stats, { attraction: 5, trust: 4, intensity: 2 });
  assert.ok(result.session.signals.includes('mili_enjoyed_playful_pushback'));
  assert.ok(result.session.signals.includes('mili_trusted_drink_to_tambu'));
});

test('dos opciones Tambu seguidas activan la advertencia contextual de Mili', () => {
  const result = playMili([3, 3]);

  assert.equal(result.presentation.variantId, 'already-accelerated');
  assert.ok(result.session.signals.includes('mili_warned_tambu_to_slow_down'));
  assert.deepEqual(result.session.stats, { attraction: 10, trust: 3, intensity: 12 });
});

test('la burla del Beat 3 responde al contexto intenso o a una advertencia previa', () => {
  const intense = playMili([3, 3, 3]);
  assert.equal(intense.presentation.variantId, 'too-much-teasing-intensity');
  assert.ok(intense.session.signals.includes('mili_disliked_overplay'));

  let session = createConversationSession('mili', 'beat-3');
  session = {
    ...session,
    stats: { attraction: 8, trust: 5, intensity: 6 },
    signals: ['mili_warned_tambu_to_slow_down'],
  };
  const beat = getConversationBeat(MILI_CONVERSATION, 'beat-3');
  const warning = applyConversationChoice(session, beat, beat.choices[3]);
  assert.equal(warning.presentation.variantId, 'too-much-teasing-warning');
});

test('la opción final Tambu distingue química, amistad y overplay', () => {
  assert.equal(playMili([0, 0, 1, 3]).presentation.variantId, 'chemistry');
  assert.equal(playMili([0, 0, 0, 3]).presentation.variantId, 'friendship');
  assert.equal(playMili([3, 3, 3, 3]).presentation.variantId, 'overplayed-intensity');
});

test('las rutas fijadas de Mili dan Bathroom, Friendzone y Rechazo sin ruta Tambu universal', () => {
  assert.equal(playMili([0, 2, 1, 0]).outcome, 'bathroom');
  assert.equal(playMili([1, 0, 2, 2]).outcome, 'friendzone');
  assert.equal(playMili([2, 1, 0, 1]).outcome, 'rejection');
  assert.equal(playMili([3, 3, 3, 3]).outcome, 'rejection');
  assert.equal(playMili([3, 2, 1, 0]).outcome, 'bathroom');
});

test('las 256 rutas de Mili mantienen los cuatro outcomes alcanzables', () => {
  const distribution = {};
  routes(4).forEach((route) => {
    const outcome = playMili(route).outcome;
    distribution[outcome] = (distribution[outcome] ?? 0) + 1;
  });

  assert.deepEqual(distribution, {
    rejection: 97,
    friendzone: 31,
    bathroom: 41,
    instagram: 87,
  });
});

test('Mili conserva sus recompensas y puede resolverse junto a Sofi sin estado cruzado', () => {
  const gameState = createGameState();
  const mili = playMili([0, 2, 1, 0]);
  const sofi = playConversation(SOFI_CONVERSATION, 'sofi', [0, 0, 1, 0]);

  assert.equal(mili.outcome, 'bathroom');
  assert.equal(MILI_CONVERSATION.outcomes.bathroom.reward.points, 500);
  assert.equal(MILI_CONVERSATION.outcomes.rejection.reward.lives, -1);
  assert.equal(MILI_CONVERSATION.outcomes.bathroom.event.type, 'bathroom');
  assert.equal(commitConversationOutcome(gameState, mili.session, MILI_CONVERSATION.outcomes[mili.outcome]), true);
  assert.equal(gameState.relationships.sofi, undefined);
  assert.equal(commitConversationOutcome(gameState, sofi.session, SOFI_CONVERSATION.outcomes[sofi.outcome]), true);

  assert.equal(gameState.relationships.mili.outcome, 'bathroom');
  assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
  assert.equal(gameState.player.points, 1000);
});

test('el Consejo de Mili interpreta sus señales sin callbacks narrativos de Sofi', () => {
  for (const route of [1, 2, 3].flatMap(routes)) {
    const session = playMili(route).session;
    for (const member of MILI_CONVERSATION.council.members) {
      const advice = resolveCouncilAdvice(session, member);
      assert.match(advice.ruleId, /mili|pitity-optimus/);
      assert.doesNotMatch(advice.text, /Sofi|papi|selección|diagnóstico/i);
    }
  }
});

test('el Consejo de Sofi conserva su configuración y su distribución social', () => {
  const distribution = {};
  routes(4).forEach((route) => {
    const outcome = playConversation(SOFI_CONVERSATION, 'sofi', route).outcome;
    distribution[outcome] = (distribution[outcome] ?? 0) + 1;
  });
  assert.deepEqual(distribution, {
    rejection: 73,
    friendzone: 41,
    bathroom: 54,
    instagram: 88,
  });
});
