/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import {
  FPS,
  IS_HIDPI,
  IS_MOBILE,
  type CanvasDimensions,
  type SpritePosition,
} from './config.js';
import { getRandomNum } from './utils.js';
import { Runner } from './runner.js';
import { CollisionBox } from './collision-box.js';

export type ObstacleTypeName =
  | 'CACTUS_SMALL'
  | 'CACTUS_LARGE'
  | 'PTERODACTYL';

export interface ObstacleType {
  type: ObstacleTypeName;
  width: number;
  height: number;
  yPos: number | number[];
  yPosMobile?: number[];
  multipleSpeed: number;
  minSpeed: number;
  minGap: number;
  collisionBoxes: CollisionBox[];
  numFrames?: number;
  frameRate?: number;
  speedOffset?: number;
}

/** Obstacle. */
export class Obstacle {
  /** Coefficient for calculating the maximum gap. */
  static readonly MAX_GAP_COEFFICIENT = 1.5;

  /** Maximum obstacle grouping count. */
  static readonly MAX_OBSTACLE_LENGTH = 3;

  /**
   * Obstacle definitions.
   * minGap: minimum pixel space betweeen obstacles.
   * multipleSpeed: Speed at which multiples are allowed.
   * speedOffset: speed faster / slower than the horizon.
   * minSpeed: Minimum speed which the obstacle can make an appearance.
   */
  static readonly types: ObstacleType[] = [
    {
      type: 'CACTUS_SMALL',
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 7, 5, 27),
        new CollisionBox(4, 0, 6, 34),
        new CollisionBox(10, 4, 7, 14),
      ],
    },
    {
      type: 'CACTUS_LARGE',
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 12, 7, 38),
        new CollisionBox(8, 0, 7, 49),
        new CollisionBox(13, 10, 10, 38),
      ],
    },
    {
      type: 'PTERODACTYL',
      width: 46,
      height: 40,
      yPos: [100, 75, 50], // Variable height.
      yPosMobile: [100, 50], // Variable height mobile.
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      collisionBoxes: [
        new CollisionBox(15, 15, 16, 5),
        new CollisionBox(18, 21, 24, 6),
        new CollisionBox(2, 14, 4, 3),
        new CollisionBox(6, 10, 4, 7),
        new CollisionBox(10, 8, 6, 9),
      ],
      numFrames: 2,
      frameRate: 1000 / 6,
      speedOffset: 0.8,
    },
  ];

  canvasCtx: CanvasRenderingContext2D;
  spritePos: SpritePosition;
  typeConfig: ObstacleType;
  gapCoefficient: number;
  size: number;
  dimensions: CanvasDimensions;
  remove = false;
  xPos: number;
  yPos = 0;
  width = 0;
  collisionBoxes: CollisionBox[] = [];
  gap = 0;
  speedOffset = 0;

  // For animated obstacles.
  currentFrame = 0;
  timer = 0;

  followingObstacleCreated?: boolean;

  constructor(
    canvasCtx: CanvasRenderingContext2D,
    type: ObstacleType,
    spriteImgPos: SpritePosition,
    dimensions: CanvasDimensions,
    gapCoefficient: number,
    speed: number,
    opt_xOffset?: number,
  ) {
    this.canvasCtx = canvasCtx;
    this.spritePos = spriteImgPos;
    this.typeConfig = type;
    this.gapCoefficient = gapCoefficient;
    this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
    this.dimensions = dimensions;
    this.xPos = dimensions.WIDTH + (opt_xOffset || 0);

    this.init(speed);
  }

  /** Initialise the DOM for the obstacle. */
  init(speed: number): void {
    this.cloneCollisionBoxes();

    // Only allow sizing if we're at the right speed.
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1;
    }

    this.width = this.typeConfig.width * this.size;

    // Check if obstacle can be positioned at various heights.
    if (Array.isArray(this.typeConfig.yPos)) {
      const yPosConfig = IS_MOBILE
        ? this.typeConfig.yPosMobile!
        : this.typeConfig.yPos;
      this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)]!;
    } else {
      this.yPos = this.typeConfig.yPos;
    }

    this.draw();

    // Make collision box adjustments,
    // Central box is adjusted to the size as one box.
    //      ____        ______        ________
    //    _|   |-|    _|     |-|    _|       |-|
    //   | |<->| |   | |<--->| |   | |<----->| |
    //   | | 1 | |   | |  2  | |   | |   3   | |
    //   |_|___|_|   |_|_____|_|   |_|_______|_|
    //
    if (this.size > 1) {
      this.collisionBoxes[1]!.width =
        this.width -
        this.collisionBoxes[0]!.width -
        this.collisionBoxes[2]!.width;
      this.collisionBoxes[2]!.x =
        this.width - this.collisionBoxes[2]!.width;
    }

    // For obstacles that go at a different speed from the horizon.
    if (this.typeConfig.speedOffset) {
      this.speedOffset =
        Math.random() > 0.5
          ? this.typeConfig.speedOffset
          : -this.typeConfig.speedOffset;
    }

    this.gap = this.getGap(this.gapCoefficient, speed);
  }

  /** Draw and crop based on size. */
  draw(): void {
    let sourceWidth = this.typeConfig.width;
    let sourceHeight = this.typeConfig.height;

    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2;
      sourceHeight = sourceHeight * 2;
    }

    // X position in sprite.
    let sourceX =
      sourceWidth * this.size * (0.5 * (this.size - 1)) + this.spritePos.x;

    // Animation frames.
    if (this.currentFrame > 0) {
      sourceX += sourceWidth * this.currentFrame;
    }

    this.canvasCtx.drawImage(
      Runner.imageSprite,
      sourceX,
      this.spritePos.y,
      sourceWidth * this.size,
      sourceHeight,
      this.xPos,
      this.yPos,
      this.typeConfig.width * this.size,
      this.typeConfig.height,
    );
  }

  /** Obstacle frame update. */
  update(deltaTime: number, speed: number): void {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset;
      }
      this.xPos -= Math.floor(((speed * FPS) / 1000) * deltaTime);

      // Update frame
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime;
        if (this.timer >= this.typeConfig.frameRate!) {
          this.currentFrame =
            this.currentFrame == this.typeConfig.numFrames - 1
              ? 0
              : this.currentFrame + 1;
          this.timer = 0;
        }
      }
      this.draw();

      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  }

  /**
   * Calculate a random gap size.
   * - Minimum gap gets wider as speed increses
   */
  getGap(gapCoefficient: number, speed: number): number {
    const minGap = Math.round(
      this.width * speed + this.typeConfig.minGap * gapCoefficient,
    );
    const maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
    return getRandomNum(minGap, maxGap);
  }

  /** Check if obstacle is visible. */
  isVisible(): boolean {
    return this.xPos + this.width > 0;
  }

  /**
   * Make a copy of the collision boxes, since these will change based on
   * obstacle type and size.
   */
  cloneCollisionBoxes(): void {
    const collisionBoxes = this.typeConfig.collisionBoxes;

    for (let i = collisionBoxes.length - 1; i >= 0; i--) {
      this.collisionBoxes[i] = new CollisionBox(
        collisionBoxes[i]!.x,
        collisionBoxes[i]!.y,
        collisionBoxes[i]!.width,
        collisionBoxes[i]!.height,
      );
    }
  }
}
