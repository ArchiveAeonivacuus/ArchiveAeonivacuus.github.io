/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { FPS, IS_HIDPI, type SpritePosition } from './config.js';
import { getTimeStamp } from './utils.js';
import { Runner } from './runner.js';
import { CollisionBox } from './collision-box.js';

/** T-rex player config. */
export interface TrexConfig {
  DROP_VELOCITY: number;
  GRAVITY: number;
  HEIGHT: number;
  HEIGHT_DUCK: number;
  INIITAL_JUMP_VELOCITY: number;
  INTRO_DURATION: number;
  MAX_JUMP_HEIGHT: number;
  MIN_JUMP_HEIGHT: number;
  SPEED_DROP_COEFFICIENT: number;
  SPRITE_WIDTH: number;
  START_X_POS: number;
  WIDTH: number;
  WIDTH_DUCK: number;
}

/** Animation states. */
export type TrexStatus =
  | 'CRASHED'
  | 'DUCKING'
  | 'JUMPING'
  | 'RUNNING'
  | 'WAITING';

/** Animation config for a single state. */
interface AnimFrame {
  frames: number[];
  msPerFrame: number;
}

/** T-rex game character. */
export class Trex {
  /** T-rex player config. */
  static readonly config: TrexConfig = {
    DROP_VELOCITY: -5,
    GRAVITY: 0.6,
    HEIGHT: 47,
    HEIGHT_DUCK: 25,
    INIITAL_JUMP_VELOCITY: -10,
    INTRO_DURATION: 1500,
    MAX_JUMP_HEIGHT: 30,
    MIN_JUMP_HEIGHT: 30,
    SPEED_DROP_COEFFICIENT: 3,
    SPRITE_WIDTH: 262,
    START_X_POS: 50,
    WIDTH: 44,
    WIDTH_DUCK: 59,
  };

  /** Used in collision detection. */
  static readonly collisionBoxes: {
    DUCKING: CollisionBox[];
    RUNNING: CollisionBox[];
  } = {
    DUCKING: [new CollisionBox(1, 18, 55, 25)],
    RUNNING: [
      new CollisionBox(22, 0, 17, 16),
      new CollisionBox(1, 18, 30, 9),
      new CollisionBox(10, 35, 14, 8),
      new CollisionBox(1, 24, 29, 5),
      new CollisionBox(5, 30, 21, 4),
      new CollisionBox(9, 34, 15, 4),
    ],
  };

  static readonly status: Record<TrexStatus, TrexStatus> = {
    CRASHED: 'CRASHED',
    DUCKING: 'DUCKING',
    JUMPING: 'JUMPING',
    RUNNING: 'RUNNING',
    WAITING: 'WAITING',
  };

  /** Blinking coefficient. */
  static readonly BLINK_TIMING = 7000;

  /** Animation config for different states. */
  static readonly animFrames: Record<TrexStatus, AnimFrame> = {
    WAITING: {
      frames: [44, 0],
      msPerFrame: 1000 / 3,
    },
    RUNNING: {
      frames: [88, 132],
      msPerFrame: 1000 / 12,
    },
    CRASHED: {
      frames: [220],
      msPerFrame: 1000 / 60,
    },
    JUMPING: {
      frames: [0],
      msPerFrame: 1000 / 60,
    },
    DUCKING: {
      frames: [264, 323],
      msPerFrame: 1000 / 8,
    },
  };

  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  spritePos: SpritePosition;
  xPos = 0;
  yPos = 0;
  // Position when on the ground.
  groundYPos = 0;
  currentFrame = 0;
  currentAnimFrames: number[] = [];
  blinkDelay = 0;
  blinkCount = 0;
  animStartTime = 0;
  timer = 0;
  msPerFrame = 1000 / FPS;
  config: TrexConfig;
  // Current status.
  status: TrexStatus = Trex.status.WAITING;

  jumping = false;
  ducking = false;
  jumpVelocity = 0;
  reachedMinHeight = false;
  speedDrop = false;
  jumpCount = 0;

  minJumpHeight = 0;
  playingIntro?: boolean;

  constructor(canvas: HTMLCanvasElement, spritePos: SpritePosition) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d')!;
    this.spritePos = spritePos;
    this.config = Trex.config;

    this.init();
  }

  /**
   * T-rex player initaliser.
   * Sets the t-rex to blink at random intervals.
   */
  init(): void {
    this.groundYPos =
      Runner.defaultDimensions.HEIGHT -
      this.config.HEIGHT -
      Runner.config.BOTTOM_PAD;
    this.yPos = this.groundYPos;
    this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;

    this.draw(0, 0);
    this.update(0, Trex.status.WAITING);
  }

  /**
   * Setter for the jump velocity.
   * The approriate drop velocity is also set.
   */
  setJumpVelocity(setting: number): void {
    this.config.INIITAL_JUMP_VELOCITY = -setting;
    this.config.DROP_VELOCITY = -setting / 2;
  }

  /** Set the animation status. */
  update(deltaTime: number, opt_status?: TrexStatus): void {
    this.timer += deltaTime;

    // Update the status.
    if (opt_status) {
      this.status = opt_status;
      this.currentFrame = 0;
      this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
      this.currentAnimFrames = Trex.animFrames[opt_status].frames;

      if (opt_status == Trex.status.WAITING) {
        this.animStartTime = getTimeStamp();
        this.setBlinkDelay();
      }
    }

    // Game intro animation, T-rex moves in from the left.
    if (this.playingIntro && this.xPos < this.config.START_X_POS) {
      this.xPos += Math.round(
        (this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime,
      );
    }

    if (this.status == Trex.status.WAITING) {
      this.blink(getTimeStamp());
    } else {
      this.draw(this.currentAnimFrames[this.currentFrame]!, 0);
    }

    // Update the frame position.
    if (this.timer >= this.msPerFrame) {
      this.currentFrame =
        this.currentFrame == this.currentAnimFrames.length - 1
          ? 0
          : this.currentFrame + 1;
      this.timer = 0;
    }

    // Speed drop becomes duck if the down key is still being pressed.
    if (this.speedDrop && this.yPos == this.groundYPos) {
      this.speedDrop = false;
      this.setDuck(true);
    }
  }

  /** Draw the t-rex to a particular position. */
  draw(x: number, y: number): void {
    let sourceX = x;
    let sourceY = y;
    let sourceWidth =
      this.ducking && this.status != Trex.status.CRASHED
        ? this.config.WIDTH_DUCK
        : this.config.WIDTH;
    let sourceHeight = this.config.HEIGHT;

    if (IS_HIDPI) {
      sourceX *= 2;
      sourceY *= 2;
      sourceWidth *= 2;
      sourceHeight *= 2;
    }

    // Adjustments for sprite sheet position.
    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;

    // Ducking.
    if (this.ducking && this.status != Trex.status.CRASHED) {
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH_DUCK,
        this.config.HEIGHT,
      );
    } else {
      // Crashed whilst ducking. Trex is standing up so needs adjustment.
      if (this.ducking && this.status == Trex.status.CRASHED) {
        this.xPos++;
      }
      // Standing / running
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH,
        this.config.HEIGHT,
      );
    }
  }

  /** Sets a random time for the blink to happen. */
  setBlinkDelay(): void {
    this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
  }

  /** Make t-rex blink at random intervals. */
  blink(time: number): void {
    const deltaTime = time - this.animStartTime;

    if (deltaTime >= this.blinkDelay) {
      this.draw(this.currentAnimFrames[this.currentFrame]!, 0);

      if (this.currentFrame == 1) {
        // Set new random delay to blink.
        this.setBlinkDelay();
        this.animStartTime = time;
        this.blinkCount++;
      }
    }
  }

  /** Initialise a jump. */
  startJump(speed: number): void {
    if (!this.jumping) {
      this.update(0, Trex.status.JUMPING);
      // Tweak the jump velocity based on the speed.
      this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - speed / 10;
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;
    }
  }

  /** Jump is complete, falling down. */
  endJump(): void {
    if (
      this.reachedMinHeight &&
      this.jumpVelocity < this.config.DROP_VELOCITY
    ) {
      this.jumpVelocity = this.config.DROP_VELOCITY;
    }
  }

  /** Update frame for a jump. */
  updateJump(deltaTime: number, speed?: number): void {
    const msPerFrame = Trex.animFrames[this.status].msPerFrame;
    const framesElapsed = deltaTime / msPerFrame;

    // Speed drop makes Trex fall faster.
    if (this.speedDrop) {
      this.yPos += Math.round(
        this.jumpVelocity *
          this.config.SPEED_DROP_COEFFICIENT *
          framesElapsed,
      );
    } else {
      this.yPos += Math.round(this.jumpVelocity * framesElapsed);
    }

    this.jumpVelocity += this.config.GRAVITY * framesElapsed;

    // Minimum height has been reached.
    if (this.yPos < this.minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true;
    }

    // Reached max height
    if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump();
    }

    // Back down at ground level. Jump completed.
    if (this.yPos > this.groundYPos) {
      this.reset();
      this.jumpCount++;
    }

    this.update(deltaTime);
  }

  /** Set the speed drop. Immediately cancels the current jump. */
  setSpeedDrop(): void {
    this.speedDrop = true;
    this.jumpVelocity = 1;
  }

  setDuck(isDucking: boolean): void {
    if (isDucking && this.status != Trex.status.DUCKING) {
      this.update(0, Trex.status.DUCKING);
      this.ducking = true;
    } else if (this.status == Trex.status.DUCKING) {
      this.update(0, Trex.status.RUNNING);
      this.ducking = false;
    }
  }

  /** Reset the t-rex to running at start of game. */
  reset(): void {
    this.yPos = this.groundYPos;
    this.jumpVelocity = 0;
    this.jumping = false;
    this.ducking = false;
    this.update(0, Trex.status.RUNNING);
    this.speedDrop = false;
    this.jumpCount = 0;
  }
}
