import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../src/state/gameState.js';
import {
  createRunState,
  getResolvedCharacterCount,
  getResolvedOutcomes,
  getRunSummary,
  RUN_PHASES,
} from '../src/state/runState.js';

function activeRun() {
  const run = createRunState();
  assert.equal(run.completeIntro(), true);
  return run;
}

function resolve(gameState, characterId, outcome, bathroomResult) {
  gameState.relationships[characterId] = {
    resolved: true,
    outcome,
    ...(outcome === 'bathroom' ? { bathroomResult } : {}),
  };
}

test('una run nueva inicia en INTRO y la intro solo se completa una vez', () => {
  const run = createRunState();
  const gameState = createGameState();

  assert.equal(run.getPhase(), RUN_PHASES.INTRO);
  assert.deepEqual(gameState.player, { lives: 3, alcohol: 0, points: 0 });
  assert.deepEqual(gameState.relationships, {});
  assert.equal(run.completeIntro(), true);
  assert.equal(run.getPhase(), RUN_PHASES.PARTY_ACTIVE);
  assert.equal(run.completeIntro(), false);
  assert.equal(run.getPhase(), RUN_PHASES.PARTY_ACTIVE);
});

test('una o dos chicas resueltas mantienen PARTY_ACTIVE', () => {
  const run = activeRun();
  const gameState = createGameState();
  resolve(gameState, 'sofi', 'instagram');
  gameState.relationships.unrelated = { resolved: true, outcome: 'rejection' };

  assert.equal(getResolvedCharacterCount(gameState), 1);
  assert.equal(run.evaluate(gameState), false);
  resolve(gameState, 'mili', 'bathroom', 'secured');
  assert.equal(getResolvedCharacterCount(gameState), 2);
  assert.equal(run.evaluate(gameState), false);
  assert.equal(run.getPhase(), RUN_PHASES.PARTY_ACTIVE);
});

test('tres outcomes mixtos terminan en NORMAL_END', () => {
  const run = activeRun();
  const gameState = createGameState();
  resolve(gameState, 'sofi', 'bathroom', 'secured');
  resolve(gameState, 'mili', 'instagram');
  resolve(gameState, 'cami', 'friendzone');

  assert.equal(run.evaluate(gameState), true);
  assert.equal(run.getPhase(), RUN_PHASES.NORMAL_END);
});

test('tres baños asegurados de las tres chicas producen PERFECT_NIGHT', () => {
  const run = activeRun();
  const gameState = createGameState();
  for (const id of ['sofi', 'mili', 'cami']) resolve(gameState, id, 'bathroom', 'secured');

  assert.equal(run.evaluate(gameState), true);
  assert.equal(run.getPhase(), RUN_PHASES.PERFECT_NIGHT);
});

test('un baño interrumpido impide PERFECT_NIGHT y termina en NORMAL_END', () => {
  const run = activeRun();
  const gameState = createGameState();
  resolve(gameState, 'sofi', 'bathroom', 'secured');
  resolve(gameState, 'mili', 'bathroom', 'secured');
  resolve(gameState, 'cami', 'bathroom', 'interrupted');

  assert.equal(run.evaluate(gameState), true);
  assert.equal(run.getPhase(), RUN_PHASES.NORMAL_END);
});

test('cero vidas produce GAME_OVER aunque las tres tengan baños asegurados', () => {
  const run = activeRun();
  const gameState = createGameState();
  gameState.player.lives = 0;
  for (const id of ['sofi', 'mili', 'cami']) resolve(gameState, id, 'bathroom', 'secured');

  assert.equal(run.evaluate(gameState), true);
  assert.equal(run.getPhase(), RUN_PHASES.GAME_OVER);
});

test('tres rechazos y cero vidas producen GAME_OVER', () => {
  const run = activeRun();
  const gameState = createGameState();
  gameState.player.lives = 0;
  for (const id of ['sofi', 'mili', 'cami']) resolve(gameState, id, 'rejection');

  assert.equal(run.evaluate(gameState), true);
  assert.equal(run.getPhase(), RUN_PHASES.GAME_OVER);
});

test('un final es estable y evaluate no vuelve a transicionar la run', () => {
  const run = activeRun();
  const gameState = createGameState();
  for (const id of ['sofi', 'mili', 'cami']) resolve(gameState, id, 'friendzone');

  assert.equal(run.evaluate(gameState), true);
  gameState.player.lives = 0;
  assert.equal(run.evaluate(gameState), false);
  assert.equal(run.getPhase(), RUN_PHASES.NORMAL_END);
});

test('continueParty solo transiciona PERFECT_NIGHT a POST_WIN_FREE_ROAM', () => {
  const run = createRunState();
  assert.equal(run.continueParty(), false);
  run.completeIntro();
  assert.equal(run.continueParty(), false);

  const gameState = createGameState();
  for (const id of ['sofi', 'mili', 'cami']) resolve(gameState, id, 'bathroom', 'secured');
  run.evaluate(gameState);
  assert.equal(run.continueParty(), true);
  assert.equal(run.getPhase(), RUN_PHASES.POST_WIN_FREE_ROAM);
  assert.equal(run.continueParty(), false);
});

test('summary deriva outcomes, puntos y conteos sin compartir objetos mutables', () => {
  const gameState = createGameState();
  gameState.player.points = 1000;
  gameState.player.lives = 2;
  resolve(gameState, 'sofi', 'bathroom', 'secured');
  resolve(gameState, 'mili', 'instagram');

  assert.equal(getResolvedCharacterCount(gameState), 2);
  assert.deepEqual(getResolvedOutcomes(gameState), {
    sofi: { outcome: 'bathroom', bathroomResult: 'secured' },
    mili: { outcome: 'instagram' },
  });
  const summary = getRunSummary(gameState);
  assert.deepEqual(summary, {
    points: 1000,
    lives: 2,
    resolvedCount: 2,
    securedBathroomCount: 1,
    relationships: {
      sofi: { outcome: 'bathroom', bathroomResult: 'secured' },
      mili: { outcome: 'instagram' },
    },
  });
  summary.relationships.sofi.outcome = 'rejection';
  assert.equal(gameState.relationships.sofi.outcome, 'bathroom');
});
