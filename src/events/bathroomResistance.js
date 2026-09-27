const DURATION_MS = 10000;
const ANTICIPATION = Object.freeze({
  durationMs: 3000,
  beats: Object.freeze([
    Object.freeze({ at: 1700, text: 'PUM PUM PUM' }),
    Object.freeze({ at: 2450, text: 'TAMBU.' }),
  ]),
});

const HIT_TIMINGS_AND_TEXT = [
  [800, 'PUM'],
  [1900, 'PUM PUM'],
  [3100, 'TAMBU.'],
  [4400, 'ABRÍ.'],
  [6100, 'PUM PUM PUM'],
  [7900, 'DALE BOLUDO, TENGO QUE MEAR.'],
  [9200, 'PUM PUM PUM'],
];

function createProfile(startResistance, drainRates, hitDamages) {
  return Object.freeze({
    durationMs: DURATION_MS,
    startResistance,
    spaceGain: 4,
    maxResistance: 100,
    anticipation: ANTICIPATION,
    drainPhases: Object.freeze([
      Object.freeze({ untilMs: 3500, perSecond: drainRates[0] }),
      Object.freeze({ untilMs: 7000, perSecond: drainRates[1] }),
      Object.freeze({ untilMs: DURATION_MS, perSecond: drainRates[2] }),
    ]),
    hits: Object.freeze(HIT_TIMINGS_AND_TEXT.map(([at, text], index) => (
      Object.freeze({ at, damage: hitDamages[index], text })
    ))),
  });
}

export const BATHROOM_RESISTANCE_PROFILES = Object.freeze({
  1: createProfile(55, [12, 15, 18], [3, 4, 4, 5, 5, 6, 7]),
  2: createProfile(52, [14, 18, 22], [4, 5, 6, 6, 7, 8, 9]),
  3: createProfile(50, [16, 21, 26], [5, 6, 7, 8, 9, 10, 12]),
});

export function getBathroomResistanceConfig(attemptNumber = 1) {
  const profileNumber = Math.max(1, Math.min(3, Math.floor(attemptNumber) || 1));
  return BATHROOM_RESISTANCE_PROFILES[profileNumber];
}

export function calculateBathroomDrain(startMs, endMs, phases) {
  if (!Array.isArray(phases) || endMs <= startMs) return 0;

  let drain = 0;
  let phaseStartMs = 0;
  for (const phase of phases) {
    const overlapMs = Math.max(0, Math.min(endMs, phase.untilMs) - Math.max(startMs, phaseStartMs));
    drain += overlapMs * phase.perSecond / 1000;
    phaseStartMs = phase.untilMs;
    if (phaseStartMs >= endMs) break;
  }
  return drain;
}

export function clampBathroomResistance(value, maxResistance = 100) {
  return Math.max(0, Math.min(maxResistance, value));
}

export function createBathroomResistanceState(config = getBathroomResistanceConfig()) {
  return {
    elapsedMs: 0,
    resistance: clampBathroomResistance(config.startResistance, config.maxResistance),
    nextHitIndex: 0,
    status: 'active',
  };
}

export function recoverBathroomResistance(state, config = getBathroomResistanceConfig()) {
  if (state.status !== 'active') return state;
  return {
    ...state,
    resistance: clampBathroomResistance(
      state.resistance + config.spaceGain,
      config.maxResistance,
    ),
  };
}

export function advanceBathroomResistance(state, deltaMs, config = getBathroomResistanceConfig()) {
  if (state.status !== 'active') return { state, hits: [] };

  const elapsedMs = Math.min(
    config.durationMs,
    state.elapsedMs + Math.max(0, deltaMs),
  );
  const drain = calculateBathroomDrain(state.elapsedMs, elapsedMs, config.drainPhases);
  let resistance = clampBathroomResistance(state.resistance - drain, config.maxResistance);
  const hits = [];
  let nextHitIndex = state.nextHitIndex;

  while (nextHitIndex < config.hits.length && config.hits[nextHitIndex].at <= elapsedMs) {
    const hit = config.hits[nextHitIndex];
    resistance = clampBathroomResistance(resistance - hit.damage, config.maxResistance);
    hits.push(hit);
    nextHitIndex += 1;
  }

  const status = resistance <= 0
    ? 'failure'
    : elapsedMs >= config.durationMs
      ? 'success'
      : 'active';

  return {
    state: { elapsedMs, resistance, nextHitIndex, status },
    hits,
  };
}
