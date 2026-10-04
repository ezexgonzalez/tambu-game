// Implements Phaser 4's pivot-independent clampX/Y, not just setter spies.
export function attachWorldCameraGeometry(camera, world) {
  Object.assign(camera, {
    originX: 0.5, originY: 0.5, _bounds: { ...world },
    worldView: { setTo(x, y, width, height) { Object.assign(this, { x, y, width, height }); } },
    midPoint: { set(x, y) { this.x = x; this.y = y; } },
    preRender() {
      this.preRenderBounds();
      const width = this.width / this.zoomX;
      const height = this.height / this.zoomY;
      this.worldView.setTo(this.scrollX + (this.width - width) / 2,
        this.scrollY + (this.height - height) / 2, width, height);
    },
    setOrigin(x, y) { this.originX = x; this.originY = y; return this; },
    setBounds(x, y, width, height) { this._bounds = { x, y, width, height }; this.useBounds = true; return this; },
    preRenderBounds() {
      for (const [scroll, size, zoom, axis] of [['scrollX', 'width', 'zoomX', 'x'], ['scrollY', 'height', 'zoomY', 'y']]) {
        const visible = this[size] / this[zoom];
        const min = this._bounds[axis] + (visible - this[size]) / 2;
        const max = Math.max(min, min + this._bounds[size] - visible);
        this[scroll] = Math.max(min, Math.min(max, this[scroll]));
      }
    },
  });
  return camera;
}
export function attachUiCameraManager(scene, worldObjects = []) {
  scene.children = { list: [...worldObjects] };
  const main = scene.cameras?.main ?? {};
  main.id = 1;
  main.ignore = function(object) { object.cameraFilter = (object.cameraFilter ?? 0) | this.id; return this; };
  scene.cameras = {
    main, cameras: [main], removed: 0,
    add(x, y, width, height, makeMain, name) {
      const camera = { id: 2, x, y, width, height, name, zoomX: 1, zoomY: 1, rotation: 0,
        scrollX: 0, scrollY: 0, ignore: main.ignore,
        setScroll(x, y) { this.scrollX = x; this.scrollY = y; return this; },
        setZoom(zoom) { this.zoomX = zoom; this.zoomY = zoom; return this; },
        setRotation(value) { this.rotation = value; return this; },
      };
      this.cameras.push(camera); return camera;
    },
    remove(camera) { this.removed++; this.cameras.splice(this.cameras.indexOf(camera), 1); camera.destroyed = true; },
  };
  for (const [name, factory] of Object.entries(scene.add)) {
    scene.add[name] = (...args) => {
      const object = factory(...args);
      object.cameraFilter ??= 0;
      scene.children.list.push(object);
      scene.events.emit('addedtoscene', object, scene);
      return object;
    };
  }
  return scene;
}
