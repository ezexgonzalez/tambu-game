import test from 'node:test';
import assert from 'node:assert/strict';
import { SOFI_CONVERSATION as conversation } from '../src/data/conversations/sofiConversation.js';
import { createConversationSession, resolveOutcome } from '../src/systems/socialSystem.js';
import { getConversationBeat, applyConversationChoice, advanceConversationSession } from '../src/systems/conversationFlow.js';
import { resolveCouncilAdvice, canUseCouncil, markCouncilUsed } from '../src/systems/councilSystem.js';

const [pitity, eze, tobi] = conversation.council.members;
function routes(length) {
  if (!length) return [[]];
  return routes(length - 1).flatMap((prefix) => [0, 1, 2, 3].map((choice) => [...prefix, choice]));
}
function play(route, consult = null) {
  let session = createConversationSession('sofi', conversation.initialBeat);
  route.forEach((choice, index) => {
    if (consult && index === consult.beat) {
      assert.equal(canUseCouncil(session, index, conversation.council), true);
      session = markCouncilUsed(session, resolveCouncilAdvice(session, consult.member));
    }
    const beat = getConversationBeat(conversation, session.currentBeat);
    const result = applyConversationChoice(session, beat, beat.choices[choice]);
    session = result.presentation.nextBeat
      ? advanceConversationSession(result.session, result.presentation.nextBeat)
      : result.session;
  });
  return session;
}

test('las cuatro aperturas reciben callbacks propios de los tres amigos', () => {
  const openings = ['mystery', 'marketing', 'genuine', 'papi'];
  for (const member of conversation.council.members) {
    const texts = new Set();
    openings.forEach((opening, index) => {
      const advice = resolveCouncilAdvice(play([index]), member);
      assert.equal(advice.ruleId, `${member.id}-${opening}`);
      assert.doesNotMatch(advice.text, /Optimus|keke|te está dando bola/i);
      texts.add(advice.text);
    });
    assert.equal(texts.size, 4);
  }
  assert.equal(resolveCouncilAdvice(play([3]), eze).text, 'Lo de papi funcionó de pedo. No abuses.');
  assert.match(resolveCouncilAdvice(play([3]), tobi).text, /papi/);
});

test('la devolución de selección tiene tres voces y no dispara keke temprano', () => {
  for (let first = 0; first < 4; first += 1) {
    const session = play([first, 2]);
    assert.equal(resolveCouncilAdvice(session, pitity).text, 'Parece bastante EZ.');
    assert.equal(resolveCouncilAdvice(session, eze).ruleId, 'eze-returned-flirt');
    assert.doesNotMatch(resolveCouncilAdvice(session, eze).text, /keke/);
    assert.equal(resolveCouncilAdvice(session, tobi).ruleId, 'tobi-selective');
  }
});

test('Optimus conserva evidencia narrativa y rareza; hard conserva su texto', () => {
  const late = routes(3).map((route) => play(route));
  const optimus = late.filter((session) => resolveCouncilAdvice(session, pitity).text === 'Optimus.');
  assert.ok(optimus.length > 0 && optimus.length < late.length / 4);
  for (const session of optimus) {
    assert.ok(session.signals.includes('sofi_returned_flirt'));
    assert.notEqual(resolveCouncilAdvice({ ...session, signals: [] }, pitity).text, 'Optimus.');
  }
  assert.equal(resolveCouncilAdvice(play([2, 1, 2]), pitity).text, 'Y la verdad que está bastante hard.');
});

test('callbacks recientes desplazan papi y flirt acumulados', () => {
  for (const member of [eze, tobi]) {
    const report = play([3, 3]);
    assert.ok(report.signals.includes('sofi_played_along_with_papi'));
    assert.equal(resolveCouncilAdvice(report, member).ruleId, `${member.id}-report`);
    const diagnosis = play([0, 2, 3]);
    assert.ok(diagnosis.signals.includes('sofi_returned_flirt'));
    assert.equal(resolveCouncilAdvice(diagnosis, member).ruleId, `${member.id}-diagnosis`);
  }
  const session = play([3]);
  session.history.at(-1).emittedSignals = [];
  assert.notEqual(resolveCouncilAdvice(session, eze).ruleId, 'eze-papi');
});

test('el exceso conserva prioridad y keke requiere devolución fuerte reciente', () => {
  const intense = play([3, 2, 1]);
  for (const member of [eze, tobi]) {
    assert.equal(resolveCouncilAdvice(intense, member).ruleId, `${member.id}-intense`);
  }
  let strongCount = 0;
  for (const route of routes(3)) {
    const session = play(route);
    const advice = resolveCouncilAdvice(session, eze);
    if (advice.ruleId === 'eze-strong-flirt') {
      strongCount += 1;
      assert.ok(session.history.at(-1).emittedSignals.includes('beat3_direct_interest'));
      assert.ok(session.signals.includes('sofi_returned_flirt'));
      assert.ok(advice.situation.tags.includes('good_balanced_progress'));
    } else {
      assert.doesNotMatch(advice.text, /keke/);
    }
  }
  assert.ok(strongCount > 0 && strongCount < 8);
});

test('todas las consultas posibles tienen contenido, no mutan sesión y se consumen una vez', () => {
  for (const route of [1, 2, 3].flatMap(routes)) {
    for (const member of conversation.council.members) {
      const session = play(route);
      const before = structuredClone(session);
      const advice = resolveCouncilAdvice(session, member);
      assert.ok(advice.text.length > 0);
      assert.notEqual(advice.ruleId, 'fallback');
      assert.deepEqual(session, before);
      const used = markCouncilUsed(session, advice);
      assert.equal(canUseCouncil(used, route.length, conversation.council), false);
      assert.strictEqual(markCouncilUsed(used, advice), used);
      assert.deepEqual(used.stats, before.stats);
      assert.deepEqual(used.signals, before.signals);
      assert.deepEqual(used.history, before.history);
    }
  }
});

test('auditoría de todos los pools: sin stats, instrucciones, fallbacks vacíos ni hermano de Eze', () => {
  for (const member of conversation.council.members) {
    const lines = [...member.rules.flatMap((rule) => rule.lines), ...member.fallbackLines];
    for (const { text } of lines) {
      assert.doesNotMatch(text, /attraction|trust|intensity|elegí|opción\s*[1-4]/i);
      assert.doesNotMatch(text, /^(Seguí viendo|Todavía es (medio )?pronto|Viene bien|Puede ser|Nao, nao)[.!…\s]*$/i);
      if (member.id === 'eze') assert.doesNotMatch(text, /hermano/i);
    }
  }
});

test('consultar a cualquier amigo en cualquier beat conserva las 256 rutas sociales', () => {
  const distribution = {};
  for (const route of routes(4)) {
    const baseline = play(route);
    const outcome = resolveOutcome(baseline, conversation.outcomeRules);
    distribution[outcome] = (distribution[outcome] ?? 0) + 1;
    for (const member of conversation.council.members) {
      for (const beat of [1, 2, 3]) {
        const consulted = play(route, { member, beat });
        assert.deepEqual(consulted.stats, baseline.stats);
        assert.deepEqual(consulted.history, baseline.history);
        assert.deepEqual(consulted.signals, baseline.signals);
        assert.equal(resolveOutcome(consulted, conversation.outcomeRules), outcome);
      }
    }
  }
  assert.deepEqual(distribution, {
    rejection: 73,
    friendzone: 41,
    bathroom: 54,
    instagram: 88,
  });
});
