import test from 'node:test';
import assert from 'node:assert/strict';
import { SOFI_CONVERSATION } from '../src/data/conversations/sofiConversation.js';
import { createOutcomeEventSystem } from '../src/systems/outcomeEventSystem.js';

test('solo bathroom declara y dispara un evento de outcome', () => {
  let starts = 0;
  const system = createOutcomeEventSystem({
    handlers: {
      bathroom(request) {
        starts += 1;
        return { update: () => request.keepActive };
      },
    },
  });

  for (const outcomeId of ['instagram', 'friendzone', 'rejection']) {
    const outcome = SOFI_CONVERSATION.outcomes[outcomeId];
    assert.equal(outcome.event, undefined);
    assert.equal(system.start({ type: outcomeId, outcome }), false);
  }

  const bathroom = SOFI_CONVERSATION.outcomes.bathroom;
  assert.equal(bathroom.event.type, 'bathroom');
  assert.equal(system.start({ type: bathroom.event.type, outcome: bathroom, keepActive: false }), true);
  assert.equal(system.getActiveType(), 'bathroom');
  assert.equal(system.update(), true);
  assert.equal(system.isActive(), false);
  assert.equal(starts, 1);
});

test('el dispatcher no superpone eventos activos', () => {
  const event = { update: () => true };
  const system = createOutcomeEventSystem({ handlers: { bathroom: () => event } });

  assert.equal(system.start({ type: 'bathroom' }), true);
  assert.equal(system.start({ type: 'bathroom' }), false);
  system.stop();
  assert.equal(system.isActive(), false);
});
