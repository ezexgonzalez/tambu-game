// Delta-controlled presentation only: no tweens, delayed calls or camera effects to leak.
export const BATHROOM_DOOR_STAGING = Object.freeze({
  durationMs: 4800, approachMs: 400, restoreMs: 350, zoom: 1.75,
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

export function createBathroomCameraStaging(camera, bathroom) {
  if (!camera?.setScroll || !camera?.setZoom || !bathroom) return { update() {}, destroy() {} };
  // Phaser 4.2.1 stores follow on _follow; startFollow also changes scroll, restored below.
  const saved = {
    x: camera.scrollX, y: camera.scrollY, zoomX: camera.zoomX ?? camera.zoom,
    zoomY: camera.zoomY ?? camera.zoom, target: camera._follow,
    roundPixels: camera.roundPixels, useBounds: camera.useBounds,
    lerpX: camera.lerp?.x, lerpY: camera.lerp?.y,
    offsetX: camera.followOffset?.x, offsetY: camera.followOffset?.y,
  };
  const target = {
    x: bathroom.x + bathroom.width / 2 - camera.width / 2,
    y: bathroom.y + bathroom.height / 2 - camera.height / 2,
  };
  camera.stopFollow();
  // The facade is at the top bound; allow its visual center to occupy the viewport center.
  camera.useBounds = false;
  let restored = false;
  const smooth = (t) => t * t * (3 - 2 * t);
  function restore() {
    if (restored) return;
    restored = true;
    camera.useBounds = saved.useBounds;
    if (saved.target) camera.startFollow(saved.target, saved.roundPixels,
      saved.lerpX, saved.lerpY, saved.offsetX, saved.offsetY);
    camera.setZoom(saved.zoomX, saved.zoomY);
    camera.setScroll(saved.x, saved.y);
  }
  return {
    update(elapsed) {
      if (restored) return;
      const { durationMs, approachMs, restoreMs, zoom } = BATHROOM_DOOR_STAGING;
      if (elapsed >= durationMs) { restore(); return; }
      const approach = smooth(Math.min(1, elapsed / approachMs));
      const returning = smooth(Math.max(0, (elapsed - (durationMs - restoreMs)) / restoreMs));
      const amount = approach * (1 - returning);
      camera.setScroll(saved.x + (target.x - saved.x) * amount,
        saved.y + (target.y - saved.y) * amount);
      camera.setZoom(saved.zoomX + (zoom - saved.zoomX) * amount,
        saved.zoomY + (zoom - saved.zoomY) * amount);
    },
    destroy: restore,
  };
}
