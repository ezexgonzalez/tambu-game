import { playCamiIdle, playCamiWalk, setCamiDepth } from '../characters/camiSprite.js';
import { playMiliIdle, playMiliWalk, setMiliDepth } from '../characters/miliSprite.js';
import { playSofiIdle, playSofiWalk, setSofiDepth } from '../characters/sofiSprite.js';

function setPosition(target, x, y) {
  if (target?.setPosition) target.setPosition(x, y);
  else if (target) {
    target.x = x;
    target.y = y;
  }
}

function updateWalk(interactable, destination) {
  if (interactable.visual === 'sofi-sprite') {
    playSofiWalk(interactable.sprite, destination);
    setSofiDepth(interactable.sprite);
  } else if (interactable.visual === 'mili-sprite') {
    playMiliWalk(interactable.sprite, destination);
    setMiliDepth(interactable.sprite);
  } else if (interactable.visual === 'cami-sprite') {
    playCamiWalk(interactable.sprite, destination);
    setCamiDepth(interactable.sprite);
  }
}

function updateIdle(interactable, direction = 'down') {
  if (interactable.visual === 'sofi-sprite') {
    playSofiIdle(interactable.sprite, direction);
    setSofiDepth(interactable.sprite);
  } else if (interactable.visual === 'mili-sprite') {
    playMiliIdle(interactable.sprite, direction);
    setMiliDepth(interactable.sprite);
  } else if (interactable.visual === 'cami-sprite') {
    playCamiIdle(interactable.sprite, direction);
    setCamiDepth(interactable.sprite);
  }
}

export function createResolvedCharacterReturnSystem(layout) {
  const returning = new Map();

  function finishReturn(characterId, task) {
    const { sprite, label, marker } = task.interactable;
    updateIdle(task.interactable, 'down');
    task.interactable.isRelocating = false;
    label?.setPosition?.(sprite.x, sprite.y + 36);
    label?.setDepth?.((sprite.depth ?? sprite.y) + 1);
    marker?.setVisible?.(false);
    returning.delete(characterId);
  }

  function start(interactable) {
    const characterId = interactable.character?.id
      ?? interactable.visual?.replace(/-sprite$/, '');
    const path = layout.returnPaths?.[characterId];
    if (!path?.length || returning.has(characterId)) return false;

    interactable.isRelocating = true;
    interactable.marker?.setVisible?.(false);
    returning.set(characterId, { interactable, path, pathIndex: 0 });
    return true;
  }

  function update(deltaMs) {
    const distance = layout.speed * Math.max(0, Math.min(deltaMs, 50)) / 1000;

    for (const [characterId, task] of returning) {
      const { sprite } = task.interactable;
      const destination = task.path[task.pathIndex];
      const dx = destination.x - sprite.x;
      const dy = destination.y - sprite.y;
      const remaining = Math.hypot(dx, dy);

      updateWalk(task.interactable, destination);
      if (remaining <= distance || remaining < 0.001) {
        setPosition(sprite, destination.x, destination.y);
        task.pathIndex += 1;
        if (task.pathIndex >= task.path.length) {
          finishReturn(characterId, task);
          continue;
        }
      } else if (distance > 0) {
        setPosition(sprite,
          sprite.x + (dx / remaining) * distance,
          sprite.y + (dy / remaining) * distance);
      }

      const depthSetter = task.interactable.visual === 'sofi-sprite'
        ? setSofiDepth
        : task.interactable.visual === 'mili-sprite'
          ? setMiliDepth
          : setCamiDepth;
      depthSetter(sprite);
      task.interactable.label?.setPosition?.(sprite.x, sprite.y + 36);
      task.interactable.label?.setDepth?.((sprite.depth ?? sprite.y) + 1);
    }
  }

  function destroy() {
    for (const task of returning.values()) task.interactable.isRelocating = false;
    returning.clear();
  }

  return {
    start,
    update,
    destroy,
    isReturning: (characterId) => returning.has(characterId),
  };
}
