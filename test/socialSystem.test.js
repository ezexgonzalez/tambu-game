import test from 'node:test';
import assert from 'node:assert/strict';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import {
  advanceConversationSession,
  applyConversationChoice,
  getConversationBeat,
  resolveBeatPrompt,
} from '../src/systems/conversationFlow.js';
import {
  canUseCouncil,
  createCouncilSnapshot,
  markCouncilUsed,
  resolveCouncilAdvice,
  selectCouncilLine,
} from '../src/systems/councilSystem.js';
import {
  applySocialEffects,
  createConversationSession,
  resolveOutcome,
} from '../src/systems/socialSystem.js';
import { resolveSocialSituation } from '../src/systems/socialSituation.js';
import { commitConversationOutcome, createGameState } from '../src/state/gameState.js';

function playRoute(route) {
  let session = createConversationSession('sofi', SOFI_CONVERSATION.initialBeat);
  let lastPresentation = null;

  route.forEach((choiceIndex) => {
    const beat = getConversationBeat(SOFI_CONVERSATION, session.currentBeat);
    const result = applyConversationChoice(session, beat, beat.choices[choiceIndex]);
    session = result.session;
    lastPresentation = result.presentation;
    if (result.presentation.nextBeat) {
      session = advanceConversationSession(session, result.presentation.nextBeat);
    }
  });

  return {
    session,
    presentation: lastPresentation,
    outcome: route.length === SOFI_CONVERSATION.beats.length
      ? resolveOutcome(session, SOFI_CONVERSATION.outcomeRules)
      : null,
  };
}

function enumerateRoutes() {
  const routes = [];
  for (let encodedRoute = 0; encodedRoute < 256; encodedRoute += 1) {
    let remainder = encodedRoute;
    const route = [0, 0, 0, 0];
    for (let beatIndex = 3; beatIndex >= 0; beatIndex -= 1) {
      route[beatIndex] = remainder % 4;
      remainder = Math.floor(remainder / 4);
    }
    routes.push({ route, ...playRoute(route) });
  }
  return routes;
}

test('aplica efectos sin mutar las estadísticas anteriores', () => {
  const initial = { attraction: 4, trust: 5, intensity: 1 };
  const updated = applySocialEffects(initial, { attraction: 3, trust: 2, intensity: 4 });

  assert.deepEqual(updated, { attraction: 7, trust: 7, intensity: 5 });
  assert.deepEqual(initial, { attraction: 4, trust: 5, intensity: 1 });
});

test('la sesión comienza con beat, history, signals y Consejo limpios', () => {
  assert.deepEqual(createConversationSession('sofi', 'beat-1'), {
    characterId: 'sofi',
    currentBeat: 'beat-1',
    stats: { attraction: 0, trust: 0, intensity: 0 },
    history: [],
    signals: [],
    councilUsed: false,
    councilLineHistory: [],
  });
});

test('cada elección registra historial y señales semánticas', () => {
  const { session } = playRoute([3]);

  assert.equal(session.history.length, 1);
  assert.deepEqual(
    {
      beatId: session.history[0].beatId,
      choiceId: session.history[0].choiceId,
      intent: session.history[0].intent,
    },
    { beatId: 'beat-1', choiceId: 'papi', intent: 'unfiltered-humor' },
  );
  assert.ok(session.signals.includes('sofi_played_along_with_papi'));
  assert.deepEqual(session.history[0].statsBefore, {
    attraction: 0,
    trust: 0,
    intensity: 0,
  });
});

test('la lectura objetiva detecta una conversación temprana', () => {
  const situation = resolveSocialSituation(playRoute([0]).session);
  assert.ok(situation.tags.includes('early_conversation'));
});

test('la lectura objetiva detecta riesgo de friendzone', () => {
  const situation = resolveSocialSituation(playRoute([2, 1, 2]).session);
  assert.equal(situation.primary, 'friendzone_risk');
  assert.ok(situation.tags.includes('comfortable_but_low_romantic_intent'));
});

test('la lectura objetiva detecta intensidad excesiva', () => {
  const situation = resolveSocialSituation(playRoute([3, 3, 1]).session);
  assert.equal(situation.primary, 'too_intense');
});

test('la lectura objetiva reconoce cuando Sofi devolvió el juego', () => {
  const situation = resolveSocialSituation(playRoute([1, 2]).session);
  assert.ok(situation.tags.includes('returned_flirt'));
  assert.equal(situation.evidence.returnedFlirt, true);
});

test('Sofi V5 contiene cuatro beats de cuatro opciones', () => {
  assert.equal(SOFI_CONVERSATION.beats.length, 4);
  SOFI_CONVERSATION.beats.forEach((beat) => assert.equal(beat.choices.length, 4));
  assert.equal(
    SOFI_CONVERSATION.beats[0].choices[3].text,
    'Sí, soy yo, te habla papi.',
  );
});

test('los cuatro puentes del Beat 2 llegan de manera diferente a Psicopedagogía', () => {
  const beat = SOFI_CONVERSATION.beats[1];
  const bridges = beat.choices.map((choice) => choice.bridge.map(({ text }) => text).join(' '));

  assert.equal(new Set(bridges).size, 4);
  bridges.forEach((bridge) => assert.match(bridge, /Licenciado en Psicopedagogía/));
  assert.ok(bridges.every((bridge) => !bridge.includes('tesis')));
  assert.ok(bridges.every((bridge) => !bridge.includes('terminando Psicopedagogía')));
});

test('el prompt del Beat 4 reconoce la elección del Beat 3', () => {
  const beat4 = SOFI_CONVERSATION.beats[3];
  const direct = playRoute([0, 0, 1]).session;
  const vulnerable = playRoute([0, 0, 2]).session;
  const diagnosis = playRoute([0, 0, 3]).session;

  assert.match(resolveBeatPrompt(beat4, direct), /te la hago fácil/);
  assert.match(resolveBeatPrompt(beat4, vulnerable), /pensando de más/);
  assert.match(resolveBeatPrompt(beat4, diagnosis), /señor profesional/);
});

test('la opción del plan de chapar funciona cuando ya había química', () => {
  const result = playRoute([0, 2, 1, 3]);

  assert.equal(result.presentation.variantId, 'chemistry');
  assert.ok(result.session.signals.includes('sofi_played_along_with_kiss_plan'));
  assert.equal(result.outcome, 'date');
});

test('la misma opción cae rara cuando la charla venía amistosa', () => {
  const result = playRoute([2, 1, 2, 3]);

  assert.equal(result.presentation.variantId, 'friendship-misread');
  assert.ok(result.session.signals.includes('sofi_saw_friendship_misread'));
  assert.equal(result.outcome, 'rejection');
});

test('la misma opción provoca rechazo cuando Tambu ya venía intenso', () => {
  const result = playRoute([3, 3, 1, 3]);

  assert.equal(result.presentation.variantId, 'too-intense');
  assert.ok(result.session.signals.includes('sofi_rejected_blunt_kiss_plan'));
  assert.equal(result.outcome, 'rejection');
});

test('resuelve los cuatro outcomes con rutas narrativamente distintas', () => {
  assert.equal(playRoute([0, 0, 1, 0]).outcome, 'date');
  assert.equal(playRoute([0, 0, 1, 2]).outcome, 'instagram');
  assert.equal(playRoute([0, 0, 0, 2]).outcome, 'friendzone');
  assert.equal(playRoute([0, 0, 0, 0]).outcome, 'rejection');
});

test('Pitity usa Optimus solo con señal fuerte, progreso alto e historial suficiente', () => {
  const pitity = SOFI_CONVERSATION.council.members[0];
  const strongSession = playRoute([1, 2, 1]).session;
  const earlyReturnedFlirt = playRoute([1, 2]).session;

  assert.equal(resolveCouncilAdvice(strongSession, pitity).text, 'Optimus.');
  assert.equal(resolveCouncilAdvice(earlyReturnedFlirt, pitity).text, 'Parece bastante EZ.');
});

test('Pitity detecta el riesgo de friendzone sin explicar estadísticas', () => {
  const pitity = SOFI_CONVERSATION.council.members[0];
  const advice = resolveCouncilAdvice(playRoute([2, 1, 2]).session, pitity);

  assert.equal(advice.text, 'Y la verdad que está bastante hard.');
  assert.doesNotMatch(advice.text, /attraction|trust|intensity|\d/i);
});

test('Eze puede reconocer la señal concreta de papi', () => {
  const eze = SOFI_CONVERSATION.council.members[1];
  const advice = resolveCouncilAdvice(playRoute([3]).session, eze);

  assert.equal(advice.text, 'Lo de papi funcionó de pedo. No abuses.');
});

test('Tobi frena a Tambu cuando ya se está pasando', () => {
  const tobi = SOFI_CONVERSATION.council.members[2];
  const advice = resolveCouncilAdvice(playRoute([3, 3, 1]).session, tobi);

  assert.match(advice.text, /Nao, nao|Callate/);
  assert.notEqual(advice.text, 'Nao, nao...');
});

test('una regla con varias líneas varía de forma determinística según el contexto', () => {
  const lines = [
    { id: 'one', text: 'Primera' },
    { id: 'two', text: 'Segunda' },
    { id: 'three', text: 'Tercera' },
  ];
  const selections = new Set(
    Array.from({ length: 12 }, (_, index) => (
      selectCouncilLine(lines, `context-${index}`).id
    )),
  );

  assert.ok(selections.size > 1);
  assert.ok([...selections].some((id) => id !== 'one'));
  assert.equal(
    selectCouncilLine(lines, 'same-context').id,
    selectCouncilLine(lines, 'same-context').id,
  );
});

test('la prioridad de reglas se resuelve antes de variar el pool', () => {
  const eze = SOFI_CONVERSATION.council.members[1];
  const advice = resolveCouncilAdvice(playRoute([3, 2, 1]).session, eze);

  assert.equal(advice.ruleId, 'eze-intense');
  assert.match(advice.text, /Bajá un cambio|no sigas empujando/i);
});

test('ningún consejero revela stats ni indica una opción correcta', () => {
  const allLines = SOFI_CONVERSATION.council.members.flatMap((member) => [
    ...member.rules.flatMap((rule) => rule.lines),
    ...member.fallbackLines,
  ]);

  allLines.forEach(({ text }) => {
    assert.doesNotMatch(text, /attraction|trust|intensity|elegí|opción\s*[1-4]/i);
  });
});

test('la selección de línea evita repetir IDs recientes', () => {
  const eze = SOFI_CONVERSATION.council.members[1];
  const session = playRoute([1, 2]).session;
  session.councilLineHistory = ['eze-flirt-1'];

  const advice = resolveCouncilAdvice(session, eze);
  assert.notEqual(advice.id, 'eze-flirt-1');
  assert.ok(['eze-flirt-2', 'eze-flirt-3'].includes(advice.id));
});

test('El Consejo recibe un snapshot independiente y no modifica stats', () => {
  const original = playRoute([1, 2]).session;
  const statsBefore = { ...original.stats };
  const snapshot = createCouncilSnapshot(original);
  snapshot.stats.attraction = 999;

  assert.deepEqual(original.stats, statsBefore);
  assert.notEqual(snapshot.stats.attraction, original.stats.attraction);
});

test('El Consejo solo puede consumirse una vez y recién desde Beat 2', () => {
  const config = SOFI_CONVERSATION.council;
  const eze = config.members[1];
  const atBeat1 = createConversationSession('sofi', 'beat-1');
  const atBeat2 = playRoute([3]).session;
  const advice = resolveCouncilAdvice(atBeat2, eze);
  const used = markCouncilUsed(atBeat2, advice);
  const secondAttempt = markCouncilUsed(used, advice);

  assert.equal(canUseCouncil(atBeat1, 0, config), false);
  assert.equal(canUseCouncil(atBeat2, 1, config), true);
  assert.equal(canUseCouncil(used, 1, config), false);
  assert.strictEqual(secondAttempt, used);
  assert.deepEqual(used.stats, atBeat2.stats);
});

test('las 256 rutas quedan balanceadas y todos los outcomes son alcanzables', () => {
  const routes = enumerateRoutes();
  const distribution = routes.reduce((counts, { outcome }) => ({
    ...counts,
    [outcome]: (counts[outcome] ?? 0) + 1,
  }), {});
  const range = (stat) => [
    Math.min(...routes.map(({ session }) => session.stats[stat])),
    Math.max(...routes.map(({ session }) => session.stats[stat])),
  ];

  assert.equal(routes.length, 256);
  assert.deepEqual(distribution, {
    rejection: 73,
    friendzone: 41,
    date: 54,
    instagram: 88,
  });
  assert.deepEqual({
    attraction: range('attraction'),
    trust: range('trust'),
    intensity: range('intensity'),
  }, {
    attraction: [9, 26],
    trust: [2, 27],
    intensity: [2, 26],
  });
});

test('ninguna opción individual determina por sí sola el outcome', () => {
  const routes = enumerateRoutes();

  for (let beatIndex = 0; beatIndex < 4; beatIndex += 1) {
    for (let choiceIndex = 0; choiceIndex < 4; choiceIndex += 1) {
      const outcomes = new Set(
        routes
          .filter(({ route }) => route[beatIndex] === choiceIndex)
          .map(({ outcome }) => outcome),
      );
      assert.ok(outcomes.size > 1);
    }
  }
});

test('el outcome persiste stats, historia y señales una sola vez', () => {
  const gameState = createGameState();
  const result = playRoute([0, 0, 1, 0]);
  const outcome = SOFI_CONVERSATION.outcomes[result.outcome];

  assert.equal(commitConversationOutcome(gameState, result.session, outcome), true);
  assert.equal(commitConversationOutcome(gameState, result.session, outcome), false);
  assert.equal(gameState.player.points, 500);
  assert.equal(gameState.relationships.sofi.history.length, 4);
  assert.ok(gameState.relationships.sofi.signals.includes('tambu_showed_romantic_intent'));
  assert.equal(gameState.relationships.sofi.outcome, 'date');
});

test('las vidas nunca bajan de cero', () => {
  const gameState = createGameState();
  gameState.player.lives = 0;
  const result = playRoute([3, 3, 1, 3]);

  commitConversationOutcome(
    gameState,
    result.session,
    SOFI_CONVERSATION.outcomes.rejection,
  );

  assert.equal(gameState.player.lives, 0);
});
