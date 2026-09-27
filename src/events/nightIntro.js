import { PLAYER_CONFIG } from '../player/playerConfig.js';

export const NIGHT_INTRO_PHASES = Object.freeze({
  BLACKOUT: 'blackout',
  CLOCK_0000: 'clock-0000',
  CLOCK_0001: 'clock-0001',
  REVEAL: 'reveal',
  COMPLETE: 'complete',
});

export const NIGHT_INTRO_TIMINGS = Object.freeze({
  blackout: 200,
  clock0000: 1500,
  clock0001: 450,
  reveal: 1500,
});

const INTRO_DEPTH = 10000;
const CLOCK_FONT_SIZE = 144;
const WINDOW_TEXTURE_KEY = 'night-intro-clock-window';

function getRevealMaxScale(ctx, width, height) {
  ctx.font = `bold ${CLOCK_FONT_SIZE}px monospace`;
  const metrics = ctx.measureText('00:01');
  const textHeight = (metrics.actualBoundingBoxAscent || CLOCK_FONT_SIZE * 0.75)
    + (metrics.actualBoundingBoxDescent || CLOCK_FONT_SIZE * 0.2);

  return Math.max(width / metrics.width, height / textHeight) * 1.35;
}

function drawClockWindow(texture, width, height, progress, maxScale) {
  const ctx = texture.getContext();
  const easedProgress = progress ** 3;
  const scale = 1 + (maxScale - 1) * easedProgress;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.font = `bold ${CLOCK_FONT_SIZE}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);
  ctx.fillText('00:01', 0, 0);
  ctx.restore();
  texture.refresh();
}

function fillBlack(texture, width, height) {
  const ctx = texture.getContext();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  texture.refresh();
}

export function createNightIntro(scene, { player, hud }) {
  const { width, height } = scene.scale;
  const texture = scene.textures.createCanvas(WINDOW_TEXTURE_KEY, width, height);
  fillBlack(texture, width, height);
  const cover = scene.add.image(0, 0, WINDOW_TEXTURE_KEY)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(INTRO_DEPTH)
    .setAlpha(1);
  const clock = scene.add.text(width / 2, height / 2, '', {
    fontFamily: 'monospace',
    fontSize: `${CLOCK_FONT_SIZE}px`,
    fontStyle: 'bold',
    color: '#ffffff',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(INTRO_DEPTH + 1).setVisible(false);

  const revealMaxScale = getRevealMaxScale(texture.getContext(), width, height);
  hud.setVisible(false);
  player.label.setVisible(false);
  player.sprite.setVelocity(0, 0);

  let phase = NIGHT_INTRO_PHASES.BLACKOUT;
  let elapsed = 0;
  let disposed = false;

  function syncPlayer() {
    const { sprite, label } = player;
    const footDepth = sprite.body.bottom;
    sprite.setDepth(footDepth);
    label.setPosition(sprite.x, sprite.y + PLAYER_CONFIG.label.offsetY);
    label.setDepth(footDepth + 1);
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    cover.destroy();
    clock.destroy();
    scene.textures.remove(WINDOW_TEXTURE_KEY);
  }

  function finish() {
    phase = NIGHT_INTRO_PHASES.COMPLETE;
    player.sprite.setVelocity(0, 0);
    player.facing = 'down';
    player.sprite.play(`${PLAYER_CONFIG.sprite.key}-idle-down`, true);
    syncPlayer();
    hud.setVisible(true);
    player.label.setVisible(true);
    cleanup();
  }

  function advance() {
    elapsed = 0;
    if (phase === NIGHT_INTRO_PHASES.BLACKOUT) {
      clock.setText('00:00').setVisible(true);
      phase = NIGHT_INTRO_PHASES.CLOCK_0000;
    } else if (phase === NIGHT_INTRO_PHASES.CLOCK_0000) {
      clock.setText('00:01');
      phase = NIGHT_INTRO_PHASES.CLOCK_0001;
    } else if (phase === NIGHT_INTRO_PHASES.CLOCK_0001) {
      drawClockWindow(texture, width, height, 0, revealMaxScale);
      clock.setVisible(false);
      phase = NIGHT_INTRO_PHASES.REVEAL;
    } else if (phase === NIGHT_INTRO_PHASES.REVEAL) {
      finish();
    }
  }

  function update(deltaMs) {
    if (phase === NIGHT_INTRO_PHASES.COMPLETE) return;
    let remaining = Math.max(0, deltaMs);

    while (remaining > 0 && phase !== NIGHT_INTRO_PHASES.COMPLETE) {
      const duration = {
        [NIGHT_INTRO_PHASES.BLACKOUT]: NIGHT_INTRO_TIMINGS.blackout,
        [NIGHT_INTRO_PHASES.CLOCK_0000]: NIGHT_INTRO_TIMINGS.clock0000,
        [NIGHT_INTRO_PHASES.CLOCK_0001]: NIGHT_INTRO_TIMINGS.clock0001,
        [NIGHT_INTRO_PHASES.REVEAL]: NIGHT_INTRO_TIMINGS.reveal,
      }[phase];
      const step = Math.min(remaining, duration - elapsed);
      elapsed += step;
      remaining -= step;

      if (phase === NIGHT_INTRO_PHASES.REVEAL && elapsed < duration) {
        drawClockWindow(texture, width, height, elapsed / duration, revealMaxScale);
      }
      if (elapsed >= duration) advance();
    }
  }

  function destroy() {
    if (phase !== NIGHT_INTRO_PHASES.COMPLETE) finish();
    else cleanup();
  }

  return {
    update,
    destroy,
    getPhase: () => phase,
    isComplete: () => phase === NIGHT_INTRO_PHASES.COMPLETE,
  };
}
