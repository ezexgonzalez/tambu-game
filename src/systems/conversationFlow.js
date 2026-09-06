import {
  applySocialEffects,
  combineSocialEffects,
  matchesConversationConditions,
} from './socialSystem.js';
import { resolveSocialSituation } from './socialSituation.js';

function unique(values) {
  return [...new Set(values)];
}

function contextualSession(session) {
  return { ...session, situation: resolveSocialSituation(session) };
}

function selectContextualEntry(entries = [], session) {
  const context = contextualSession(session);
  return entries.find((entry) => matchesConversationConditions(context, entry.when));
}

export function getConversationBeat(conversation, beatId) {
  return conversation.beats.find((beat) => beat.id === beatId);
}

export function getConversationBeatIndex(conversation, beatId) {
  return conversation.beats.findIndex((beat) => beat.id === beatId);
}

export function resolveBeatPrompt(beat, session) {
  return selectContextualEntry(beat.promptVariants, session)?.prompt ?? beat.prompt;
}

export function applyConversationChoice(session, beat, choice) {
  const variant = selectContextualEntry(choice.variants, session);
  const effects = combineSocialEffects(choice.effects, variant?.effects);
  const statsBefore = { ...session.stats };
  const statsAfter = applySocialEffects(session.stats, effects);
  const emittedSignals = unique([...(choice.emits ?? []), ...(variant?.emits ?? [])]);
  const historyEntry = {
    beatId: beat.id,
    choiceId: choice.id,
    intent: choice.intent,
    variantId: variant?.id ?? null,
    emittedSignals,
    statsBefore,
    statsAfter: { ...statsAfter },
  };
  const nextSession = {
    ...session,
    stats: statsAfter,
    history: [...session.history, historyEntry],
    signals: unique([...session.signals, ...emittedSignals]),
  };

  return {
    session: nextSession,
    presentation: {
      reaction: variant?.reaction ?? choice.reaction ?? [],
      bridge: variant?.bridge ?? choice.bridge ?? [],
      nextBeat: variant?.nextBeat ?? choice.nextBeat ?? beat.nextBeat ?? null,
      variantId: variant?.id ?? null,
    },
  };
}

export function advanceConversationSession(session, nextBeat) {
  return { ...session, currentBeat: nextBeat };
}
