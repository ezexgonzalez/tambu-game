import Phaser from 'phaser';

const INTERACTION_DISTANCE = 82;

export function createInteractionSystem({ scene, player, interactables, prompt, onInteract }) {
  const interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

  function findNearestInteractable() {
    let nearest = null;
    let bestDistance = Infinity;

    interactables.forEach((interactable) => {
      const distance = Phaser.Math.Distance.Between(
        player.x,
        player.y,
        interactable.sprite.x,
        interactable.sprite.y,
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = interactable;
      }
    });

    return bestDistance <= INTERACTION_DISTANCE ? nearest : null;
  }

  function update() {
    const nearest = findNearestInteractable();
    if (!nearest) {
      prompt.setVisible(false);
      return;
    }

    prompt
      .setText(`E · HABLAR CON ${nearest.character.name.toUpperCase()}`)
      .setVisible(true);

    if (Phaser.Input.Keyboard.JustDown(interactKey)) onInteract(nearest);
  }

  return {
    update,
    hidePrompt: () => prompt.setVisible(false),
  };
}
