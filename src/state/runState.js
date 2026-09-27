import { patioWomen } from '../data/patioCharacters.js';
import {
  getBathroomResult,
  getCharacterOutcome,
  getSecuredBathroomCount,
  isCharacterResolved,
} from './gameState.js';

export const RUN_PHASES = Object.freeze({
  INTRO: 'INTRO',
  PARTY_ACTIVE: 'PARTY_ACTIVE',
  GAME_OVER: 'GAME_OVER',
  NORMAL_END: 'NORMAL_END',
  PERFECT_NIGHT: 'PERFECT_NIGHT',
  POST_WIN_FREE_ROAM: 'POST_WIN_FREE_ROAM',
});

const MAIN_CHARACTER_IDS = Object.freeze(patioWomen.map(({ id }) => id));

export function getResolvedCharacterCount(gameState) {
  return MAIN_CHARACTER_IDS.filter((characterId) => (
    isCharacterResolved(gameState, characterId)
  )).length;
}

export function getResolvedOutcomes(gameState) {
  return Object.fromEntries(MAIN_CHARACTER_IDS.flatMap((characterId) => {
    if (!isCharacterResolved(gameState, characterId)) return [];

    const outcome = getCharacterOutcome(gameState, characterId);
    return [[characterId, {
      outcome,
      ...(outcome === 'bathroom'
        ? { bathroomResult: getBathroomResult(gameState, characterId) }
        : {}),
    }]];
  }));
}

export function getRunSummary(gameState) {
  return {
    points: gameState.player.points,
    lives: gameState.player.lives,
    resolvedCount: getResolvedCharacterCount(gameState),
    securedBathroomCount: getSecuredBathroomCount(gameState),
    relationships: getResolvedOutcomes(gameState),
  };
}

function hasPerfectNight(gameState) {
  return MAIN_CHARACTER_IDS.every((characterId) => (
    isCharacterResolved(gameState, characterId)
    && getCharacterOutcome(gameState, characterId) === 'bathroom'
    && getBathroomResult(gameState, characterId) === 'secured'
  ));
}

export function createRunState() {
  let phase = RUN_PHASES.INTRO;

  function completeIntro() {
    if (phase !== RUN_PHASES.INTRO) return false;
    phase = RUN_PHASES.PARTY_ACTIVE;
    return true;
  }

  function evaluate(gameState) {
    if (phase !== RUN_PHASES.PARTY_ACTIVE) return false;

    if (gameState.player.lives <= 0) {
      phase = RUN_PHASES.GAME_OVER;
      return true;
    }

    if (hasPerfectNight(gameState)) {
      phase = RUN_PHASES.PERFECT_NIGHT;
      return true;
    }

    if (getResolvedCharacterCount(gameState) === MAIN_CHARACTER_IDS.length) {
      phase = RUN_PHASES.NORMAL_END;
      return true;
    }

    return false;
  }

  function continueParty() {
    if (phase !== RUN_PHASES.PERFECT_NIGHT) return false;
    phase = RUN_PHASES.POST_WIN_FREE_ROAM;
    return true;
  }

  return {
    completeIntro,
    evaluate,
    continueParty,
    getPhase: () => phase,
  };
}
