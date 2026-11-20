import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { DJ_ENVIRONMENT_LAYOUT } from './djEnvironmentLayout.js';

export function isDjEnvironmentPreviewEnabled(search = '') {
  return new URLSearchParams(search).get('djEnvPreview') === '1';
}

export function preloadDjEnvironmentPreview(scene) {
  const ids = new Set(DJ_ENVIRONMENT_LAYOUT.map(({ assetId }) => assetId));
  for (const id of ids) {
    const { key, path, reuse } = assets[id];
    // The deck owns C01; all other used textures survive scene restart.
    if (!reuse && !scene.textures.exists(key)) scene.load.image(key, path);
  }
}

export function createDjEnvironmentPreview(scene) {
  const images = DJ_ENVIRONMENT_LAYOUT.map(({ assetId, x, y, scale, depth, crop }) => {
    const { key, width, height, originPx: [ox, oy] } = assets[assetId];
    const image = scene.add.image(x + ox * scale, y + oy * scale, key)
      .setOrigin(ox / width, oy / height)
      .setScale(scale)
      .setDepth(depth);
    if (crop) image.setCrop(...crop);
    return image;
  });

  // Phaser may have already emptied the display list when shutdown arrives.
  scene.events.once('shutdown', () => {
    for (const image of images) if (image.scene) image.destroy();
    images.length = 0;
  });
  return images;
}
