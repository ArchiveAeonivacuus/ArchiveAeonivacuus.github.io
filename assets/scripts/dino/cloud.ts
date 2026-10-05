/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { IS_HIDPI, type SpritePosition } from './config.js';
import { getRandomNum } from './utils.js';
import { Runner } from './runner.js';

/**
 * Cloud background item.
 * Similar to an obstacle object but without collision boxes.
 */
export class Cloud {
  /** Cloud object config. */
  static readonly config = {
    HEIGHT: 14,
    MAX_CLOUD_GAP: 400,
    MAX_SKY_LEVEL: 30,
    MIN_CLOUD_GAP: 100,
    MIN_SKY_LEVEL: 71,
    WIDTH: 46,
  };

  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  spritePos: SpritePosition;
  containerWidth: number;
  xPos: number;
  yPos = 0;
  remove = false;
  cloudGap: number;

  constructor(
    canvas: HTMLCanvasElement,
    spritePos: SpritePosition,
    containerWidth: number,
  ) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.spritePos = spritePos;
    this.containerWidth = containerWidth;
    this.xPos = containerWidth;
    this.cloudGap = getRandomNum(
      Cloud.config.MIN_CLOUD_GAP,
      Cloud.config.MAX_CLOUD_GAP,
    );

    this.init();
  }

  /** Initialise the cloud. Sets the Cloud height. */
  init(): void {
    this.yPos = getRandomNum(
      Cloud.config.MAX_SKY_LEVEL,
      Cloud.config.MIN_SKY_LEVEL,
    );
    this.draw();
  }

  /** Draw the cloud. */
  draw(): void {
    this.canvasCtx.save();
    let sourceWidth = Cloud.config.WIDTH;
    let sourceHeight = Cloud.config.HEIGHT;

    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2;
      sourceHeight = sourceHeight * 2;
    }

    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.spritePos.x,
      this.spritePos.y,
      sourceWidth,
      sourceHeight,
      this.xPos,
      this.yPos,
      Cloud.config.WIDTH,
      Cloud.config.HEIGHT,
    );

    this.canvasCtx.restore();
  }

  /** Update the cloud position. */
  update(speed: number): void {
    if (!this.remove) {
      this.xPos -= Math.ceil(speed);
      this.draw();

      // Mark as removeable if no longer in the canvas.
      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  }

  /** Check if the cloud is visible on the stage. */
  isVisible(): boolean {
    return this.xPos + Cloud.config.WIDTH > 0;
  }
}
