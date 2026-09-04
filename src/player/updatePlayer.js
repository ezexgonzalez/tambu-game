import Phaser from 'phaser';
import { PLAYER_CONFIG } from './playerConfig.js';

export function updatePlayer(player, { canMove = true } = {}) {
  if (!player?.sprite?.body) return;

  player.label.setPosition(
    player.sprite.x,
    player.sprite.y + PLAYER_CONFIG.label.offsetY,
  );

  if (canMove) {
    applyMovement(player);
  } else {
    player.sprite.setVelocity(0, 0);
  }

  updateAnimation(player);
}

function applyMovement(player) {
  const { cursors, wasd } = player.input;
  let x = 0;
  let y = 0;

  if (cursors.left.isDown || wasd.left.isDown) x -= 1;
  if (cursors.right.isDown || wasd.right.isDown) x += 1;
  if (cursors.up.isDown || wasd.up.isDown) y -= 1;
  if (cursors.down.isDown || wasd.down.isDown) y += 1;

  const direction = new Phaser.Math.Vector2(x, y);
  if (direction.lengthSq() > 0) direction.normalize().scale(PLAYER_CONFIG.speed);
  player.sprite.setVelocity(direction.x, direction.y);
}

function updateAnimation(player) {
  const velocity = player.sprite.body.velocity;
  const moving = Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5;

  if (moving) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      player.facing = velocity.x > 0 ? 'right' : 'left';
    } else {
      player.facing = velocity.y > 0 ? 'down' : 'up';
    }
  }

  const animation = moving
    ? `${PLAYER_CONFIG.sprite.key}-walk-${player.facing}`
    : `${PLAYER_CONFIG.sprite.key}-idle-${player.facing ?? PLAYER_CONFIG.initialFacing}`;

  if (player.sprite.anims.currentAnim?.key !== animation) {
    player.sprite.play(animation, true);
  }
}
