import { PATIO_COMPOSER_AREAS } from './patioComposerAreas.js';

// Add only reviewed, versioned PNGs and recipes here. This is not a file import path.
export const PATIO_PROP_PACKS = Object.freeze([]);

const assetPath = /^\/assets\/props\/(?:[\w-]+\/)*[\w-]+\.png$/;
const supportedSectors = (sectors) => Array.isArray(sectors) && sectors.length
  && sectors.every((area) => Object.hasOwn(PATIO_COMPOSER_AREAS, area));

export function extendPatioCatalog(base, packs = PATIO_PROP_PACKS) {
  const assets = { ...base }, families = {}, recipes = {};
  const keys = new Set(Object.values(base).map(({ key }) => key));
  for (const pack of packs) {
    for (const [id, label] of Object.entries(pack.families ?? {})) {
      if (Object.hasOwn(families, id) && families[id] !== label) throw new Error(`Categoría en conflicto: ${id}`);
      families[id] = label;
    }
    for (const [id, asset] of Object.entries(pack.assets)) {
      if (Object.hasOwn(assets, id) || keys.has(asset.key)) throw new Error(`Asset duplicado: ${id}`);
      if (!assetPath.test(asset.path) || !asset.key || !asset.label || !asset.family || !supportedSectors(asset.sectors)) {
        throw new Error(`Asset de patio inválido: ${id}`);
      }
      if (asset.depthBehavior === 'host' && asset.placeable) throw new Error(`El componente ${id} requiere soporte.`);
      keys.add(asset.key);
      assets[id] = Object.freeze({ ...asset, pack: pack.id });
    }
    for (const [id, recipe] of Object.entries(pack.recipes ?? {})) {
      if (Object.hasOwn(recipes, id)) throw new Error(`Receta duplicada: ${id}`);
      recipes[id] = Object.freeze({ ...recipe, pack: pack.id });
    }
  }
  for (const [id, { assetId, parts, sectors }] of Object.entries(recipes)) {
    if (!parts?.length || assetId !== parts[0].assetId
      || (sectors && !supportedSectors(sectors))
      || parts.some((part) => !Object.hasOwn(assets, part.assetId))) throw new Error(`Receta de patio inválida: ${id}`);
  }
  return Object.freeze({ assets: Object.freeze(assets), families: Object.freeze(families), recipes: Object.freeze(recipes) });
}
