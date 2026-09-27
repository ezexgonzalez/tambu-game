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
const WINDOW_TEXTURE_KEY = 'night-intro-clock-window';
const CLOCK_TEXTURE_KEY = 'night-intro-clock-pixels';
const CLOCK_TRANSITION_MS = 180;
const CLOCK_CELL_SIZE = 14;
const CLOCK_PIXEL_INSET = 2;
const CLOCK_GLYPH_WIDTH = 5;
const CLOCK_GLYPH_HEIGHT = 7;
const CLOCK_GLYPH_GAP = 1;

const CLOCK_GLYPHS = Object.freeze({
  '0': [
    '01110',
    '11011',
    '11011',
    '11011',
    '11011',
    '11011',
    '01110',
  ],
  '1': [
    '00110',
    '01110',
    '00110',
    '00110',
    '00110',
    '00110',
    '01111',
  ],
  ':': [
    '00000',
    '00100',
    '00100',
    '00000',
    '00100',
    '00100',
    '00000',
  ],
});

function getClockBounds(text) {
  const columns = text.length * CLOCK_GLYPH_WIDTH + (text.length - 1) * CLOCK_GLYPH_GAP;
  return {
    width: columns * CLOCK_CELL_SIZE,
    height: CLOCK_GLYPH_HEIGHT * CLOCK_CELL_SIZE,
  };
}

function drawPixelClock(ctx, text, width, height, scale, compositeOperation) {
  const { width: clockWidth, height: clockHeight } = getClockBounds(text);
  const left = -clockWidth / 2;
  const top = -clockHeight / 2;

  ctx.save();
  ctx.globalCompositeOperation = compositeOperation;
  ctx.fillStyle = '#ffffff';
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
    const glyph = CLOCK_GLYPHS[text[charIndex]];
    const glyphOffset = charIndex * (CLOCK_GLYPH_WIDTH + CLOCK_GLYPH_GAP);

    for (let row = 0; row < CLOCK_GLYPH_HEIGHT; row += 1) {
      for (let column = 0; column < CLOCK_GLYPH_WIDTH; column += 1) {
        if (glyph[row][column] !== '1') continue;
        const x = Math.round(left + (glyphOffset + column) * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET);
        const y = Math.round(top + row * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET);
        ctx.fillRect(x, y, CLOCK_CELL_SIZE - CLOCK_PIXEL_INSET * 2, CLOCK_CELL_SIZE - CLOCK_PIXEL_INSET * 2);
      }
    }
  }

  ctx.restore();
}

function getRevealMaxScale(width, height) {
  const { width: clockWidth, height: clockHeight } = getClockBounds('00:01');
  return Math.max(width / clockWidth, height / clockHeight) * 1.35;
}

function clearCanvas(texture, width, height) {
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, width, height);
  texture.refresh();
}

function drawClockText(texture, text, width, height) {
  clearCanvas(texture, width, height);
  drawPixelClock(texture.getContext(), text, width, height, 1, 'source-over');
  texture.refresh();
}

function drawClockWindow(texture, width, height, progress, maxScale) {
  const ctx = texture.getContext();
  const scale = 1 + (maxScale - 1) * progress ** 3;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  drawPixelClock(ctx, '00:01', width, height, scale, 'destination-out');
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
  const windowTexture = scene.textures.createCanvas(WINDOW_TEXTURE_KEY, width, height);
  fillBlack(windowTexture, width, height);
  const clockTexture = scene.textures.createCanvas(CLOCK_TEXTURE_KEY, width, height);

  const cover = scene.add.image(0, 0, WINDOW_TEXTURE_KEY)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(INTRO_DEPTH)
    .setAlpha(1);
  const clock = scene.add.image(0, 0, CLOCK_TEXTURE_KEY)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(INTRO_DEPTH + 1)
    .setAlpha(1)
    .setVisible(false);

  const revealMaxScale = getRevealMaxScale(width, height);
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
    scene.textures.remove(CLOCK_TEXTURE_KEY);
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
      drawClockText(clockTexture, '00:00', width, height);
      clock.setAlpha(1).setVisible(true);
      phase = NIGHT_INTRO_PHASES.CLOCK_0000;
    } else if (phase === NIGHT_INTRO_PHASES.CLOCK_0000) {
      drawClockText(clockTexture, '00:01', width, height);
      phase = NIGHT_INTRO_PHASES.CLOCK_0001;
    } else if (phase === NIGHT_INTRO_PHASES.CLOCK_0001) {
      drawClockWindow(windowTexture, width, height, 0, revealMaxScale);
      clock.setAlpha(1);
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

      if (phase === NIGHT_INTRO_PHASES.REVEAL) {
        const transitionProgress = Math.min(elapsed / CLOCK_TRANSITION_MS, 1);
        const expansionElapsed = Math.max(elapsed - CLOCK_TRANSITION_MS, 0);
        const expansionDuration = duration - CLOCK_TRANSITION_MS;
        const expansionProgress = expansionElapsed / expansionDuration;

        clock.setAlpha(1 - transitionProgress);
        drawClockWindow(windowTexture, width, height, expansionProgress, revealMaxScale);
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
