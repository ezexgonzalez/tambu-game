// A local camera scope: world objects stay on their cameras, Bathroom UI only on this one.
export function createBathroomUiCameraScope(scene) {
  const manager = scene.cameras;
  if (!manager?.add) return { register: (object) => object, destroy() {}, getCamera: () => null };
  let camera = manager.add(0, 0, scene.scale.width, scene.scale.height, false, 'bathroom-ui');
  camera.setScroll(0, 0); camera.setZoom(1); camera.setRotation(0);
  const records = new Map();
  function record(object, mask) {
    if (!records.has(object)) records.set(object, { original: object.cameraFilter ?? 0, mask: 0 });
    records.get(object).mask |= mask;
  }
  function ignoreWorld(object) {
    if (!camera || !object) return;
    record(object, camera.id); camera.ignore(object);
  }
  for (const object of scene.children?.list ?? scene.sys?.displayList?.list ?? []) ignoreWorld(object);
  scene.events?.on?.('addedtoscene', ignoreWorld);
  function register(object) {
    if (!camera) return object;
    for (const other of manager.cameras) {
      if (other === camera) continue;
      record(object, other.id); other.ignore(object);
    }
    record(object, camera.id);
    object.cameraFilter &= ~camera.id;
    return object;
  }
  function destroy() {
    if (!camera) return;
    scene.events?.off?.('addedtoscene', ignoreWorld);
    scene.events?.off?.('shutdown', destroy);
    for (const [object, { original, mask }] of records) {
      object.cameraFilter = ((object.cameraFilter ?? 0) & ~mask) | (original & mask);
    }
    records.clear();
    manager.remove(camera, true); camera = null;
  }
  scene.events?.once?.('shutdown', destroy);
  return { register, destroy, getCamera: () => camera };
}
