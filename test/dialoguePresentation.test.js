import test from 'node:test';
import assert from 'node:assert/strict';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import {
  createDialoguePresentation,
  DIALOGUE_CHARACTER_MS,
  normalizeDialogueSequence,
} from '../src/ui/dialoguePresentation.js';

test('reaction + bridge conserva todas las intervenciones, orden y speakers', () => {
  const choice = SOFI_CONVERSATION.beats[1].choices.find(({ id }) => id === 'analyzed-everyone');
  const before = structuredClone(choice);
  const sequence = normalizeDialogueSequence(choice, 'Sofi');
  assert.equal(sequence.length, 9);
  assert.deepEqual(sequence, [...choice.reaction, ...choice.bridge]);
  assert.deepEqual(choice, before);
  assert.deepEqual(sequence.map(({ speaker }) => speaker), [
    'Sofi', 'Tambu', 'Sofi', 'Tambu', 'Sofi', 'Sofi', 'Tambu', 'Sofi', 'Tambu',
  ]);
});

test('papi conserva cinco intervenciones y termina con narración sin speaker', () => {
  const choice = SOFI_CONVERSATION.beats[0].choices.find(({ id }) => id === 'papi');
  const sequence = normalizeDialogueSequence(choice, 'Sofi');
  assert.deepEqual(sequence, [
    { speaker: 'Sofi', text: '¿Te habla quién?' },
    { speaker: 'Tambu', text: 'Papi.' },
    { speaker: 'Sofi', text: 'No podés presentarte así.' },
    { speaker: 'Tambu', text: 'Pero ya lo hice.' },
    { text: 'Sofi se ríe.' },
  ]);
});

test('reacciones de prototipo en string funcionan sin bridge', () => {
  assert.deepEqual(normalizeDialogueSequence({ reaction: 'Hola.' }, 'Mili'), [
    { speaker: 'Mili', text: 'Hola.' },
  ]);
});

test('escribir, completar y avanzar son pasos separados sin autoavance', () => {
  const presentation = createDialoguePresentation([
    { speaker: 'Sofi', text: 'Hola.' },
    { text: 'Sofi se ríe.' },
  ]);
  assert.equal(presentation.current().text, '');
  presentation.update(DIALOGUE_CHARACTER_MS * 2);
  assert.equal(presentation.current().text, 'Ho');
  assert.equal(presentation.advance(), 'revealed');
  assert.equal(presentation.current().text, 'Hola.');
  presentation.update(10000);
  assert.equal(presentation.current().entry.speaker, 'Sofi');
  assert.equal(presentation.advance(), 'next');
  assert.equal(presentation.current().text, '');
  assert.equal(presentation.current().entry.speaker, undefined);
  assert.equal(presentation.advance(), 'revealed');
  assert.equal(presentation.advance(), 'finished');
});

test('un puente largo recorre cada intervención exactamente una vez', () => {
  const choice = SOFI_CONVERSATION.beats[1].choices[3];
  const sequence = normalizeDialogueSequence(choice, 'Sofi');
  const presentation = createDialoguePresentation(sequence);
  const seen = [];
  for (let index = 0; index < sequence.length; index += 1) {
    presentation.complete();
    seen.push(presentation.current().entry);
    assert.equal(presentation.advance(), index === sequence.length - 1 ? 'finished' : 'next');
  }
  assert.deepEqual(seen, sequence);
});
