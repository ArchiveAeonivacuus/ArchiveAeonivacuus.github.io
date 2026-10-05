/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import {
  IS_HIDPI,
  type CanvasDimensions,
  type SpritePosition,
} from './config.js';
import { Runner } from './runner.js';

/** Game over panel. */
export class GameOverPanel {
  /** Dimensions used in the panel. */
  static readonly dimensions = {
    TEXT_X: 0,
    TEXT_Y: 13,
    TEXT_WIDTH: 191,
    TEXT_HEIGHT: 11,
    RESTART_WIDTH: 36,
    RESTART_HEIGHT: 32,
  };

  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  canvasDimensions: CanvasDimensions;
  textImgPos: SpritePosition;
  restartImgPos: SpritePosition;

  constructor(
    canvas: HTMLCanvasElement,
    textImgPos: SpritePosition,
    restartImgPos: SpritePosition,
    dimensions: CanvasDimensions,
  ) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.canvasDimensions = dimensions;
    this.textImgPos = textImgPos;
    this.restartImgPos = restartImgPos;
    this.draw();
  }

  /** Update the panel dimensions. */
  updateDimensions(width: number, opt_height?: number): void {
    this.canvasDimensions.WIDTH = width;
    if (opt_height) {
      this.canvasDimensions.HEIGHT = opt_height;
    }
  }

  /** Draw the panel. */
  draw(): void {
    const dimensions = GameOverPanel.dimensions;

    const centerX = this.canvasDimensions.WIDTH / 2;

    // Game over text.
    let textSourceX = dimensions.TEXT_X;
    let textSourceY = dimensions.TEXT_Y;
    let textSourceWidth = dimensions.TEXT_WIDTH;
    let textSourceHeight = dimensions.TEXT_HEIGHT;

    const textTargetX = Math.round(centerX - dimensions.TEXT_WIDTH / 2);
    const textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
    const textTargetWidth = dimensions.TEXT_WIDTH;
    const textTargetHeight = dimensions.TEXT_HEIGHT;

    let restartSourceWidth = dimensions.RESTART_WIDTH;
    let restartSourceHeight = dimensions.RESTART_HEIGHT;
    const restartTargetX = centerX - dimensions.RESTART_WIDTH / 2;
    const restartTargetY = this.canvasDimensions.HEIGHT / 2;

    if (IS_HIDPI) {
      textSourceY *= 2;
      textSourceX *= 2;
      textSourceWidth *= 2;
      textSourceHeight *= 2;
      restartSourceWidth *= 2;
      restartSourceHeight *= 2;
    }

    textSourceX += this.textImgPos.x;
    textSourceY += this.textImgPos.y;

    // Game over text from sprite.
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      textSourceX,
      textSourceY,
      textSourceWidth,
      textSourceHeight,
      textTargetX,
      textTargetY,
      textTargetWidth,
      textTargetHeight,
    );

    // Restart button.
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.restartImgPos.x,
      this.restartImgPos.y,
      restartSourceWidth,
      restartSourceHeight,
      restartTargetX,
      restartTargetY,
      dimensions.RESTART_WIDTH,
      dimensions.RESTART_HEIGHT,
    );
  }
}
