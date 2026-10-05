/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { IS_HIDPI, type SpritePosition } from './config.js';
import { getRandomNum } from './utils.js';
import { Runner } from './runner.js';

/** A single star in night mode. */
interface Star {
  x: number;
  y: number;
  sourceY: number;
}

/** Nightmode shows a moon and stars on the horizon. */
export class NightMode {
  static readonly config = {
    FADE_SPEED: 0.035,
    HEIGHT: 40,
    MOON_SPEED: 0.25,
    NUM_STARS: 2,
    STAR_SIZE: 9,
    STAR_SPEED: 0.3,
    STAR_MAX_Y: 70,
    WIDTH: 20,
  };

  static readonly phases = [140, 120, 100, 60, 40, 20, 0];

  spritePos: SpritePosition;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  xPos: number;
  yPos = 30;
  currentPhase = 0;
  opacity = 0;
  containerWidth: number;
  stars: Star[] = [];
  drawStars = false;

  constructor(
    canvas: HTMLCanvasElement,
    spritePos: SpritePosition,
    containerWidth: number,
  ) {
    this.spritePos = spritePos;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.xPos = containerWidth - 50;
    this.containerWidth = containerWidth;
    this.placeStars();
  }

  /** Update moving moon, changing phases. */
  update(activated: boolean, delta?: number): void {
    // Moon phase.
    if (activated && this.opacity == 0) {
      this.currentPhase++;

      if (this.currentPhase >= NightMode.phases.length) {
        this.currentPhase = 0;
      }
    }

    // Fade in / out.
    if (activated && (this.opacity < 1 || this.opacity == 0)) {
      this.opacity += NightMode.config.FADE_SPEED;
    } else if (this.opacity > 0) {
      this.opacity -= NightMode.config.FADE_SPEED;
    }

    // Set moon positioning.
    if (this.opacity > 0) {
      this.xPos = this.updateXPos(this.xPos, NightMode.config.MOON_SPEED);

      // Update stars.
      if (this.drawStars) {
        for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
          this.stars[i]!.x = this.updateXPos(
            this.stars[i]!.x,
            NightMode.config.STAR_SPEED,
          );
        }
      }
      this.draw();
    } else {
      this.opacity = 0;
      this.placeStars();
    }
    this.drawStars = true;
  }

  updateXPos(currentPos: number, speed: number): number {
    if (currentPos < -NightMode.config.WIDTH) {
      currentPos = this.containerWidth;
    } else {
      currentPos -= speed;
    }
    return currentPos;
  }

  draw(): void {
    let moonSourceWidth =
      this.currentPhase == 3
        ? NightMode.config.WIDTH * 2
        : NightMode.config.WIDTH;
    let moonSourceHeight = NightMode.config.HEIGHT;
    let moonSourceX =
      this.spritePos.x + NightMode.phases[this.currentPhase]!;
    const moonOutputWidth = moonSourceWidth;
    let starSize = NightMode.config.STAR_SIZE;
    let starSourceX = Runner.spriteDefinition.LDPI.STAR.x;

    if (IS_HIDPI) {
      moonSourceWidth *= 2;
      moonSourceHeight *= 2;
      moonSourceX =
        this.spritePos.x + NightMode.phases[this.currentPhase]! * 2;
      starSize *= 2;
      starSourceX = Runner.spriteDefinition.HDPI.STAR.x;
    }

    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = this.opacity;

    // Stars.
    if (this.drawStars) {
      for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
        this.canvasCtx.drawImage(
          Runner.imageSprite,
          starSourceX,
          this.stars[i]!.sourceY,
          starSize,
          starSize,
          Math.round(this.stars[i]!.x),
          this.stars[i]!.y,
          NightMode.config.STAR_SIZE,
          NightMode.config.STAR_SIZE,
        );
      }
    }

    // Moon.
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      moonSourceX,
      this.spritePos.y,
      moonSourceWidth,
      moonSourceHeight,
      Math.round(this.xPos),
      this.yPos,
      moonOutputWidth,
      NightMode.config.HEIGHT,
    );

    this.canvasCtx.globalAlpha = 1;
    this.canvasCtx.restore();
  }

  /** Do star placement. */
  placeStars(): void {
    const segmentSize = Math.round(
      this.containerWidth / NightMode.config.NUM_STARS,
    );

    for (let i = 0; i < NightMode.config.NUM_STARS; i++) {
      const sourceY = IS_HIDPI
        ? Runner.spriteDefinition.HDPI.STAR.y +
          NightMode.config.STAR_SIZE * 2 * i
        : Runner.spriteDefinition.LDPI.STAR.y +
          NightMode.config.STAR_SIZE * i;

      this.stars[i] = {
        x: getRandomNum(segmentSize * i, segmentSize * (i + 1)),
        y: getRandomNum(0, NightMode.config.STAR_MAX_Y),
        sourceY,
      };
    }
  }

  reset(): void {
    this.currentPhase = 0;
    this.opacity = 0;
    this.update(false);
  }
}
