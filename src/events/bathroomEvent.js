import Phaser from 'phaser';
import { BATHROOM_DOOR_STAGING, createBathroomCameraStaging, createBathroomDoorImpact } from './bathroomDoorStaging.js';
import { getBathroomReactionTimeline } from './bathroomReactionTimeline.js';
import { getBathroomResistanceNarrative } from '../data/bathroomResistanceNarrative.js';
import { playCamiIdle, playCamiWalk, setCamiDepth } from '../characters/camiSprite.js';
import { playMiliIdle, playMiliWalk, setMiliDepth } from '../characters/miliSprite.js';
import { PLAYER_CONFIG } from '../player/playerConfig.js';
import { playSofiIdle, playSofiWalk, setSofiDepth } from '../characters/sofiSprite.js';
import {
  advanceBathroomResistance,
  createBathroomResistanceState,
  getBathroomResistanceConfig,
  recoverBathroomResistance,
} from './bathroomResistance.js';
import {
  createBathroomChallengeUi,
  createOutcomeEventUi,
  destroyEventUi,
} from '../ui/eventUi.js';

function setPosition(target, x, y) {
  if (!target) return;
  if (target.setPosition) target.setPosition(x, y);
  else {
    target.x = x;
    target.y = y;
  }
}

function setVisible(target, visible) {
  target?.setVisible?.(visible);
}

function getBathroomRoute(layout, interactable) {
  const characterId = interactable.character?.id
    ?? interactable.visual?.replace(/-sprite$/, '');
  const entryPath = layout.entryPaths?.[characterId];
  if (!entryPath?.length || !layout.commonPath?.length) return null;
  return [...entryPath, ...layout.commonPath];
}

export function getBathroomFormationOffset(path, index, spacing) {
  if (path[index].formation === 'lateral') return { x: spacing, y: 0 };
  const from = path[index];
  const to = path[index + 1] ?? path[index - 1];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (!length) return { x: spacing, y: 0 };
  return { x: (-dy / length) * spacing, y: (dx / length) * spacing };
}

function moveTogether(playerSprite, npcSprite, playerTarget, npcTarget, distance) {
  const playerRemaining = Math.hypot(playerTarget.x - playerSprite.x, playerTarget.y - playerSprite.y);
  const npcRemaining = Math.hypot(npcTarget.x - npcSprite.x, npcTarget.y - npcSprite.y);
  const fraction = Math.min(1, distance / Math.max(playerRemaining, npcRemaining, 0.001));
  for (const [sprite, target] of [[playerSprite, playerTarget], [npcSprite, npcTarget]]) {
    setPosition(sprite, sprite.x + (target.x - sprite.x) * fraction,
      sprite.y + (target.y - sprite.y) * fraction);
  }
  return fraction === 1;
}

function updatePlayerAnimation(player, destination) {
  const dx = destination.x - player.sprite.x;
  const dy = destination.y - player.sprite.y;
  if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right' : 'left';
  else if (Math.abs(dy) > 0.5) player.facing = dy > 0 ? 'down' : 'up';

  const animation = `${PLAYER_CONFIG.sprite.key}-walk-${player.facing}`;
  if (player.sprite.anims?.currentAnim?.key !== animation) player.sprite.play?.(animation, true);
}

function updateNpcVisual(interactable, destination) {
  if (interactable.visual === 'sofi-sprite') {
    playSofiWalk(interactable.sprite, destination);
    setSofiDepth(interactable.sprite);
    return;
  }

  if (interactable.visual === 'mili-sprite') {
    playMiliWalk(interactable.sprite, destination);
    setMiliDepth(interactable.sprite);
    return;
  }

  if (interactable.visual === 'cami-sprite') {
    playCamiWalk(interactable.sprite, destination);
    setCamiDepth(interactable.sprite);
  }
}

function idleNpcVisual(interactable) {
  if (interactable.visual === 'sofi-sprite') {
    playSofiIdle(interactable.sprite);
    setSofiDepth(interactable.sprite);
    return;
  }

  if (interactable.visual === 'mili-sprite') {
    playMiliIdle(interactable.sprite);
    setMiliDepth(interactable.sprite);
    return;
  }

  if (interactable.visual === 'cami-sprite') {
    playCamiIdle(interactable.sprite);
    setCamiDepth(interactable.sprite);
  }
}

export function createBathroomEvent(scene, {
  player,
  interactable,
  outcome,
  layout,
  bathroomDoor,
  bathroomBounds,
  worldBounds,
  onCompanionReturn = () => {},
  onBathroomResolved = () => false,
  resistanceConfig = getBathroomResistanceConfig(1),
  narrative = getBathroomResistanceNarrative(),
}) {
  if (!player?.sprite || !interactable?.sprite || !outcome || !layout) return null;
  const path = getBathroomRoute(layout, interactable);
  if (!path) return null;

  const enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  const npc = interactable.sprite;
  const characterId = interactable.character?.id
    ?? interactable.visual?.replace(/-sprite$/, '');
  const bodyWasEnabled = player.sprite.body?.enable ?? true;
  // Physics is disabled during this scripted walk, so carry its real bottom offset with sprite.y.
  const playerFootDepthOffset = Number.isFinite(player.sprite.body?.bottom)
    ? player.sprite.body.bottom - player.sprite.y
    : 0;
  const originalPlayerPosition = { x: player.sprite.x, y: player.sprite.y };
  const originalNpc = {
    x: npc.x,
    y: npc.y,
    visible: npc.visible,
    labelVisible: interactable.label?.visible,
  };
  let pathIndex = 0;
  let mode = 'walking';
  let uiElements = null;
  let anticipationElapsedMs = 0;
  let anticipationBeatIndex = 0;
  let anticipationImpactIndex = 0;
  let reactionIndex = 0;
  let resolutionElapsedMs = 0;
  let resolutionReady = false;
  let cameraStaging = null;
  const doorImpact = createBathroomDoorImpact(bathroomDoor);
  const reactionTimeline = getBathroomReactionTimeline(narrative, resistanceConfig);
  let resistanceState = null;
  let presentation = null;
  let destroyed = false;

  player.sprite.setVelocity?.(0, 0);
  if (player.sprite.body) player.sprite.body.enable = false;
  setVisible(interactable.label, false);
  setVisible(interactable.marker, false);

  function updateLabels() {
    const footDepth = player.sprite.y + playerFootDepthOffset;
    player.sprite.setDepth?.(footDepth);
    player.label?.setPosition?.(
      player.sprite.x,
      player.sprite.y + PLAYER_CONFIG.label.offsetY,
    );
    player.label?.setDepth?.(footDepth + 1);
  }

  function enterBathroom() {
    mode = 'bathroom-achieved';
    player.sprite.setVelocity?.(0, 0);
    idleNpcVisual(interactable);
    setVisible(player.sprite, false);
    setVisible(player.label, false);
    setVisible(npc, false);
    uiElements = createOutcomeEventUi(scene, outcome);
  }

  function restorePlayer(position = layout.safeExit) {
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

  function restoreCompanion(position = layout.companionSafeExit) {
    setPosition(npc, position.x, position.y);
    idleNpcVisual(interactable);
    setVisible(npc, true);
    setPosition(interactable.label, npc.x, npc.y + 36);
    interactable.label?.setDepth?.((npc.depth ?? npc.y) + 1);
    setVisible(interactable.label, true);
    setVisible(interactable.marker, false);
  }

  function finish() {
    cameraStaging?.destroy();
    doorImpact.destroy();
    scene.events?.off?.('shutdown', destroy);
    restorePlayer();
    restoreCompanion();
    onCompanionReturn(interactable);
    destroyEventUi(uiElements);
    uiElements = null;
    mode = 'complete';
    return false;
  }

  function updateWalking() {
    const point = path[pathIndex];
    const offset = getBathroomFormationOffset(path, pathIndex, layout.actorSpacing);
    const playerTarget = { x: point.x - offset.x, y: point.y - offset.y };
    const npcTarget = { x: point.x + offset.x, y: point.y + offset.y };
    const distance = layout.speed * Math.max(0, Math.min(scene.game.loop.delta, 50)) / 1000;

    updatePlayerAnimation(player, playerTarget);
    updateNpcVisual(interactable, npcTarget);
    const bothArrived = moveTogether(player.sprite, npc, playerTarget, npcTarget, distance);
    updateNpcVisual(interactable, npcTarget);
    updateLabels();

    if (!bothArrived) return true;
    pathIndex += 1;
    if (pathIndex >= path.length) enterBathroom();
    return true;
  }

  function startAnticipation() {
    destroyEventUi(uiElements);
    uiElements = createBathroomChallengeUi(scene, resistanceConfig);
    cameraStaging = createBathroomCameraStaging(scene.cameras?.main, bathroomBounds, worldBounds);
    anticipationElapsedMs = 0;
    anticipationBeatIndex = 0;
    anticipationImpactIndex = 0;
    mode = 'anticipation';
  }

  function startResistance() {
    cameraStaging?.hold();
    resistanceState = createBathroomResistanceState(resistanceConfig);
    uiElements.startResistance(presentation);
    uiElements.update({ state: resistanceState, presentation });
    mode = 'resistance';
  }

  function updateAnticipation() {
    Phaser.Input.Keyboard.JustDown(enterKey);
    Phaser.Input.Keyboard.JustDown(spaceKey);
    anticipationElapsedMs += Math.max(0, scene.game.loop.delta);
    cameraStaging.update(anticipationElapsedMs);
    while (anticipationImpactIndex < BATHROOM_DOOR_STAGING.impacts.length
      && BATHROOM_DOOR_STAGING.impacts[anticipationImpactIndex] <= anticipationElapsedMs) {
      doorImpact.trigger();
      anticipationImpactIndex += 1;
    }
    while (anticipationBeatIndex < narrative.anticipation.length
      && BATHROOM_DOOR_STAGING.spokenAt[anticipationBeatIndex] <= anticipationElapsedMs) {
      const beat = narrative.anticipation[anticipationBeatIndex++];
      if (beat.speaker) { presentation = beat; uiElements.showReaction(beat); }
    }
    if (anticipationElapsedMs >= BATHROOM_DOOR_STAGING.durationMs) startResistance();
    return true;
  }

  function showResistanceResolution(result) {
    cameraStaging?.restore();
    const rewardSettled = onBathroomResolved({ characterId, result }) === true;
    uiElements.showResolution(result, { rewardSettled, reaction: narrative.resolution[result] });
    resolutionElapsedMs = 0;
    resolutionReady = false;
    mode = result;
  }

  function updateResistance() {
    Phaser.Input.Keyboard.JustDown(enterKey);
    const space = Phaser.Input.Keyboard.JustDown(spaceKey);
    if (space) resistanceState = recoverBathroomResistance(resistanceState, resistanceConfig);
    const update = advanceBathroomResistance(resistanceState,
      Math.max(0, scene.game.loop.delta), resistanceConfig);
    resistanceState = update.state;
    for (const hit of update.hits) {
      doorImpact.trigger();
      scene.cameras?.main?.shake?.(80, 0.002);
    }
    while (reactionIndex < reactionTimeline.length
      && reactionTimeline[reactionIndex].at <= resistanceState.elapsedMs) {
      presentation = reactionTimeline[reactionIndex++].reaction;
    }
    uiElements.update({ state: resistanceState, presentation,
      feedback: update.hits.length ? 'hit' : space ? 'recover' : 'idle' });
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
    Phaser.Input.Keyboard.JustDown(spaceKey);
    const wasReady = resolutionReady;
    resolutionElapsedMs += Math.max(0, scene.game.loop.delta);
    if (!resolutionReady && resolutionElapsedMs >= 900) {
      resolutionReady = true;
      uiElements.setReady();
    }
    // Consume the input on the enabling frame too; a fresh press returns to the patio.
    if (wasReady && enter) return finish();
    return true;
  }

  function update() {
    if (destroyed) return false;
    doorImpact.update(scene.game.loop.delta);
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
    cameraStaging?.destroy();
    doorImpact.destroy();
    scene.events?.off?.('shutdown', destroy);
    destroyEventUi(uiElements);
    uiElements = null;

    if (mode === 'walking') {
      restorePlayer(originalPlayerPosition);
      setPosition(npc, originalNpc.x, originalNpc.y);
      idleNpcVisual(interactable);
      setVisible(npc, originalNpc.visible);
      setPosition(interactable.label, originalNpc.x, originalNpc.y + 36);
      setVisible(interactable.label, originalNpc.labelVisible);
      setVisible(interactable.marker, false);
    } else if (mode !== 'complete') {
      restorePlayer();
      restoreCompanion();
    }
  }

  scene.events?.once?.('shutdown', destroy);
  return {
    update,
    destroy,
    getMode: () => mode,
    getResistanceState: () => resistanceState,
  };
}
