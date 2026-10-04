// Delta-controlled presentation only: no tweens, delayed calls or camera effects to leak.
export const BATHROOM_DOOR_STAGING = Object.freeze({
  durationMs: 4800, approachMs: 400, zoom: 1.75,
  impacts: Object.freeze([650, 850, 1050]),
  spokenAt: Object.freeze([1700, 3200]),
});

export function createBathroomDoorImpact(door) {
  const objects = [door?.sprite, door?.label].filter(Boolean);
  const neutral = objects.map(({ x, y }) => ({ x, y }));
  let pending = 0;
  let elapsed = 0;
  let destroyed = false;
  const restore = () => objects.forEach((object, index) => (
    object.setPosition(neutral[index].x, neutral[index].y)
  ));
  return {
    trigger() {
      if (destroyed) return;
      if (!pending) objects.forEach((object, index) => object.setPosition(neutral[index].x + 2, neutral[index].y));
      pending += 1;
    },
    update(delta) {
      if (destroyed || !pending) return;
      elapsed += Math.max(0, delta);
      while (pending && elapsed >= 120) { pending -= 1; elapsed -= 120; }
      if (!pending) { elapsed = 0; restore(); return; }
      const offset = [2, -2, 1, 0][Math.min(3, Math.floor(elapsed / 30))];
      objects.forEach((object, index) => object.setPosition(neutral[index].x + offset, neutral[index].y));
    },
    destroy() { if (!destroyed) restore(); destroyed = true; pending = 0; },
  };
}

// The viewport uses a top-left pivot while staged, so scroll is the physical world edge.
export function createBathroomCameraStaging(camera, bathroom, world = camera?._bounds) {
  if (!camera?.setScroll || !camera?.setZoom || !bathroom || !world) return { update() {}, hold() {}, restore() {}, destroy() {} };
  const saved = {
    x: camera.scrollX, y: camera.scrollY, zoomX: camera.zoomX ?? camera.zoom,
    zoomY: camera.zoomY ?? camera.zoom, target: camera._follow,
    originX: camera.originX ?? 0.5, originY: camera.originY ?? 0.5,
    bounds: camera._bounds ? { ...camera._bounds } : null,
    preRender: camera.preRender, ownPreRender: Object.hasOwn(camera, 'preRender'),
    roundPixels: camera.roundPixels, useBounds: camera.useBounds,
    lerpX: camera.lerp?.x, lerpY: camera.lerp?.y,
    offsetX: camera.followOffset?.x, offsetY: camera.followOffset?.y,
  };
  const limits = { x: world.x, y: world.y, width: world.width, height: world.height };
  const clamp = (value, min, max) => Math.max(min, Math.min(Math.max(min, max), value));
  const targetZoom = BATHROOM_DOOR_STAGING.zoom;
  const target = {
    x: clamp(bathroom.x + bathroom.width / 2 - camera.width / targetZoom / 2,
      limits.x, limits.x + limits.width - camera.width / targetZoom),
    y: clamp(bathroom.y + bathroom.height / 2 - camera.height / targetZoom * 0.22,
      limits.y, limits.y + limits.height - camera.height / targetZoom),
  };
  const initial = {
    x: saved.x + camera.width * saved.originX * (1 - 1 / saved.zoomX),
    y: saved.y + camera.height * saved.originY * (1 - 1 / saved.zoomY),
  };
  camera.stopFollow();
  camera.setOrigin?.(0, 0);
  // Phaser 4 also derives worldView for tile culling with a centered pivot.
  // Keep that derived rectangle consistent with the actual staged render matrix.
  if (saved.preRender) camera.preRender = function (...args) {
    saved.preRender.apply(this, args);
    const width = this.width / this.zoomX;
    const height = this.height / this.zoomY;
    this.worldView.setTo(this.scrollX, this.scrollY, width, height);
    this.midPoint.set(this.scrollX + width / 2, this.scrollY + height / 2);
  };
  let restored = false;
  let held = false;
  const smooth = (t) => t * t * (3 - 2 * t);
  function restore() {
    if (restored) return;
    restored = true;
    if (saved.ownPreRender) camera.preRender = saved.preRender;
    else delete camera.preRender;
    camera.setOrigin?.(saved.originX, saved.originY);
    camera.setZoom(saved.zoomX, saved.zoomY);
    if (saved.bounds) camera.setBounds?.(saved.bounds.x, saved.bounds.y, saved.bounds.width, saved.bounds.height);
    camera.useBounds = saved.useBounds;
    if (saved.target) camera.startFollow(saved.target, saved.roundPixels,
      saved.lerpX, saved.lerpY, saved.offsetX, saved.offsetY);
    camera.roundPixels = saved.roundPixels;
    camera.setScroll(saved.x, saved.y);
  }
  function focus(amount) {
    const zx = saved.zoomX + (targetZoom - saved.zoomX) * amount;
    const zy = saved.zoomY + (targetZoom - saved.zoomY) * amount;
    camera.setZoom(zx, zy);
    const vw = camera.width / zx;
    const vh = camera.height / zy;
    // Phaser 4 clampX/Y assume a centered pivot. Translate engine bounds to retain
    // the actual world limits with our top-left pivot; the world itself never moves.
    camera.setBounds?.(limits.x + (camera.width - vw) / 2,
      limits.y + (camera.height - vh) / 2, limits.width, limits.height);
    camera.useBounds = true;
    camera.setScroll(clamp(initial.x + (target.x - initial.x) * amount,
      limits.x, limits.x + limits.width - vw),
    clamp(initial.y + (target.y - initial.y) * amount,
      limits.y, limits.y + limits.height - vh));
  }
  function hold() {
    if (restored || held) return;
    focus(1); held = true;
  }
  focus(0);
  return {
    update(elapsed) {
      if (restored || held) return;
      if (elapsed >= BATHROOM_DOOR_STAGING.approachMs) { hold(); return; }
      focus(smooth(Math.max(0, elapsed / BATHROOM_DOOR_STAGING.approachMs)));
    },
    hold, restore, destroy: restore,
  };
}
