import { TAMBU_SPRITE } from '../data/tambuSprite.js';
import { PATIO_LAYOUT } from '../world/patioLayout.js';

const { entry } = PATIO_LAYOUT.terrain;

export const PLAYER_CONFIG = {
  sprite: TAMBU_SPRITE,
  start: {
    x: entry.x + entry.width / 2,
    y: entry.playerSpawnY,
  },
  speed: 225,
  depth: 2000,
  initialFacing: 'down',
  label: {
    text: 'TAMBU',
    initialOffsetY: 26,
    offsetY: 34,
    depth: 2001,
    style: {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#7fe4ff',
      fontStyle: 'bold',
    },
  },
};
