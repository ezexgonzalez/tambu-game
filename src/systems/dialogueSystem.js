import Phaser from 'phaser';
import { canInteractWithCharacter, commitConversationOutcome } from '../state/gameState.js';
import {
  createConversationSession,
  resolveOutcome,
} from './socialSystem.js';
import {
  advanceConversationSession,
  applyConversationChoice,
  getConversationBeat,
  getConversationBeatIndex,
  resolveBeatPrompt,
} from './conversationFlow.js';
import {
  canUseCouncil,
  markCouncilUsed,
  resolveCouncilAdvice,
} from './councilSystem.js';
import {
  createCouncilAdviceUi,
  createCouncilSelectionUi,
  createDialogueQuestionUi,
  createDialogueReactionUi,
  createOutcomeUi,
  destroyDialogueUi,
} from '../ui/dialogueUi.js';
import {
  createDialoguePresentation,
  normalizeDialogueSequence,
} from '../ui/dialoguePresentation.js';

const DIALOGUE_MODE = {
  IDLE: 'idle',
  QUESTION: 'question',
  REACTION: 'reaction',
  COUNCIL: 'council',
  OUTCOME_CLOSING: 'outcome-closing',
  OUTCOME: 'outcome',
};

export function createDialogueSystem(scene, {
  gameState,
  onGameStateChange,
  onOutcomeEvent = () => false,
}) {
  const escapeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  const enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  const councilKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  const choiceKeys = [
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
  ];

  let mode = DIALOGUE_MODE.IDLE;
  let currentInteractable = null;
  let currentCharacter = null;
  let conversation = null;
  let session = null;
  let currentOutcome = null;
  let currentCouncilMember = null;
  let currentCouncilAdvice = null;
  let councilPhase = 'selection';
  let pendingNextBeat = null;
  let uiElements = null;
  let presentation = null;

  function open(interactable) {
    const character = interactable?.character;
    if (
      mode !== DIALOGUE_MODE.IDLE
      || !character?.conversation?.beats?.length
      || !canInteractWithCharacter(gameState, character.id)
    ) return;

    currentInteractable = interactable;
    currentCharacter = character;
    conversation = character.conversation;
    session = createConversationSession(
      character.id,
      conversation.initialBeat ?? conversation.beats[0].id,
    );
    mode = DIALOGUE_MODE.QUESTION;
    renderQuestion();
  }

  function replaceUi(nextUi) {
    destroyDialogueUi(uiElements);
    uiElements = nextUi;
    presentation = null;
  }

  function councilIsAvailable() {
    return canUseCouncil(
      session,
      getConversationBeatIndex(conversation, session.currentBeat),
      conversation.council,
    );
  }

  function renderQuestion(alreadyRead = false) {
    const beat = getConversationBeat(conversation, session.currentBeat);
    const beatIndex = getConversationBeatIndex(conversation, session.currentBeat);
    replaceUi(createDialogueQuestionUi(scene, {
      character: currentCharacter,
      beat,
      beatIndex,
      totalBeats: conversation.beats.length,
      councilAvailable: councilIsAvailable(),
    }));
    presentation = createDialoguePresentation([
      { speaker: currentCharacter.name, text: resolveBeatPrompt(beat, session) },
    ]);
    if (alreadyRead) presentation.complete();
    uiElements.update(presentation.current());
  }

  function selectAnswer(index) {
    const beat = getConversationBeat(conversation, session.currentBeat);
    const choice = beat.choices[index];
    if (!choice) return;

    const result = applyConversationChoice(session, beat, choice);
    session = result.session;
    pendingNextBeat = result.presentation.nextBeat;
    mode = DIALOGUE_MODE.REACTION;

    const hasNextBeat = Boolean(pendingNextBeat);
    const hasOutcome = Boolean(conversation.outcomeRules && conversation.outcomes);
    replaceUi(createDialogueReactionUi(scene, hasNextBeat || hasOutcome));
    presentation = createDialoguePresentation(
      normalizeDialogueSequence(result.presentation, currentCharacter.name),
    );
    uiElements.update(presentation.current());
  }

  function continueAfterReaction() {
    if (pendingNextBeat) {
      session = advanceConversationSession(session, pendingNextBeat);
      pendingNextBeat = null;
      mode = DIALOGUE_MODE.QUESTION;
      renderQuestion();
      return;
    }

    if (!conversation.outcomeRules || !conversation.outcomes) return;

    const outcomeId = resolveOutcome(session, conversation.outcomeRules);
    currentOutcome = conversation.outcomes[outcomeId];
    if (!currentOutcome) return;

    commitConversationOutcome(gameState, session, currentOutcome);
    onGameStateChange(gameState);

    if (currentOutcome.event?.type && currentOutcome.closingSequence?.length) {
      mode = DIALOGUE_MODE.OUTCOME_CLOSING;
      replaceUi(createDialogueReactionUi(scene, true, { canAbandon: false }));
      presentation = createDialoguePresentation(currentOutcome.closingSequence);
      uiElements.update(presentation.current());
      return;
    }

    mode = DIALOGUE_MODE.OUTCOME;
    replaceUi(createOutcomeUi(scene, currentOutcome));
  }

  function startOutcomeEvent() {
    const started = onOutcomeEvent({
      type: currentOutcome.event.type,
      characterId: currentCharacter.id,
      interactable: currentInteractable,
      outcome: currentOutcome,
    });
    if (started) {
      resetDialogue();
      return;
    }

    mode = DIALOGUE_MODE.OUTCOME;
    replaceUi(createOutcomeUi(scene, currentOutcome));
  }

  function openCouncil() {
    if (!councilIsAvailable()) return;
    currentCouncilMember = null;
    currentCouncilAdvice = null;
    councilPhase = 'selection';
    mode = DIALOGUE_MODE.COUNCIL;
    replaceUi(createCouncilSelectionUi(scene, conversation.council.members));
  }

  function selectCouncilMember(index) {
    const member = conversation.council.members[index];
    if (!member) return;
    currentCouncilMember = member;
    currentCouncilAdvice = resolveCouncilAdvice(session, member);
    session = markCouncilUsed(session, currentCouncilAdvice);
    councilPhase = 'advice';
    replaceUi(createCouncilAdviceUi(scene, member));
    presentation = createDialoguePresentation([
      { speaker: member.name, text: currentCouncilAdvice.text },
      ...(currentCouncilAdvice.tambuReaction
        ? [{ speaker: 'TAMBU', text: currentCouncilAdvice.tambuReaction }]
        : []),
    ]);
    uiElements.update(presentation.current());
  }

  function returnFromCouncil() {
    currentCouncilMember = null;
    currentCouncilAdvice = null;
    councilPhase = 'selection';
    pendingNextBeat = null;
    mode = DIALOGUE_MODE.QUESTION;
    renderQuestion(true);
  }

  function resetDialogue() {
    destroyDialogueUi(uiElements);
    uiElements = null;
    presentation = null;
    currentInteractable = null;
    currentCharacter = null;
    conversation = null;
    session = null;
    currentOutcome = null;
    currentCouncilMember = null;
    currentCouncilAdvice = null;
    councilPhase = 'selection';
    pendingNextBeat = null;
    mode = DIALOGUE_MODE.IDLE;
  }

  function readInput() {
    // Consume every edge, including disabled inputs and both advance keys.
    // Short-circuiting JustDown would leave the second key queued for another line.
    const enter = Phaser.Input.Keyboard.JustDown(enterKey);
    const space = Phaser.Input.Keyboard.JustDown(spaceKey);
    return {
      advance: enter || space,
      escape: Phaser.Input.Keyboard.JustDown(escapeKey),
      council: Phaser.Input.Keyboard.JustDown(councilKey),
      choices: choiceKeys.map((key) => Phaser.Input.Keyboard.JustDown(key)),
    };
  }

  function updateQuestion(input) {
    if (input.escape) {
      resetDialogue();
      return;
    }
    if (!presentation.isComplete()) {
      if (input.advance) presentation.complete();
      return;
    }
    if (councilIsAvailable() && input.council) {
      openCouncil();
      return;
    }

    const answerIndex = input.choices.findIndex(Boolean);
    if (answerIndex >= 0) selectAnswer(answerIndex);
  }

  function updateReaction(input) {
    if (input.escape) {
      resetDialogue();
      return;
    }
    if (input.advance && presentation.advance() === 'finished') continueAfterReaction();
  }

  function updateCouncil(input) {
    if (councilPhase === 'selection') {
      if (input.escape) {
        returnFromCouncil();
        return;
      }
      const memberIndex = input.choices
        .slice(0, conversation.council.members.length)
        .findIndex(Boolean);
      if (memberIndex >= 0) selectCouncilMember(memberIndex);
      return;
    }

    if (!input.advance) return;

    const result = presentation.advance();
    if (result === 'next') {
      councilPhase = 'tambu-reaction';
    } else if (result === 'finished') {
      returnFromCouncil();
    }
  }

  function updateOutcome(input) {
    if (input.advance) resetDialogue();
  }

  function updateOutcomeClosing(input) {
    if (input.advance && presentation.advance() === 'finished') startOutcomeEvent();
  }

  function update() {
    const input = readInput();
    if (mode === DIALOGUE_MODE.IDLE) return false;

    const previousPresentation = presentation;
    if (mode === DIALOGUE_MODE.QUESTION) updateQuestion(input);
    else if (mode === DIALOGUE_MODE.REACTION) updateReaction(input);
    else if (mode === DIALOGUE_MODE.COUNCIL) updateCouncil(input);
    else if (mode === DIALOGUE_MODE.OUTCOME_CLOSING) updateOutcomeClosing(input);
    else if (mode === DIALOGUE_MODE.OUTCOME) updateOutcome(input);

    if (presentation) {
      // New lines start empty; input always acts on what was visible last frame.
      if (presentation === previousPresentation && !input.advance) {
        presentation.update(scene.game.loop.delta);
      }
      uiElements.update(presentation.current());
    }

    return true;
  }

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, resetDialogue);

  return {
    open,
    update,
    close: resetDialogue,
    isOpen: () => mode !== DIALOGUE_MODE.IDLE,
    getMode: () => mode,
    getCouncilPhase: () => (mode === DIALOGUE_MODE.COUNCIL ? councilPhase : null),
  };
}
