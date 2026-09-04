import Phaser from 'phaser';
import {
  createDialogueOptionsUi,
  createDialogueReactionUi,
  destroyDialogueUi,
} from '../ui/dialogueUi.js';

export function createDialogueSystem(scene) {
  const escapeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  const choiceKeys = [
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
  ];

  let dialogueOpen = false;
  let currentCharacter = null;
  let uiElements = null;

  function open(interactable) {
    if (!interactable || dialogueOpen) return;
    dialogueOpen = true;
    currentCharacter = interactable.character;
    uiElements = createDialogueOptionsUi(scene, currentCharacter);
  }

  function resolve(index) {
    if (!dialogueOpen || !currentCharacter) return;
    const character = currentCharacter;
    const reaction = character.reactions[index] ?? '...';
    destroyDialogueUi(uiElements);
    uiElements = createDialogueReactionUi(scene, character, reaction);
    currentCharacter = null;
  }

  function close() {
    if (!dialogueOpen) return;
    destroyDialogueUi(uiElements);
    uiElements = null;
    currentCharacter = null;
    dialogueOpen = false;
  }

  function update() {
    if (!dialogueOpen) return false;

    if (Phaser.Input.Keyboard.JustDown(escapeKey)) {
      close();
      return true;
    }

    choiceKeys.forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(key) && currentCharacter) resolve(index);
    });
    return true;
  }

  return { open, update, close, isOpen: () => dialogueOpen };
}
