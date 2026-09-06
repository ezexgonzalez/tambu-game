import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../player/playerConfig.js';
import {
  BATHROOM_RESISTANCE_CONFIG,
  advanceBathroomResistance,
  createBathroomResistanceState,
  recoverBathroomResistance,
} from './bathroomResistance.js';
import {
  createBathroomAnticipationUi,
  createBathroomResistanceUi,
  createBathroomResolutionUi,
  createOutcomeEventUi,
  destroyEventUi,
} from '../ui/eventUi.js';

function setPosition(target, x, y) {
  if (target.setPosition) target.setPosition(x, y);
  else {
    target.x = x;
    target.y = y;
  }
}

function setVisible(target, visible) {
  target?.setVisible?.(visible);
}

function moveToward(target, destination, distance) {
  const dx = destination.x - target.x;
  const dy = destination.y - target.y;
  const remaining = Math.hypot(dx, dy);
  if (remaining <= distance || remaining === 0) {
    setPosition(target, destination.x, destination.y);
    return true;
  }
  setPosition(
    target,
    target.x + (dx / remaining) * distance,
    target.y + (dy / remaining) * distance,
  );
  return false;
}

function updatePlayerAnimation(player, destination) {
  const dx = destination.x - player.sprite.x;
  const dy = destination.y - player.sprite.y;
  if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right' : 'left';
  else if (Math.abs(dy) > 0.5) player.facing = dy > 0 ? 'down' : 'up';

  const animation = `${PLAYER_CONFIG.sprite.key}-walk-${player.facing}`;
  if (player.sprite.anims?.currentAnim?.key !== animation) player.sprite.play?.(animation, true);
}

export function createBathroomEvent(scene, {
  player,
  interactable,
  outcome,
  layout,
  resistanceConfig = BATHROOM_RESISTANCE_CONFIG,
}) {
  if (!player?.sprite || !interactable?.sprite || !outcome || !layout?.path?.length) return null;

  const enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  const npc = interactable.sprite;
  const bodyWasEnabled = player.sprite.body?.enable ?? true;
  const originalPlayerPosition = { x: player.sprite.x, y: player.sprite.y };
  const originalNpc = {
    x: npc.x,
    y: npc.y,
    visible: npc.visible,
    labelVisible: interactable.label?.visible,
    markerVisible: interactable.marker?.visible,
  };
  let pathIndex = 0;
  let mode = 'walking';
  let uiElements = null;
  let anticipationElapsedMs = 0;
  let anticipationBeatIndex = 0;
  let resistanceState = null;
  let outsideText = '';
  let destroyed = false;

  player.sprite.setVelocity?.(0, 0);
  if (player.sprite.body) player.sprite.body.enable = false;
  setVisible(interactable.label, false);
  setVisible(interactable.marker, false);

  function updateLabels() {
    player.label?.setPosition?.(
      player.sprite.x,
      player.sprite.y + PLAYER_CONFIG.label.offsetY,
    );
  }

  function enterBathroom() {
    mode = 'bathroom-achieved';
    player.sprite.setVelocity?.(0, 0);
    setVisible(player.sprite, false);
    setVisible(player.label, false);
    setVisible(npc, false);
    uiElements = createOutcomeEventUi(scene, outcome);
  }

  function restorePlayer(position = layout.exit) {
    setPosition(player.sprite, position.x, position.y);
    player.sprite.body?.reset?.(position.x, position.y);
    if (player.sprite.body) player.sprite.body.enable = bodyWasEnabled;
    player.sprite.setVelocity?.(0, 0);
    player.facing = 'down';
    player.sprite.play?.(`${PLAYER_CONFIG.sprite.key}-idle-down`, true);
    setVisible(player.sprite, true);
    setVisible(player.label, true);
    updateLabels();
  }

  function finish() {
    restorePlayer();
    destroyEventUi(uiElements);
    uiElements = null;
    mode = 'complete';
    return false;
  }

  function updateWalking() {
    const point = layout.path[pathIndex];
    const playerTarget = { x: point.x - layout.actorSpacing, y: point.y };
    const npcTarget = { x: point.x + layout.actorSpacing, y: point.y };
    const distance = layout.speed * Math.max(0, Math.min(scene.game.loop.delta, 50)) / 1000;

    updatePlayerAnimation(player, playerTarget);
    const playerArrived = moveToward(player.sprite, playerTarget, distance);
    const npcArrived = moveToward(npc, npcTarget, distance);
    npc.setDepth?.(npc.y);
    updateLabels();

    if (!playerArrived || !npcArrived) return true;
    pathIndex += 1;
    if (pathIndex >= layout.path.length) enterBathroom();
    return true;
  }

  function startAnticipation() {
    destroyEventUi(uiElements);
    uiElements = createBathroomAnticipationUi(scene);
    uiElements.update('');
    anticipationElapsedMs = 0;
    anticipationBeatIndex = 0;
    mode = 'anticipation';
  }

  function startResistance() {
    destroyEventUi(uiElements);
    resistanceState = createBathroomResistanceState(resistanceConfig);
    outsideText = '';
    uiElements = createBathroomResistanceUi(scene, resistanceConfig);
    uiElements.update({ state: resistanceState, outsideText });
    mode = 'resistance';
  }

  function updateAnticipation() {
    anticipationElapsedMs += Math.max(0, scene.game.loop.delta);
    const beats = resistanceConfig.anticipation.beats;
    while (
      anticipationBeatIndex < beats.length
      && beats[anticipationBeatIndex].at <= anticipationElapsedMs
    ) {
      uiElements.update(beats[anticipationBeatIndex].text);
      anticipationBeatIndex += 1;
    }
    if (anticipationElapsedMs >= resistanceConfig.anticipation.durationMs) startResistance();
    return true;
  }

  function showResistanceResolution(result) {
    destroyEventUi(uiElements);
    uiElements = createBathroomResolutionUi(scene, result);
    mode = result;
  }

  function updateResistance() {
    const space = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (space) resistanceState = recoverBathroomResistance(resistanceState, resistanceConfig);

    const update = advanceBathroomResistance(
      resistanceState,
      Math.max(0, scene.game.loop.delta),
      resistanceConfig,
    );
    resistanceState = update.state;
    const hit = update.hits.at(-1);
    if (hit) {
      outsideText = hit.text;
      scene.cameras?.main?.shake?.(80, 0.002);
    }
    uiElements.update({
      state: resistanceState,
      outsideText,
      feedback: hit ? 'hit' : space ? 'recover' : 'idle',
    });

    if (resistanceState.status !== 'active') showResistanceResolution(resistanceState.status);
    return true;
  }

  function updateBathroomAchieved() {
    const enter = Phaser.Input.Keyboard.JustDown(enterKey);
    const space = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (enter || space) startAnticipation();
    return true;
  }

  function updateResolution() {
    const enter = Phaser.Input.Keyboard.JustDown(enterKey);
    if (enter) return finish();
    return true;
  }

  function update() {
    if (mode === 'walking') return updateWalking();
    if (mode === 'bathroom-achieved') return updateBathroomAchieved();
    if (mode === 'anticipation') return updateAnticipation();
    if (mode === 'resistance') return updateResistance();
    if (mode === 'success' || mode === 'failure') return updateResolution();
    return false;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    destroyEventUi(uiElements);
    uiElements = null;

    if (mode === 'walking') {
      restorePlayer(originalPlayerPosition);
      setPosition(npc, originalNpc.x, originalNpc.y);
      setVisible(npc, originalNpc.visible);
      setVisible(interactable.label, originalNpc.labelVisible);
      setVisible(interactable.marker, originalNpc.markerVisible);
    } else if (mode !== 'complete') {
      restorePlayer();
    }
  }

  return {
    update,
    destroy,
    getMode: () => mode,
    getResistanceState: () => resistanceState,
  };
}
