import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { DJ_ENVIRONMENT_LAYOUT } from './djEnvironmentLayout.js';

export function isDjEnvironmentPreviewEnabled(search = '') {
  return new URLSearchParams(search).get('djEnvPreview') === '1';
}

export function preloadDjEnvironmentPreview(scene, { catalog = false } = {}) {
  const ids = catalog ? Object.keys(assets) : new Set(DJ_ENVIRONMENT_LAYOUT.map(({ assetId }) => assetId));
  for (const id of ids) {
    const { key, path, reuse } = assets[id];
    // The deck owns C01; all other used textures survive scene restart.
    if (!reuse && !scene.textures.exists(key)) scene.load.image(key, path);
  }
}

function origin({ assetId, x, y, scale }) {
  const { originPx: [ox, oy] } = assets[assetId];
  return [x + ox * scale, y + oy * scale];
}

function createImage(scene, item) {
  const { key, width, height, originPx: [ox, oy] } = assets[item.assetId];
  const image = scene.add.image(...origin(item), key)
    .setOrigin(ox / width, oy / height).setScale(item.scale).setDepth(item.renderDepth ?? item.depth);
  if (item.crop) image.setCrop(...item.crop);
  return image;
}

// Also used by an integration pass to render the validated V2 placements verbatim.
export function createDjEnvironmentComposition(scene) {
  const live = new Map();
  const dispose = ({ image }) => { if (image.scene) image.destroy(); };
  return {
    sync(placements) {
      const wanted = new Set(placements.map(({ id }) => id));
      for (const [id, sprite] of live) {
        if (!wanted.has(id)) {
          dispose(sprite);
          live.delete(id);
        }
      }
      for (const item of placements) {
        const signature = `${item.assetId}:${item.crop?.join() ?? ''}`;
        let sprite = live.get(item.id);
        if (!sprite || sprite.signature !== signature) {
          if (sprite) dispose(sprite);
          sprite = { signature, image: createImage(scene, item) };
          live.set(item.id, sprite);
        }
        sprite.image.setPosition(...origin(item)).setDepth(item.renderDepth ?? item.depth).setVisible(item.visible);
      }
    },
    destroy() {
      for (const sprite of live.values()) dispose(sprite);
      live.clear();
    },
  };
}

export function createDjEnvironmentPreview(scene) {
  const images = DJ_ENVIRONMENT_LAYOUT.map((item) => createImage(scene, item));

  // Phaser may have already emptied the display list when shutdown arrives.
  scene.events.once('shutdown', () => {
    for (const image of images) if (image.scene) image.destroy();
    images.length = 0;
  });
  return images;
}
