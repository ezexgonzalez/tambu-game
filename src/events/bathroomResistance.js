export const BATHROOM_RESISTANCE_CONFIG = {
  durationMs: 10000,
  startResistance: 65,
  spaceGain: 6,
  baseDrainPerSecond: 15,
  anticipation: {
    durationMs: 3000,
    beats: [
      { at: 1700, text: 'PUM PUM PUM' },
      { at: 2450, text: 'TAMBU.' },
    ],
  },
  hits: [
    { at: 800, damage: 4, text: 'PUM' },
    { at: 1900, damage: 5, text: 'PUM PUM' },
    { at: 3100, damage: 6, text: 'TAMBU.' },
    { at: 4400, damage: 6, text: 'ABRÍ.' },
    { at: 6100, damage: 7, text: 'PUM PUM PUM' },
    { at: 7900, damage: 8, text: 'DALE BOLUDO, TENGO QUE MEAR.' },
    { at: 9200, damage: 10, text: 'PUM PUM PUM' },
  ],
};

export function clampBathroomResistance(value) {
  return Math.max(0, Math.min(100, value));
}

export function createBathroomResistanceState(config = BATHROOM_RESISTANCE_CONFIG) {
  return {
    elapsedMs: 0,
    resistance: config.startResistance,
    nextHitIndex: 0,
    status: 'active',
  };
}

export function recoverBathroomResistance(state, config = BATHROOM_RESISTANCE_CONFIG) {
  if (state.status !== 'active') return state;
  return {
    ...state,
    resistance: clampBathroomResistance(state.resistance + config.spaceGain),
  };
}

export function advanceBathroomResistance(state, deltaMs, config = BATHROOM_RESISTANCE_CONFIG) {
  if (state.status !== 'active') return { state, hits: [] };

  const elapsedMs = Math.min(
    config.durationMs,
    state.elapsedMs + Math.max(0, deltaMs),
  );
  const drain = (elapsedMs - state.elapsedMs) * config.baseDrainPerSecond / 1000;
  let resistance = clampBathroomResistance(state.resistance - drain);
  const hits = [];
  let nextHitIndex = state.nextHitIndex;

  while (nextHitIndex < config.hits.length && config.hits[nextHitIndex].at <= elapsedMs) {
    const hit = config.hits[nextHitIndex];
    resistance = clampBathroomResistance(resistance - hit.damage);
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
