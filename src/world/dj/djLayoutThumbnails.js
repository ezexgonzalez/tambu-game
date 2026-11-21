import { DJ_ENVIRONMENT_ASSETS as assets } from './djEnvironmentAssets.js';
import { djPlacementBounds, djSourceParts } from './djLayoutComposition.js';

// Use the same parts as placement, with crop applied in texture space.
export function getDjThumbnail(source) {
  const parts = djSourceParts(source);
  if (!parts?.length) return null;
  const boxes = parts.map((part) => djPlacementBounds(part));
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const width = Math.max(...boxes.map((box) => box.x + box.width)) - left;
  const height = Math.max(...boxes.map((box) => box.y + box.height)) - top;
  const layers = parts.map((part) => ({ ...part, x: part.x - left, y: part.y - top }))
    .sort((a, b) => a.depth - b.depth);
  return { width, height, layers };
}

export function createDjThumbnail(doc, { source, path }, size = 92) {
  const spec = getDjThumbnail(source);
  const unavailable = 'Vista previa no disponible';
  if (!spec || spec.layers.length === 1) {
    const src = spec ? assets[spec.layers[0].assetId].path : path;
    if (!src) {
      const fallback = doc.createElement('span');
      fallback.textContent = unavailable;
      return fallback;
    }
    const image = doc.createElement('img');
    image.className = 'dj-preview-single';
    image.src = src;
    image.alt = '';
    image.style.height = `${size}px`;
    image.loading = 'lazy';
    image.onerror = () => { image.alt = unavailable; };
    return image;
  }

  const stage = doc.createElement('span');
  stage.className = 'dj-preview-stage';
  stage.style.height = `${size}px`;
  const frame = doc.createElement('span');
  frame.className = 'dj-preview-frame';
  frame.style.width = `min(100%, ${size * spec.width / spec.height}px)`;
  frame.style.aspectRatio = `${spec.width} / ${spec.height}`;
  stage.append(frame);
  for (const layer of spec.layers) {
    const { path, width, height } = assets[layer.assetId];
    const image = doc.createElement('img');
    image.src = path;
    image.alt = '';
    image.style.left = `${100 * layer.x / spec.width}%`;
    image.style.top = `${100 * layer.y / spec.height}%`;
    image.style.width = `${100 * width * layer.scale / spec.width}%`;
    image.style.height = `${100 * height * layer.scale / spec.height}%`;
    if (layer.crop) {
      const [x, y, w, h] = layer.crop;
      image.style.clipPath = `inset(${100 * y / height}% ${100 * (width - x - w) / width}% ${100 * (height - y - h) / height}% ${100 * x / width}%)`;
    }
    image.onerror = () => { stage.textContent = unavailable; };
    frame.append(image);
  }
  return stage;
}
