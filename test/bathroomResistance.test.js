import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATHROOM_RESISTANCE_PROFILES,
  advanceBathroomResistance,
  calculateBathroomDrain,
  createBathroomResistanceState,
  getBathroomResistanceConfig,
  recoverBathroomResistance,
} from '../src/events/bathroomResistance.js';
import {
  commitConversationOutcome,
  createGameState,
  getBathroomAttemptNumber,
  getBathroomResult,
  settleBathroomResult,
} from '../src/state/gameState.js';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';

const NO_HITS_PROFILE = (profile) => ({ ...profile, hits: [] });

test('el ordinal cuenta solo baños liquidados y excluye el evento actual pendiente', () => {
  const gameState = createGameState();
  gameState.relationships.sofi = {
    outcome: 'bathroom', bathroomResult: null, rewardSettled: false,
  };
  assert.equal(getBathroomAttemptNumber(gameState), 1);

  gameState.relationships.sofi.bathroomResult = 'secured';
  gameState.relationships.mili = {
    outcome: 'bathroom', bathroomResult: null, rewardSettled: false,
  };
  assert.equal(getBathroomAttemptNumber(gameState), 2);

  gameState.relationships.sofi.bathroomResult = 'interrupted';
  assert.equal(getBathroomAttemptNumber(gameState), 2,
    'un intento interrumpido también cuenta como previo liquidado');

  gameState.relationships.sofi.bathroomResult = 'secured';
  gameState.relationships.cami = { outcome: 'bathroom', bathroomResult: 'interrupted' };
  gameState.relationships.tobi = {
    outcome: 'bathroom', bathroomResult: null, rewardSettled: false,
  };
  assert.equal(getBathroomAttemptNumber(gameState), 3);

  gameState.relationships.older1 = { outcome: 'bathroom', bathroomResult: 'secured' };
  gameState.relationships.older2 = { outcome: 'bathroom', bathroomResult: 'interrupted' };
  assert.equal(getBathroomAttemptNumber(gameState), 3, 'el ordinal queda limitado a tres');
});

test('los perfiles comparten contrato y aumentan la presión de 1 a 3', () => {
  const profiles = [1, 2, 3].map(getBathroomResistanceConfig);
  assert.deepEqual(profiles.map(({ durationMs }) => durationMs), [10000, 10000, 10000]);
  assert.deepEqual(profiles.map(({ spaceGain }) => spaceGain), [4, 4, 4]);
  assert.deepEqual(profiles.map(({ maxResistance }) => maxResistance), [100, 100, 100]);
  assert.deepEqual(profiles.map(({ startResistance }) => startResistance), [55, 52, 50]);
  assert.deepEqual(profiles.map(({ drainPhases }) => drainPhases.map(({ perSecond }) => perSecond)), [
    [16, 20, 25], [18, 23, 29], [20, 26, 33],
  ]);
  assert.deepEqual(profiles.map(({ hits }) => hits.reduce((sum, hit) => sum + hit.damage, 0)), [55, 66, 80]);
  assert.deepEqual(profiles.map(({ hits }) => hits.map(({ at }) => at)), [
    [800, 1900, 3100, 4400, 6100, 7900, 9200],
    [800, 1900, 3100, 4400, 6100, 7900, 9200],
    [800, 1900, 3100, 4400, 6100, 7900, 9200],
  ]);
  assert.deepEqual(profiles.map(({ hits }) => hits.map(({ damage }) => damage)), [
    [5, 6, 7, 8, 9, 10, 10], [6, 7, 8, 9, 10, 12, 14], [7, 8, 10, 11, 13, 15, 16],
  ]);
  for (const profile of profiles) {
    assert.deepEqual(profile.drainPhases.map(({ untilMs }) => untilMs), [3500, 7000, 10000]);
    assert.deepEqual(profile.anticipation, { durationMs: 3000, beats: [{ at: 1700 }, { at: 2450 }] });
    assert.ok(profile.hits.every((hit) => !('text' in hit)), 'el perfil mecánico no decide copy');
  }
  const pressure = profiles.map(({ startResistance, drainPhases, hits }) => (
    100 - startResistance
      + calculateBathroomDrain(0, 10000, drainPhases)
      + hits.reduce((sum, hit) => sum + hit.damage, 0)
  ));
  assert.ok(pressure[0] < pressure[1] && pressure[1] < pressure[2]);
  assert.equal(getBathroomResistanceConfig(0), BATHROOM_RESISTANCE_PROFILES[1]);
  assert.equal(getBathroomResistanceConfig(99), BATHROOM_RESISTANCE_PROFILES[3]);
});

test('cada perfil escala el drenaje durante el intento', () => {
  for (const profile of Object.values(BATHROOM_RESISTANCE_PROFILES)) {
    const rates = profile.drainPhases.map(({ perSecond }) => perSecond);
    assert.ok(rates[0] < rates[1] && rates[1] < rates[2]);
    assert.ok(calculateBathroomDrain(7000, 8000, profile.drainPhases)
      > calculateBathroomDrain(3500, 4500, profile.drainPhases));
    assert.ok(calculateBathroomDrain(3500, 4500, profile.drainPhases)
      > calculateBathroomDrain(0, 1000, profile.drainPhases));
  }
});

test('el drenaje integra correctamente deltas que cruzan las fronteras de fase', () => {
  const phases = getBathroomResistanceConfig(1).drainPhases;
  assert.equal(calculateBathroomDrain(3400, 3700, phases), 5.6);
  assert.equal(calculateBathroomDrain(6900, 7200, phases), 7);
});

test('diez segundos de drenaje son independientes del tamaño de frame', () => {
  const profile = getBathroomResistanceConfig(1);
  const config = {
    ...NO_HITS_PROFILE(profile),
    startResistance: 100,
    drainPhases: [
      { untilMs: 3500, perSecond: 1 },
      { untilMs: 7000, perSecond: 2 },
      { untilMs: 10000, perSecond: 3 },
    ],
  };
  const singleStep = advanceBathroomResistance(createBathroomResistanceState(config), 10000, config).state;
  let smallSteps = createBathroomResistanceState(config);
  for (let index = 0; index < 200; index += 1) {
    smallSteps = advanceBathroomResistance(smallSteps, 50, config).state;
  }
  assert.ok(Math.abs(singleStep.resistance - smallSteps.resistance) < 1e-9);
  assert.equal(singleStep.elapsedMs, smallSteps.elapsedMs);
  assert.equal(singleStep.resistance, 80.5);
  assert.equal(singleStep.status, 'success');
});

test('el ordinal 1 comienza en 55 y SPACE recupera exactamente 4 hasta el máximo', () => {
  const profile = getBathroomResistanceConfig(1);
  const state = createBathroomResistanceState(profile);
  assert.equal(state.resistance, 55);
  assert.equal(recoverBathroomResistance(state, profile).resistance, 59);
  assert.equal(recoverBathroomResistance({ ...state, resistance: 98 }, profile).resistance, 100);
  const finished = { ...state, status: 'success' };
  assert.strictEqual(recoverBathroomResistance(finished, profile), finished);
});

test('los golpes mantienen el contenido y el daño determinístico y la resistencia no baja de cero', () => {
  const config = {
    ...NO_HITS_PROFILE(getBathroomResistanceConfig(1)),
    hits: [{ at: 500, damage: 80, text: 'PUM' }],
  };
  const { state, hits } = advanceBathroomResistance(createBathroomResistanceState(config), 1000, config);
  assert.deepEqual(hits, config.hits);
  assert.equal(state.resistance, 0);
  assert.equal(state.status, 'failure');
});

test('sobrevivir los diez segundos produce éxito sin alterar la liquidación de recompensas', () => {
  const config = {
    ...NO_HITS_PROFILE(getBathroomResistanceConfig(1)),
    startResistance: 100,
    drainPhases: [
      { untilMs: 3500, perSecond: 0 },
      { untilMs: 7000, perSecond: 0 },
      { untilMs: 10000, perSecond: 0 },
    ],
  };
  const { state } = advanceBathroomResistance(createBathroomResistanceState(config), 10000, config);
  assert.equal(state.status, 'success');
  assert.equal(advanceBathroomResistance(state, 1000, config).state.status, 'success');
});

test('el baño sigue pendiente hasta Resistance y el fallo conserva la recompensa parcial sin quitar vidas', () => {
  const gameState = createGameState();
  const session = {
    characterId: 'sofi',
    stats: { attraction: 20, trust: 15, intensity: 8 },
    history: [],
    signals: [],
  };
  commitConversationOutcome(gameState, session, SOFI_CONVERSATION.outcomes.bathroom);
  const snapshot = structuredClone(gameState);
  const failure = advanceBathroomResistance(
    { ...createBathroomResistanceState(getBathroomResistanceConfig(1)), resistance: 0 },
    0,
    getBathroomResistanceConfig(1),
  ).state;

  assert.equal(failure.status, 'failure');
  assert.equal(gameState.player.points, snapshot.player.points);
  assert.equal(gameState.player.lives, snapshot.player.lives);
  assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
  assert.equal(gameState.relationships.sofi.resolved, true);
  assert.equal(getBathroomResult(gameState, 'sofi'), null);
  assert.equal(gameState.relationships.sofi.rewardSettled, false);

  assert.equal(settleBathroomResult(gameState, 'sofi', failure.status), true);
  assert.equal(getBathroomResult(gameState, 'sofi'), 'interrupted');
  assert.equal(gameState.player.points, 250);
  assert.equal(gameState.player.lives, 3);
});
