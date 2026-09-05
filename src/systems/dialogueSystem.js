import Phaser from 'phaser';
import { canInteractWithCharacter, commitConversationOutcome } from '../state/gameState.js';
import {
  applySocialEffects,
  createConversationSession,
  resolveContextualAdvice,
  resolveOutcome,
} from './socialSystem.js';
import {
  createCouncilAdviceUi,
  createCouncilSelectionUi,
  createDialogueQuestionUi,
  createDialogueReactionUi,
  createOutcomeUi,
  destroyDialogueUi,
} from '../ui/dialogueUi.js';

const DIALOGUE_MODE = {
  IDLE: 'idle',
  QUESTION: 'question',
  REACTION: 'reaction',
  COUNCIL: 'council',
  OUTCOME: 'outcome',
};

export function createDialogueSystem(scene, { gameState, onGameStateChange }) {
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
  let currentCharacter = null;
  let conversation = null;
  let session = null;
  let currentCouncilMember = null;
  let uiElements = null;

  function open(interactable) {
    const character = interactable?.character;
    if (
      mode !== DIALOGUE_MODE.IDLE
      || !character?.conversation?.rounds?.length
      || !canInteractWithCharacter(gameState, character.id)
    ) return;

    currentCharacter = character;
    conversation = character.conversation;
    session = createConversationSession(character.id);
    mode = DIALOGUE_MODE.QUESTION;
    renderQuestion();
  }

  function replaceUi(nextUi) {
    destroyDialogueUi(uiElements);
    uiElements = nextUi;
  }

  function councilIsAvailable() {
    return Boolean(
      conversation.council
      && session.roundIndex >= conversation.council.availableFromRound
      && !session.councilUsed,
    );
  }

  function renderQuestion() {
    replaceUi(createDialogueQuestionUi(scene, {
      character: currentCharacter,
      round: conversation.rounds[session.roundIndex],
      roundIndex: session.roundIndex,
      totalRounds: conversation.rounds.length,
      councilAvailable: councilIsAvailable(),
    }));
  }

  function selectAnswer(index) {
    const round = conversation.rounds[session.roundIndex];
    const answer = round.answers[index];
    if (!answer) return;

    session.stats = applySocialEffects(session.stats, answer.effects);
    mode = DIALOGUE_MODE.REACTION;

    const hasNextRound = session.roundIndex < conversation.rounds.length - 1;
    const hasOutcome = Boolean(conversation.outcomeRules && conversation.outcomes);
    replaceUi(createDialogueReactionUi(
      scene,
      currentCharacter,
      answer.reaction,
      hasNextRound || hasOutcome,
    ));
  }

  function continueAfterReaction() {
    if (session.roundIndex < conversation.rounds.length - 1) {
      session.roundIndex += 1;
      mode = DIALOGUE_MODE.QUESTION;
      renderQuestion();
      return;
    }

    if (!conversation.outcomeRules || !conversation.outcomes) return;

    const outcomeId = resolveOutcome(session.stats, conversation.outcomeRules);
    const outcome = conversation.outcomes[outcomeId];
    if (!outcome) return;

    commitConversationOutcome(gameState, session, outcome);
    onGameStateChange(gameState);
    mode = DIALOGUE_MODE.OUTCOME;
    replaceUi(createOutcomeUi(scene, outcome));
  }

  function openCouncil() {
    if (!councilIsAvailable()) return;
    session.councilUsed = true;
    currentCouncilMember = null;
    mode = DIALOGUE_MODE.COUNCIL;
    replaceUi(createCouncilSelectionUi(scene, conversation.council.members));
  }

  function selectCouncilMember(index) {
    const member = conversation.council.members[index];
    if (!member) return;
    currentCouncilMember = member;
    const advice = resolveContextualAdvice(session.stats, member.advice);
    replaceUi(createCouncilAdviceUi(scene, member, advice));
  }

  function returnFromCouncil() {
    currentCouncilMember = null;
    mode = DIALOGUE_MODE.QUESTION;
    renderQuestion();
  }

  function resetDialogue() {
    destroyDialogueUi(uiElements);
    uiElements = null;
    currentCharacter = null;
    conversation = null;
    session = null;
    currentCouncilMember = null;
    mode = DIALOGUE_MODE.IDLE;
  }

  function advancePressed() {
    return Phaser.Input.Keyboard.JustDown(enterKey)
      || Phaser.Input.Keyboard.JustDown(spaceKey);
  }

  function updateQuestion() {
    if (Phaser.Input.Keyboard.JustDown(escapeKey)) {
      resetDialogue();
      return;
    }
    if (councilIsAvailable() && Phaser.Input.Keyboard.JustDown(councilKey)) {
      openCouncil();
      return;
    }

    const answerIndex = choiceKeys.findIndex((key) => Phaser.Input.Keyboard.JustDown(key));
    if (answerIndex >= 0) selectAnswer(answerIndex);
  }

  function updateReaction() {
    if (Phaser.Input.Keyboard.JustDown(escapeKey)) {
      resetDialogue();
      return;
    }
    if (advancePressed()) continueAfterReaction();
  }

  function updateCouncil() {
    if (!currentCouncilMember) {
      if (Phaser.Input.Keyboard.JustDown(escapeKey)) {
        returnFromCouncil();
        return;
      }
      const memberIndex = choiceKeys
        .slice(0, conversation.council.members.length)
        .findIndex((key) => Phaser.Input.Keyboard.JustDown(key));
      if (memberIndex >= 0) selectCouncilMember(memberIndex);
      return;
    }

    if (advancePressed()) returnFromCouncil();
  }

  function updateOutcome() {
    if (advancePressed()) resetDialogue();
  }

  function update() {
    if (mode === DIALOGUE_MODE.IDLE) return false;

    if (mode === DIALOGUE_MODE.QUESTION) updateQuestion();
    else if (mode === DIALOGUE_MODE.REACTION) updateReaction();
    else if (mode === DIALOGUE_MODE.COUNCIL) updateCouncil();
    else if (mode === DIALOGUE_MODE.OUTCOME) updateOutcome();

    return true;
  }

  return {
    open,
    update,
    close: resetDialogue,
    isOpen: () => mode !== DIALOGUE_MODE.IDLE,
    getMode: () => mode,
  };
}
