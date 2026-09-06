import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BATHROOM_RESISTANCE_CONFIG,
  advanceBathroomResistance,
  createBathroomResistanceState,
  recoverBathroomResistance,
} from '../src/events/bathroomResistance.js';
import { commitConversationOutcome, createGameState } from '../src/state/gameState.js';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';

const NO_HITS_CONFIG = { ...BATHROOM_RESISTANCE_CONFIG, hits: [] };

test('la resistencia comienza configurada y el tiempo la drena', () => {
  const state = createBathroomResistanceState(NO_HITS_CONFIG);
  const { state: advanced } = advanceBathroomResistance(state, 1000, NO_HITS_CONFIG);

  assert.equal(state.resistance, 65);
  assert.equal(advanced.resistance, 50);
  assert.equal(advanced.status, 'active');
});

test('SPACE recupera resistencia y respeta el máximo de 100', () => {
  const state = { ...createBathroomResistanceState(NO_HITS_CONFIG), resistance: 97 };
  const recovered = recoverBathroomResistance(state, NO_HITS_CONFIG);
  const finished = { ...recovered, status: 'success' };

  assert.equal(recovered.resistance, 100);
  assert.strictEqual(recoverBathroomResistance(finished, NO_HITS_CONFIG), finished);
});

test('los golpes aplican daño determinístico y la resistencia nunca baja de cero', () => {
  const config = {
    ...NO_HITS_CONFIG,
    hits: [{ at: 500, damage: 80, text: 'PUM' }],
  };
  const { state, hits } = advanceBathroomResistance(
    createBathroomResistanceState(config),
    1000,
    config,
  );

  assert.deepEqual(hits, config.hits);
  assert.equal(state.resistance, 0);
  assert.equal(state.status, 'failure');
});

test('sobrevivir la duración completa produce éxito y no puede producir fracaso a la vez', () => {
  const config = { ...NO_HITS_CONFIG, baseDrainPerSecond: 0 };
  const { state } = advanceBathroomResistance(
    createBathroomResistanceState(config),
    config.durationMs,
    config,
  );

  assert.equal(state.status, 'success');
  assert.notEqual(state.status, 'failure');
  assert.equal(advanceBathroomResistance(state, 1000, config).state.status, 'success');
});

test('el resultado del minijuego no modifica el baño, puntos ni resolución social', () => {
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
    { ...createBathroomResistanceState(NO_HITS_CONFIG), resistance: 0 },
    0,
    NO_HITS_CONFIG,
  ).state;

  assert.equal(failure.status, 'failure');
  assert.deepEqual(gameState, snapshot);
  assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
  assert.equal(gameState.player.points, 500);
  assert.equal(gameState.relationships.sofi.resolved, true);
});
