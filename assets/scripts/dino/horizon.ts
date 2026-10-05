/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import {
  FPS,
  IS_HIDPI,
  type CanvasDimensions,
  type SpriteDefinition,
  type SpritePosition,
} from './config.js';
import { getRandomNum } from './utils.js';
import { Runner } from './runner.js';
import { Cloud } from './cloud.js';
import { NightMode } from './night-mode.js';
import { Obstacle } from './obstacle.js';

interface HorizonDimensions {
  WIDTH: number;
  HEIGHT: number;
  YPOS: number;
}

const HORIZON_DIMENSION_KEYS = ['WIDTH', 'HEIGHT', 'YPOS'] as const;

/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 */
export class HorizonLine {
  /** Horizon line dimensions. */
  static readonly dimensions: HorizonDimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    YPOS: 127,
  };

  spritePos: SpritePosition;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  sourceDimensions: HorizonDimensions = { WIDTH: 0, HEIGHT: 0, YPOS: 0 };
  dimensions: HorizonDimensions;
  sourceXPos: number[];
  xPos: number[] = [];
  yPos = 0;
  bumpThreshold = 0.5;

  constructor(canvas: HTMLCanvasElement, spritePos: SpritePosition) {
    this.spritePos = spritePos;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.dimensions = HorizonLine.dimensions;
    this.sourceXPos = [
      this.spritePos.x,
      this.spritePos.x + this.dimensions.WIDTH,
    ];

    this.setSourceDimensions();
    this.draw();
  }

  /** Set the source dimensions of the horizon line. */
  setSourceDimensions(): void {
    for (const dimension of HORIZON_DIMENSION_KEYS) {
      if (IS_HIDPI) {
        if (dimension != 'YPOS') {
          this.sourceDimensions[dimension] =
            HorizonLine.dimensions[dimension] * 2;
        }
      } else {
        this.sourceDimensions[dimension] = HorizonLine.dimensions[dimension];
      }
      this.dimensions[dimension] = HorizonLine.dimensions[dimension];
    }

    this.xPos = [0, HorizonLine.dimensions.WIDTH];
    this.yPos = HorizonLine.dimensions.YPOS;
  }

  /** Return the crop x position of a type. */
  getRandomType(): number {
    return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
  }

  /** Draw the horizon line. */
  draw(): void {
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[0]!,
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[0]!,
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
    );

    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[1]!,
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[1]!,
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
    );
  }

  /** Update the x position of an indivdual piece of the line. */
  updateXPos(pos: number, increment: number): void {
    const line1 = pos;
    const line2 = pos == 0 ? 1 : 0;

    this.xPos[line1] = this.xPos[line1]! - increment;
    this.xPos[line2] = this.xPos[line1]! + this.dimensions.WIDTH;

    if (this.xPos[line1]! <= -this.dimensions.WIDTH) {
      this.xPos[line1] = this.xPos[line1]! + this.dimensions.WIDTH * 2;
      this.xPos[line2] = this.xPos[line1]! - this.dimensions.WIDTH;
      this.sourceXPos[line1] = this.getRandomType() + this.spritePos.x;
    }
  }

  /** Update the horizon line. */
  update(deltaTime: number, speed: number): void {
    const increment = Math.floor(speed * (FPS / 1000) * deltaTime);

    if (this.xPos[0]! <= 0) {
      this.updateXPos(0, increment);
    } else {
      this.updateXPos(1, increment);
    }
    this.draw();
  }

  /** Reset horizon to the starting position. */
  reset(): void {
    this.xPos[0] = 0;
    this.xPos[1] = HorizonLine.dimensions.WIDTH;
  }
}

//******************************************************************************

/**
 * Horizon background class.
 */
export class Horizon {
  /** Horizon config. */
  static readonly config = {
    BG_CLOUD_SPEED: 0.2,
    BUMPY_THRESHOLD: 0.3,
    CLOUD_FREQUENCY: 0.5,
    HORIZON_HEIGHT: 16,
    MAX_CLOUDS: 6,
  };

  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  config = Horizon.config;
  dimensions: CanvasDimensions;
  gapCoefficient: number;
  obstacles: Obstacle[] = [];
  obstacleHistory: string[] = [];
  horizonOffsets = [0, 0];
  cloudFrequency: number;
  spritePos: SpriteDefinition;
  nightMode!: NightMode;

  // Cloud
  clouds: Cloud[] = [];
  cloudSpeed: number;

  // Horizon
  horizonLine!: HorizonLine;
  runningTime = 0;

  constructor(
    canvas: HTMLCanvasElement,
    spritePos: SpriteDefinition,
    dimensions: CanvasDimensions,
    gapCoefficient: number,
  ) {
    this.canvas = canvas;
    this.canvasCtx = this.canvas.getContext('2d')!;
    this.dimensions = dimensions;
    this.gapCoefficient = gapCoefficient;
    this.cloudFrequency = this.config.CLOUD_FREQUENCY;
    this.spritePos = spritePos;
    this.cloudSpeed = this.config.BG_CLOUD_SPEED;

    this.init();
  }

  /** Initialise the horizon. Just add the line and a cloud. No obstacles. */
  init(): void {
    this.addCloud();
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);
    this.nightMode = new NightMode(
      this.canvas,
      this.spritePos.MOON,
      this.dimensions.WIDTH,
    );
  }

  /**
   * @param updateObstacles Used as an override to prevent
   *     the obstacles from being updated / added. This happens in the
   *     ease in section.
   * @param showNightMode Night mode activated.
   */
  update(
    deltaTime: number,
    currentSpeed: number,
    updateObstacles: boolean,
    showNightMode?: boolean,
  ): void {
    this.runningTime += deltaTime;
    this.horizonLine.update(deltaTime, currentSpeed);
    this.nightMode.update(showNightMode ?? false);
    this.updateClouds(deltaTime, currentSpeed);

    if (updateObstacles) {
      this.updateObstacles(deltaTime, currentSpeed);
    }
  }

  /** Update the cloud positions. */
  updateClouds(deltaTime: number, speed: number): void {
    const cloudSpeed = (this.cloudSpeed / 1000) * deltaTime * speed;
    const numClouds = this.clouds.length;

    if (numClouds) {
      for (let i = numClouds - 1; i >= 0; i--) {
        this.clouds[i]!.update(cloudSpeed);
      }

      const lastCloud = this.clouds[numClouds - 1]!;

      // Check for adding a new cloud.
      if (
        numClouds < this.config.MAX_CLOUDS &&
        this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
        this.cloudFrequency > Math.random()
      ) {
        this.addCloud();
      }

      // Remove expired clouds.
      this.clouds = this.clouds.filter((obj) => !obj.remove);
    } else {
      this.addCloud();
    }
  }

  /** Update the obstacle positions. */
  updateObstacles(deltaTime: number, currentSpeed: number): void {
    // Obstacles, move to Horizon layer.
    const updatedObstacles = this.obstacles.slice(0);

    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i]!;
      obstacle.update(deltaTime, currentSpeed);

      // Clean up existing obstacles.
      if (obstacle.remove) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;

    if (this.obstacles.length > 0) {
      const lastObstacle = this.obstacles[this.obstacles.length - 1]!;

      if (
        lastObstacle &&
        !lastObstacle.followingObstacleCreated &&
        lastObstacle.isVisible() &&
        lastObstacle.xPos + lastObstacle.width + lastObstacle.gap <
          this.dimensions.WIDTH
      ) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      // Create new obstacles.
      this.addNewObstacle(currentSpeed);
    }
  }

  removeFirstObstacle(): void {
    this.obstacles.shift();
  }

  /** Add a new obstacle. */
  addNewObstacle(currentSpeed: number): void {
    const obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
    const obstacleType = Obstacle.types[obstacleTypeIndex]!;

    // Check for multiples of the same type of obstacle.
    // Also check obstacle is available at current speed.
    if (
      this.duplicateObstacleCheck(obstacleType.type) ||
      currentSpeed < obstacleType.minSpeed
    ) {
      this.addNewObstacle(currentSpeed);
    } else {
      const obstacleSpritePos = this.spritePos[obstacleType.type];

      this.obstacles.push(
        new Obstacle(
          this.canvasCtx,
          obstacleType,
          obstacleSpritePos,
          this.dimensions,
          this.gapCoefficient,
          currentSpeed,
          obstacleType.width,
        ),
      );

      this.obstacleHistory.unshift(obstacleType.type);

      if (this.obstacleHistory.length > 1) {
        this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION);
      }
    }
  }

  /**
   * Returns whether the previous two obstacles are the same as the next one.
   * Maximum duplication is set in config value MAX_OBSTACLE_DUPLICATION.
   */
  duplicateObstacleCheck(nextObstacleType: string): boolean {
    let duplicateCount = 0;

    for (let i = 0; i < this.obstacleHistory.length; i++) {
      duplicateCount =
        this.obstacleHistory[i] == nextObstacleType ? duplicateCount + 1 : 0;
    }
    return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION;
  }

  /**
   * Reset the horizon layer.
   * Remove existing obstacles and reposition the horizon line.
   */
  reset(): void {
    this.obstacles = [];
    this.horizonLine.reset();
    this.nightMode.reset();
  }

  /** Update the canvas width and scaling. */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /** Add a new cloud to the horizon. */
  addCloud(): void {
    this.clouds.push(
      new Cloud(this.canvas, this.spritePos.CLOUD, this.dimensions.WIDTH),
    );
  }
}
