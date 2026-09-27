import { PLAYER_CONFIG } from '../player/playerConfig.js';

export const NIGHT_INTRO_PHASES = Object.freeze({
  BLACKOUT: 'blackout',
  CLOCK_0000: 'clock-0000',
  CLOCK_0001: 'clock-0001',
  REVEAL: 'reveal',
  REVEAL_TAIL: 'reveal-tail',
  COLON_TUNNEL: 'colon-tunnel',
  COMPLETE: 'complete',
});

export const NIGHT_INTRO_TIMINGS = Object.freeze({
  blackout: 200,
  clock0000: 1500,
  clock0001: 450,
  reveal: 1500,
  revealTail: 300,
  colonTunnel: 700,
});

const INTRO_DEPTH = 10000;
const WINDOW_TEXTURE_KEY = 'night-intro-clock-window';
const CLOCK_TEXTURE_KEY = 'night-intro-clock-pixels';
const CLOCK_TRANSITION_MS = 180;
const REVEAL_TAIL_OVERSHOOT = 1.4;
const COLON_TUNNEL_SELECTION_MS = 180;
const CLOCK_CELL_SIZE = 14;
const CLOCK_PIXEL_INSET = 2;
const CLOCK_GLYPH_WIDTH = 5;
const CLOCK_GLYPH_HEIGHT = 7;
const CLOCK_GLYPH_GAP = 1;
const CLOCK_PIXEL_SIZE = CLOCK_CELL_SIZE - CLOCK_PIXEL_INSET * 2;
const UPPER_COLON_PIXEL = Object.freeze({ charIndex: 2, row: 2, column: 2 });

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

function drawPixelClock(ctx, text, width, height, scale, compositeOperation, {
  fillStyle = '#ffffff',
  globalAlpha = 1,
  skipPixel = null,
} = {}) {
  const { width: clockWidth, height: clockHeight } = getClockBounds(text);
  const left = -clockWidth / 2;
  const top = -clockHeight / 2;

  ctx.save();
  ctx.globalCompositeOperation = compositeOperation;
  ctx.fillStyle = fillStyle;
  ctx.globalAlpha = globalAlpha;
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  for (let charIndex = 0; charIndex < text.length; charIndex += 1) {
    const glyph = CLOCK_GLYPHS[text[charIndex]];
    const glyphOffset = charIndex * (CLOCK_GLYPH_WIDTH + CLOCK_GLYPH_GAP);

    for (let row = 0; row < CLOCK_GLYPH_HEIGHT; row += 1) {
      for (let column = 0; column < CLOCK_GLYPH_WIDTH; column += 1) {
        if (glyph[row][column] !== '1') continue;
        if (skipPixel?.charIndex === charIndex && skipPixel.row === row && skipPixel.column === column) continue;
        const x = Math.round(left + (glyphOffset + column) * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET);
        const y = Math.round(top + row * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET);
        ctx.fillRect(x, y, CLOCK_PIXEL_SIZE, CLOCK_PIXEL_SIZE);
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

function getRevealTailScale(progress, maxScale) {
  const overshootScale = maxScale * REVEAL_TAIL_OVERSHOOT;
  const tailDuration = NIGHT_INTRO_TIMINGS.revealTail;
  const expansionDuration = NIGHT_INTRO_TIMINGS.reveal - CLOCK_TRANSITION_MS;
  const incomingScaleRate = 3 * (maxScale - 1) / expansionDuration;
  const tangent = incomingScaleRate * tailDuration;
  const progressSquared = progress ** 2;
  const progressCubed = progressSquared * progress;
  const startWeight = 2 * progressCubed - 3 * progressSquared + 1;
  const tangentWeight = progressCubed - 2 * progressSquared + progress;
  const endWeight = -2 * progressCubed + 3 * progressSquared;
  const endTangentWeight = progressCubed - progressSquared;

  return startWeight * maxScale
    + tangentWeight * tangent
    + endWeight * overshootScale
    + endTangentWeight * tangent;
}

function getHermiteScale(startScale, endScale, progress, incomingScaleRate, duration) {
  const progressSquared = progress ** 2;
  const progressCubed = progressSquared * progress;
  const startWeight = 2 * progressCubed - 3 * progressSquared + 1;
  const tangentWeight = progressCubed - 2 * progressSquared + progress;
  const endWeight = -2 * progressCubed + 3 * progressSquared;

  return startWeight * startScale
    + tangentWeight * incomingScaleRate * duration
    + endWeight * endScale;
}

function getClockPixelCenter(text, { charIndex, row, column }) {
  const { width: clockWidth, height: clockHeight } = getClockBounds(text);
  const glyphOffset = charIndex * (CLOCK_GLYPH_WIDTH + CLOCK_GLYPH_GAP);
  return {
    x: -clockWidth / 2 + (glyphOffset + column) * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET + CLOCK_PIXEL_SIZE / 2,
    y: -clockHeight / 2 + row * CLOCK_CELL_SIZE + CLOCK_PIXEL_INSET + CLOCK_PIXEL_SIZE / 2,
  };
}

function drawClockPixel(ctx, width, height, scale, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#ffffff';
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  ctx.fillRect(-CLOCK_PIXEL_SIZE / 2, -CLOCK_PIXEL_SIZE / 2, CLOCK_PIXEL_SIZE, CLOCK_PIXEL_SIZE);
  ctx.restore();
}

function getTunnelEndScale(width, height, startScale, incomingScaleRate) {
  const colonCenter = getClockPixelCenter('00:01', UPPER_COLON_PIXEL);
  const selectionFocusY = height / 2 + colonCenter.y * startScale
    + colonCenter.y * incomingScaleRate * COLON_TUNNEL_SELECTION_MS / 2;
  const farthestViewportEdge = Math.max(
    width / 2,
    Math.abs(selectionFocusY),
    Math.abs(height - selectionFocusY),
  );
  return (2 * farthestViewportEdge / CLOCK_PIXEL_SIZE) * 1.25;
}

function getTunnelFocusY(height, startScale, incomingScaleRate, elapsedMs) {
  const colonCenter = getClockPixelCenter('00:01', UPPER_COLON_PIXEL);
  const startY = height / 2 + colonCenter.y * startScale;
  const startVelocity = colonCenter.y * incomingScaleRate;
  const endY = startY + startVelocity * COLON_TUNNEL_SELECTION_MS / 2;
  const progress = Math.min(elapsedMs / COLON_TUNNEL_SELECTION_MS, 1);
  const progressSquared = progress ** 2;
  const progressCubed = progressSquared * progress;
  const startWeight = 2 * progressCubed - 3 * progressSquared + 1;
  const tangentWeight = progressCubed - 2 * progressSquared + progress;
  const endWeight = -2 * progressCubed + 3 * progressSquared;
  const startTangent = startVelocity * COLON_TUNNEL_SELECTION_MS;

  return startWeight * startY + tangentWeight * startTangent + endWeight * endY;
}

function drawColonTunnelWindow(texture, width, height, clockScale, focusY, closeOtherPixelsProgress) {
  const ctx = texture.getContext();
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  drawPixelClock(ctx, '00:01', width, height, clockScale, 'destination-out', {
    skipPixel: UPPER_COLON_PIXEL,
  });
  drawClockPixel(ctx, width, height, clockScale, width / 2, focusY);

  if (closeOtherPixelsProgress > 0) {
    const easedCloseProgress = closeOtherPixelsProgress ** 2 * (3 - 2 * closeOtherPixelsProgress);
    drawPixelClock(ctx, '00:01', width, height, clockScale, 'source-over', {
      fillStyle: '#000000',
      globalAlpha: easedCloseProgress,
      skipPixel: UPPER_COLON_PIXEL,
    });
  }

  ctx.restore();
  texture.refresh();
}

function drawClockWindow(texture, width, height, scale) {
  const ctx = texture.getContext();

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
      drawClockWindow(windowTexture, width, height, 1);
      clock.setAlpha(1);
      phase = NIGHT_INTRO_PHASES.REVEAL;
    } else if (phase === NIGHT_INTRO_PHASES.REVEAL) {
      phase = NIGHT_INTRO_PHASES.REVEAL_TAIL;
    } else if (phase === NIGHT_INTRO_PHASES.REVEAL_TAIL) {
      phase = NIGHT_INTRO_PHASES.COLON_TUNNEL;
    }
  }

  function update(deltaMs) {
    if (phase === NIGHT_INTRO_PHASES.COMPLETE) return;
    if (phase === NIGHT_INTRO_PHASES.COLON_TUNNEL && elapsed >= NIGHT_INTRO_TIMINGS.colonTunnel) {
      finish();
      return;
    }
    let remaining = Math.max(0, deltaMs);

    while (remaining > 0 && phase !== NIGHT_INTRO_PHASES.COMPLETE) {
      const duration = {
        [NIGHT_INTRO_PHASES.BLACKOUT]: NIGHT_INTRO_TIMINGS.blackout,
        [NIGHT_INTRO_PHASES.CLOCK_0000]: NIGHT_INTRO_TIMINGS.clock0000,
        [NIGHT_INTRO_PHASES.CLOCK_0001]: NIGHT_INTRO_TIMINGS.clock0001,
        [NIGHT_INTRO_PHASES.REVEAL]: NIGHT_INTRO_TIMINGS.reveal,
        [NIGHT_INTRO_PHASES.REVEAL_TAIL]: NIGHT_INTRO_TIMINGS.revealTail,
        [NIGHT_INTRO_PHASES.COLON_TUNNEL]: NIGHT_INTRO_TIMINGS.colonTunnel,
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
        const scale = 1 + (revealMaxScale - 1) * expansionProgress ** 3;
        drawClockWindow(windowTexture, width, height, scale);
      } else if (phase === NIGHT_INTRO_PHASES.REVEAL_TAIL) {
        const tailProgress = elapsed / duration;
        const scale = getRevealTailScale(tailProgress, revealMaxScale);
        drawClockWindow(windowTexture, width, height, scale);
      } else if (phase === NIGHT_INTRO_PHASES.COLON_TUNNEL) {
        const tunnelProgress = elapsed / duration;
        const incomingScaleRate = 3 * (revealMaxScale - 1) / (NIGHT_INTRO_TIMINGS.reveal - CLOCK_TRANSITION_MS);
        const tunnelStartScale = revealMaxScale * REVEAL_TAIL_OVERSHOOT;
        const tunnelEndScale = getTunnelEndScale(width, height, tunnelStartScale, incomingScaleRate);
        const scale = getHermiteScale(tunnelStartScale, tunnelEndScale, tunnelProgress, incomingScaleRate, duration);
        const focusY = getTunnelFocusY(height, tunnelStartScale, incomingScaleRate, elapsed);
        const closeOtherPixelsProgress = Math.min(elapsed / COLON_TUNNEL_SELECTION_MS, 1);

        drawColonTunnelWindow(windowTexture, width, height, scale, focusY, closeOtherPixelsProgress);
      }

      if (elapsed >= duration) {
        if (phase === NIGHT_INTRO_PHASES.COLON_TUNNEL) return;
        advance();
      }
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
