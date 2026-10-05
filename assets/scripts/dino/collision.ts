/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { Runner } from './runner.js';
import { Trex } from './trex.js';
import { CollisionBox } from './collision-box.js';
import type { Obstacle } from './obstacle.js';

/**
 * Check for a collision.
 * @param opt_canvasCtx Optional canvas context for drawing collision boxes.
 */
export function checkForCollision(
  obstacle: Obstacle,
  tRex: Trex,
  opt_canvasCtx?: CanvasRenderingContext2D,
): [CollisionBox, CollisionBox] | false {
  // Adjustments are made to the bounding box as there is a 1 pixel white
  // border around the t-rex and obstacles.
  const tRexBox = new CollisionBox(
    tRex.xPos + 1,
    tRex.yPos + 1,
    tRex.config.WIDTH - 2,
    tRex.config.HEIGHT - 2,
  );

  const obstacleBox = new CollisionBox(
    obstacle.xPos + 1,
    obstacle.yPos + 1,
    obstacle.typeConfig.width * obstacle.size - 2,
    obstacle.typeConfig.height - 2,
  );

  // Debug outer box
  if (opt_canvasCtx) {
    drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
  }

  // Simple outer bounds check.
  if (boxCompare(tRexBox, obstacleBox)) {
    const collisionBoxes = obstacle.collisionBoxes;
    const tRexCollisionBoxes = tRex.ducking
      ? Trex.collisionBoxes.DUCKING
      : Trex.collisionBoxes.RUNNING;

    // Detailed axis aligned box check.
    for (let t = 0; t < tRexCollisionBoxes.length; t++) {
      for (let i = 0; i < collisionBoxes.length; i++) {
        // Adjust the box to actual positions.
        const adjTrexBox = createAdjustedCollisionBox(
          tRexCollisionBoxes[t]!,
          tRexBox,
        );
        const adjObstacleBox = createAdjustedCollisionBox(
          collisionBoxes[i]!,
          obstacleBox,
        );
        const crashed = boxCompare(adjTrexBox, adjObstacleBox);

        // Draw boxes for debug.
        if (opt_canvasCtx) {
          drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
        }

        if (crashed) {
          return [adjTrexBox, adjObstacleBox];
        }
      }
    }
  }
  return false;
}

/** Adjust the collision box. */
export function createAdjustedCollisionBox(
  box: CollisionBox,
  adjustment: CollisionBox,
): CollisionBox {
  return new CollisionBox(
    box.x + adjustment.x,
    box.y + adjustment.y,
    box.width,
    box.height,
  );
}

/** Draw the collision boxes for debug. */
export function drawCollisionBoxes(
  canvasCtx: CanvasRenderingContext2D,
  tRexBox: CollisionBox,
  obstacleBox: CollisionBox,
): void {
  canvasCtx.save();
  canvasCtx.strokeStyle = '#f00';
  canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

  canvasCtx.strokeStyle = '#0f0';
  canvasCtx.strokeRect(
    obstacleBox.x,
    obstacleBox.y,
    obstacleBox.width,
    obstacleBox.height,
  );
  canvasCtx.restore();
}

/** Compare two collision boxes for a collision. */
export function boxCompare(
  tRexBox: CollisionBox,
  obstacleBox: CollisionBox,
): boolean {
  let crashed = false;

  // Axis-Aligned Bounding Box method.
  if (
    tRexBox.x < obstacleBox.x + obstacleBox.width &&
    tRexBox.x + tRexBox.width > obstacleBox.x &&
    tRexBox.y < obstacleBox.y + obstacleBox.height &&
    tRexBox.height + tRexBox.y > obstacleBox.y
  ) {
    crashed = true;
  }

  return crashed;
}
