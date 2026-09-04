import { fillerGroups, patioFriends, patioWomen } from '../data/patioCharacters.js';

const SHIRT_COLORS = [0xe8edf2, 0xd44f65, 0x6571c8, 0x3f9a74, 0xc4944c, 0x8965ad, 0x20242d, 0xd99caa];
const SKIN_COLORS = [0xe8b990, 0xd79c73, 0xc5835f, 0xf0c8a7];
const HAIR_COLORS = [0x1d1715, 0x593a2d, 0xb88652, 0x15151a, 0x7a5139];

export function createCharacters(scene) {
  fillerGroups.forEach(([x, y, palette, activity]) => {
    const sprite = drawPerson(scene, x, y, palette);
    if (activity === 'dance') {
      scene.tweens.add({
        targets: sprite,
        y: y - 5,
        duration: 320 + (palette % 4) * 70,
        yoyo: true,
        repeat: -1,
      });
    }
    if (activity === 'kiss') {
      scene.add.text(x, y - 54, '♥', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ff7b9c',
      }).setOrigin(0.5);
    }
  });

  patioFriends.forEach((friend) => {
    const sprite = drawPerson(scene, friend.x, friend.y, friend.palette);
    scene.add.text(friend.x, friend.y + 34, friend.name, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#d4d7df',
    }).setOrigin(0.5);
    sprite.setDepth(friend.y);
  });

  return patioWomen.map((character) => {
    const sprite = drawPerson(scene, character.x, character.y, character.palette, true);
    scene.add.text(character.x, character.y + 36, character.name, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#fff0b8',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    scene.add.text(character.x, character.y - 55, '!', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f4cd63',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    return { sprite, character };
  });
}

function drawPerson(scene, x, y, index, interactive = false) {
  const container = scene.add.container(x, y);
  const shadow = scene.add.ellipse(0, 23, 26, 8, 0x000000, 0.24);
  const legs = scene.add.rectangle(0, 13, 16, 22, 0x252a33, 1);
  const torso = scene.add.rectangle(0, -2, 22, 22, SHIRT_COLORS[index % SHIRT_COLORS.length], 1);
  const skin = SKIN_COLORS[index % SKIN_COLORS.length];
  const head = scene.add.rectangle(0, -25, 17, 18, skin, 1);
  const hair = scene.add.rectangle(0, -33, 19, 7, HAIR_COLORS[index % HAIR_COLORS.length], 1);
  const armL = scene.add.rectangle(-13, -1, 4, 16, skin, 1);
  const armR = scene.add.rectangle(13, -1, 4, 16, skin, 1);

  container.add([shadow, legs, torso, armL, armR, head, hair]);
  container.setDepth(y);
  if (interactive) container.setScale(1.05);
  return container;
}
