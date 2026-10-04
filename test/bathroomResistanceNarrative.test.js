import test from 'node:test';
import assert from 'node:assert/strict';
import { getBathroomResistanceNarrative } from '../src/data/bathroomResistanceNarrative.js';
import { createGameState, getCompletedBathroomResults, settleBathroomResult } from '../src/state/gameState.js';

const spoken = (speaker, expression, text) => ({ speaker, expression, text });
const knock = (text) => ({ speaker: null, expression: null, text });
const narrative = (attemptNumber, previousResults = []) => getBathroomResistanceNarrative({ attemptNumber, previousResults });

test('baño 1 mantiene todo el copy aprobado de sorpresa y expresiones de Pitity', () => {
  const data = narrative(1);
  assert.deepEqual(data.anticipation, [knock('PUM PUM PUM'), spoken('pitity', 'talk', '¿TAMBU?')]);
  assert.deepEqual(data.hits, [
    knock('PUM'), spoken('pitity', 'talk', '¿ESTÁS AHÍ?'), knock('PUM PUM'),
    spoken('pitity', 'angry', 'ABRÍ, BOLUDO.'), knock('PUM PUM PUM'),
    spoken('pitity', 'shout', '¡DALE, TENGO QUE MEAR!'), knock('PUM PUM PUM'),
  ]);
});

test('baño 2 usa Tobi/Uriel e incredulidad con memoria secured real', () => {
  const data = narrative(2, ['secured']);
  assert.deepEqual(data.anticipation, [spoken('tobi', 'talk', 'NO ME JODAS...'), spoken('uriel', 'talk', '¿OTRA VEZ?')]);
  assert.deepEqual(data.hits, [
    spoken('tobi', 'angry', 'ABRÍ.'), spoken('uriel', 'talk', 'ESTÁ AHÍ ADENTRO, ¿NO?'),
    knock('PUM PUM'), spoken('tobi', 'shout', '¡TAMBU, ABRÍ!'),
    spoken('uriel', 'angry', 'LA PRIMERA TE SALIÓ. ESTA NO.'),
    spoken('tobi', 'shout', '¡DALE, PELOTUDO!'), knock('PUM PUM PUM'),
  ]);
});

test('baño 2 recuerda un bathroom interrumpido sin inventar éxito previo', () => {
  assert.deepEqual(narrative(2, ['interrupted']).hits[4], spoken('uriel', 'angry', '¿NO APRENDISTE NADA?'));
});

test('baño 3 usa Santy/Thiago/Eze con el copy de caos aprobado y dos secured', () => {
  const data = narrative(3, ['secured', 'secured']);
  assert.deepEqual(data.anticipation, [spoken('santy', 'talk', 'CHE...'), spoken('thiago', 'angry', 'NO. OTRA VEZ NO.')]);
  assert.deepEqual(data.hits, [
    spoken('santy', 'shout', '¡TAMBU!'), spoken('thiago', 'angry', 'ABRÍ LA PUERTA.'),
    spoken('eze', 'angry', 'DOS VECES TE SALIÓ. ESTA NO.'),
    spoken('santy', 'shout', '¡ABRÍ, HIJO DE PUTA!'), spoken('thiago', 'shout', '¡TENGO QUE MEAR!'),
    spoken('eze', 'angry', 'YA ESTÁ. TIREN LA PUERTA.'), knock('PUM PUM PUM'),
  ]);
});

test('baño 3 con un secured usa la misma rama independientemente del orden', () => {
  for (const results of [['secured', 'interrupted'], ['interrupted', 'secured']]) {
    assert.deepEqual(narrative(3, results).hits[2], spoken('eze', 'talk', 'UNA TE SALIÓ. UNA TE LA CAGAMOS.'));
  }
});

test('baño 3 con cero secured recuerda dos interrupciones', () => {
  assert.deepEqual(narrative(3, ['interrupted', 'interrupted']).hits[2], spoken('eze', 'talk', 'TERCERA VEZ Y TODAVÍA INSISTÍS.'));
});

test('las seis reacciones finales conservan speaker, expresión y copy exactos', () => {
  assert.deepEqual([1, 2, 3].map((attempt) => narrative(attempt).resolution), [
    { success: spoken('pitity', 'angry', 'BUENO. CAGATE.'), failure: spoken('pitity', 'shout', '¡TE DIJE QUE ABRAS!') },
    { success: spoken('tobi', 'angry', 'NO PUEDE SER.'), failure: spoken('uriel', 'talk', 'Y... ERA OBVIO.') },
    { success: spoken('eze', 'talk', 'NAH. DEJALO. YA ESTÁ.'), failure: spoken('santy', 'shout', '¡TE AGARRAMOS, GIL!') },
  ]);
});

test('memoria excluye pending y outcomes no-bathroom, sin modificar ningún estado narrativo/social', () => {
  const state = createGameState();
  state.relationships = {
    sofi: { outcome: 'bathroom', bathroomResult: 'secured', history: [], signals: [] },
    mili: { outcome: 'bathroom', bathroomResult: 'interrupted' },
    cami: { outcome: 'bathroom', bathroomResult: null, rewardSettled: false },
    other: { outcome: 'instagram', bathroomResult: 'secured' },
    rejected: { outcome: 'rejection', bathroomResult: 'interrupted' },
    friend: { outcome: 'friendzone' },
  };
  const snapshot = structuredClone(state);
  const previous = getCompletedBathroomResults(state);
  assert.deepEqual(previous, ['secured', 'interrupted']);
  const data = narrative(3, previous);
  assert.deepEqual(state, snapshot);
  previous[0] = 'interrupted';
  settleBathroomResult(state, 'cami', 'success');
  assert.deepEqual(data.hits[2], spoken('eze', 'talk', 'UNA TE SALIÓ. UNA TE LA CAGAMOS.'));
  assert.equal(state.relationships.sofi.bathroomResult, 'secured');
  assert.ok(Object.isFrozen(data) && Object.isFrozen(data.hits) && Object.isFrozen(data.hits[2]));
});
