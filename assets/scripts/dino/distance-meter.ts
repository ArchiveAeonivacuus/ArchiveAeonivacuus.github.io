/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { IS_HIDPI, type SpritePosition } from './config.js';
import { Runner } from './runner.js';

/** Handles displaying the distance meter. */
export class DistanceMeter {
  /** @enum {number} */
  static readonly dimensions = {
    WIDTH: 10,
    HEIGHT: 13,
    DEST_WIDTH: 11,
  };

  /**
   * Y positioning of the digits in the sprite sheet.
   * X position is always 0.
   */
  static readonly yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];

  /** Distance meter config. */
  static readonly config = {
    // Number of digits.
    MAX_DISTANCE_UNITS: 5,

    // Distance that causes achievement animation.
    ACHIEVEMENT_DISTANCE: 100,

    // Used for conversion from pixel distance to a scaled unit.
    COEFFICIENT: 0.025,

    // Flash duration in milliseconds.
    FLASH_DURATION: 1000 / 4,

    // Flash iterations for achievement animation.
    FLASH_ITERATIONS: 3,
  };

  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  spritePos: SpritePosition;
  x = 0;
  y = 5;

  maxScore = 0;
  highScore: string[] = [];

  digits: string[] = [];
  acheivement = false;
  defaultString = '';
  flashTimer = 0;
  flashIterations = 0;

  config = DistanceMeter.config;
  maxScoreUnits: number;

  constructor(
    canvas: HTMLCanvasElement,
    spritePos: SpritePosition,
    canvasWidth: number,
  ) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.image = Runner.imageSprite;
    this.spritePos = spritePos;

    this.maxScoreUnits = this.config.MAX_DISTANCE_UNITS;
    this.init(canvasWidth);
  }

  /** Initialise the distance meter to '00000'. */
  init(width: number): void {
    let maxDistanceStr = '';

    this.calcXPos(width);
    this.maxScore = this.maxScoreUnits;
    for (let i = 0; i < this.maxScoreUnits; i++) {
      this.draw(i, 0);
      this.defaultString += '0';
      maxDistanceStr += '9';
    }

    this.maxScore = parseInt(maxDistanceStr);
  }

  /** Calculate the xPos in the canvas. */
  calcXPos(canvasWidth: number): void {
    this.x =
      canvasWidth -
      DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1);
  }

  /** Draw a digit to canvas. */
  draw(digitPos: number, value: number, opt_highScore?: boolean): void {
    let sourceWidth = DistanceMeter.dimensions.WIDTH;
    let sourceHeight = DistanceMeter.dimensions.HEIGHT;
    let sourceX = DistanceMeter.dimensions.WIDTH * value;
    let sourceY = 0;

    const targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
    const targetY = this.y;
    const targetWidth = DistanceMeter.dimensions.WIDTH;
    const targetHeight = DistanceMeter.dimensions.HEIGHT;

    // For high DPI we 2x source values.
    if (IS_HIDPI) {
      sourceWidth *= 2;
      sourceHeight *= 2;
      sourceX *= 2;
    }

    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    this.canvasCtx.save();

    if (opt_highScore) {
      // Left of the current score.
      const highScoreX =
        this.x -
        this.maxScoreUnits * 2 * DistanceMeter.dimensions.WIDTH;
      this.canvasCtx.translate(highScoreX, this.y);
    } else {
      this.canvasCtx.translate(this.x, this.y);
    }

    this.canvasCtx.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight,
    );

    this.canvasCtx.restore();
  }

  /** Covert pixel distance to a 'real' distance. */
  getActualDistance(distance?: number): number {
    return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
  }

  /** Update the distance meter. */
  update(deltaTime: number, distance?: number): boolean {
    let paint = true;
    let playSound = false;

    if (!this.acheivement) {
      distance = this.getActualDistance(distance);
      // Score has gone beyond the initial digit count.
      if (
        distance > this.maxScore &&
        this.maxScoreUnits == this.config.MAX_DISTANCE_UNITS
      ) {
        this.maxScoreUnits++;
        this.maxScore = parseInt(this.maxScore + '9');
      }

      if (distance > 0) {
        // Acheivement unlocked
        if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
          // Flash score and play sound.
          this.acheivement = true;
          this.flashTimer = 0;
          playSound = true;
        }

        // Create a string representation of the distance with leading 0.
        const distanceStr = (this.defaultString + distance).substr(
          -this.maxScoreUnits,
        );
        this.digits = distanceStr.split('');
      } else {
        this.digits = this.defaultString.split('');
      }
    } else {
      // Control flashing of the score on reaching acheivement.
      if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
        this.flashTimer += deltaTime;

        if (this.flashTimer < this.config.FLASH_DURATION) {
          paint = false;
        } else if (this.flashTimer > this.config.FLASH_DURATION * 2) {
          this.flashTimer = 0;
          this.flashIterations++;
        }
      } else {
        this.acheivement = false;
        this.flashIterations = 0;
        this.flashTimer = 0;
      }
    }

    // Draw the digits if not flashing.
    if (paint) {
      for (let i = this.digits.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.digits[i]!));
      }
    }

    this.drawHighScore();
    return playSound;
  }

  /** Draw the high score. */
  drawHighScore(): void {
    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = 0.8;
    for (let i = this.highScore.length - 1; i >= 0; i--) {
      this.draw(i, parseInt(this.highScore[i]!, 10), true);
    }
    this.canvasCtx.restore();
  }

  /**
   * Set the highscore as a array string.
   * Position of char in the sprite: H - 10, I - 11.
   */
  setHighScore(distance: number): void {
    distance = this.getActualDistance(distance);
    const highScoreStr = (this.defaultString + distance).substr(
      -this.maxScoreUnits,
    );

    this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
  }

  /** Reset the distance meter back to '00000'. */
  reset(): void {
    this.update(0);
    this.acheivement = false;
  }
}
