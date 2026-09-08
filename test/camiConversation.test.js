import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMI_CONVERSATION } from '../src/data/conversations/camiConversation.js';
import { patioWomen } from '../src/data/patioCharacters.js';
import {
  advanceConversationSession,
  applyConversationChoice,
  getConversationBeat,
  resolveBeatPrompt,
} from '../src/systems/conversationFlow.js';
import { canUseCouncil, markCouncilUsed, resolveCouncilAdvice } from '../src/systems/councilSystem.js';
import { createConversationSession, resolveOutcome } from '../src/systems/socialSystem.js';
import { commitConversationOutcome, createGameState } from '../src/state/gameState.js';

function playCami(route) {
  let session = createConversationSession('cami', CAMI_CONVERSATION.initialBeat);
  let presentation = null;

  route.forEach((choiceIndex) => {
    const beat = getConversationBeat(CAMI_CONVERSATION, session.currentBeat);
    const result = applyConversationChoice(session, beat, beat.choices[choiceIndex]);
    session = result.presentation.nextBeat
      ? advanceConversationSession(result.session, result.presentation.nextBeat)
      : result.session;
    presentation = result.presentation;
  });

  return {
    session,
    presentation,
    outcome: route.length === CAMI_CONVERSATION.beats.length
      ? resolveOutcome(session, CAMI_CONVERSATION.outcomeRules)
      : null,
  };
}

function routes(length) {
  if (length === 0) return [[]];
  return routes(length - 1).flatMap((prefix) => [0, 1, 2, 3].map((choice) => [...prefix, choice]));
}

test('Cami reemplaza el prototype con cuatro beats y cuatro opciones, incluyendo Tambu sin filtro', () => {
  assert.strictEqual(patioWomen.find(({ id }) => id === 'cami').conversation, CAMI_CONVERSATION);
  assert.equal(CAMI_CONVERSATION.beats.length, 4);
  CAMI_CONVERSATION.beats.forEach((beat) => {
    assert.equal(beat.choices.length, 4);
    assert.match(beat.choices[3].intent, /^unfiltered-/);
  });
});

test('los prompts de Cami recuerdan la elección anterior y priorizan el sobrejuego', () => {
  const beat2 = getConversationBeat(CAMI_CONVERSATION, 'beat-2');
  const beat3 = getConversationBeat(CAMI_CONVERSATION, 'beat-3');
  const beat4 = getConversationBeat(CAMI_CONVERSATION, 'beat-4');

  assert.match(resolveBeatPrompt(beat2, playCami([0]).session), /explorador/);
  assert.match(resolveBeatPrompt(beat2, playCami([3]).session), /señor seguridad/);
  assert.match(resolveBeatPrompt(beat3, playCami([0, 0]).session), /cuando no me explicás/);
  assert.match(resolveBeatPrompt(beat3, playCami([3, 3]).session), /fuera del personaje/);
  assert.match(resolveBeatPrompt(beat4, playCami([1, 2, 2]).session), /no te voy a explicar otra cosa/);
  assert.match(resolveBeatPrompt(beat4, playCami([3, 3, 3]).session), /Bueno, chamuyero/);
});

test('las opciones Tambu de Cami distinguen química, amistad y sobrejuego', () => {
  assert.equal(playCami([3, 3]).presentation.variantId, 'already-playing-a-character');
  assert.equal(playCami([1, 2, 3]).presentation.variantId, 'positive-flirt');
  assert.match(playCami([1, 2, 3]).session.signals.join('|'), /cami_showed_interest/);
  assert.match(playCami([3, 3, 3]).presentation.variantId, /^overplay-/);
  assert.equal(playCami([1, 2, 0, 3]).presentation.variantId, 'chemistry');
  assert.equal(playCami([0, 1, 1, 3]).presentation.variantId, 'friendship');
  assert.match(playCami([3, 3, 3, 3]).presentation.variantId, /^overplay-/);
});

test('Cami produce rutas representativas y sus cuatro outcomes siguen alcanzables', () => {
  assert.equal(playCami([0, 1, 1, 2]).outcome, 'friendzone');
  assert.equal(playCami([2, 0, 2, 0]).outcome, 'rejection');
  assert.equal(playCami([3, 3, 3, 3]).outcome, 'rejection');
  assert.equal(playCami([1, 2, 3, 1]).outcome, 'bathroom');
  assert.equal(playCami([1, 2, 0, 3]).outcome, 'bathroom');
  assert.equal(playCami([1, 1, 1, 1]).outcome, 'instagram');

  const distribution = routes(4).reduce((counts, route) => {
    const outcome = playCami(route).outcome;
    counts[outcome] = (counts[outcome] ?? 0) + 1;
    return counts;
  }, {});
  ['bathroom', 'instagram', 'friendzone', 'rejection'].forEach((outcome) => {
    assert.ok(distribution[outcome] > 0, outcome);
  });
  assert.ok(distribution.bathroom < distribution.instagram);
});

test('bathroom de Cami exige evidencia narrativa y los outcomes conservan recompensas/evento', () => {
  const statsOnly = {
    characterId: 'cami',
    stats: { attraction: 25, trust: 15, intensity: 10 },
    signals: [], history: [],
  };
  assert.notEqual(resolveOutcome(statsOnly, CAMI_CONVERSATION.outcomeRules), 'bathroom');

  assert.equal(CAMI_CONVERSATION.outcomes.bathroom.reward.points, 500);
  assert.equal(CAMI_CONVERSATION.outcomes.bathroom.event.type, 'bathroom');
  assert.equal(CAMI_CONVERSATION.outcomes.instagram.reward.points, 250);
  assert.equal(CAMI_CONVERSATION.outcomes.friendzone.reward.points, 75);
  assert.equal(CAMI_CONVERSATION.outcomes.rejection.reward.lives, -1);

  const gameState = createGameState();
  const bathroom = playCami([1, 2, 0, 3]);
  assert.equal(commitConversationOutcome(gameState, bathroom.session, CAMI_CONVERSATION.outcomes[bathroom.outcome]), true);
  assert.equal(gameState.relationships.cami.outcome, 'bathroom');
  assert.equal(gameState.player.points, 500);
});

test('el Consejo de Cami prioriza la última señal, tiene reacción y permanece one-use', () => {
  const literal = playCami([1, 0]).session;
  const [pitity, eze, tobi] = CAMI_CONVERSATION.council.members;
  assert.equal(canUseCouncil(literal, 1, CAMI_CONVERSATION.council), true);

  for (const member of [pitity, eze, tobi]) {
    const advice = resolveCouncilAdvice(literal, member);
    assert.equal(advice.ruleId, `${member.id}-cami-literal`);
    assert.equal(typeof advice.tambuReaction, 'string');
    assert.ok(advice.tambuReaction.length > 0);
  }

  const used = markCouncilUsed(literal, resolveCouncilAdvice(literal, pitity));
  assert.equal(canUseCouncil(used, 2, CAMI_CONVERSATION.council), false);
  assert.strictEqual(markCouncilUsed(used, resolveCouncilAdvice(used, pitity)), used);
  assert.deepEqual(used.stats, literal.stats);
  assert.deepEqual(used.signals, literal.signals);
  assert.deepEqual(used.history, literal.history);
});

test('todas las líneas de Consejo incorporadas para Cami tienen reacción de Tambu', () => {
  for (const member of CAMI_CONVERSATION.council.members) {
    const lines = [...member.rules.flatMap((rule) => rule.lines), ...member.fallbackLines];
    lines.forEach((line) => assert.ok(line.tambuReaction, `${member.id}:${line.id}`));
  }
});
