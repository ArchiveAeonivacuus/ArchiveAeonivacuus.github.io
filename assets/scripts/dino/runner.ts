/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import {
  DEFAULT_WIDTH,
  FPS,
  IS_HIDPI,
  IS_IOS,
  IS_MOBILE,
  type CanvasDimensions,
  type SpriteDefinition,
} from './config.js';
import {
  createCanvas,
  decodeBase64ToArrayBuffer,
  getTimeStamp,
  vibrate,
} from './utils.js';
import { checkForCollision } from './collision.js';
import { GameOverPanel } from './game-over-panel.js';
import { Trex } from './trex.js';
import { DistanceMeter } from './distance-meter.js';
import { Horizon } from './horizon.js';

/** Provided by the host page when the easter egg is disabled. */
declare const loadTimeData: {
  getValue(key: string): string;
  valueExists(key: string): boolean;
};

/** Events handled by the runner carry vendor key/button information. */
type RunnerEvent = Event & { keyCode?: number; button?: number };

interface WindowWithExtras extends Window {
  errorPageController?: { trackEasterEgg(): void };
  Runner?: typeof Runner;
}

interface DocumentWithExtras extends Document {
  webkitHidden?: boolean;
}

/** Default game configuration. */
export interface RunnerConfig {
  ACCELERATION: number;
  BG_CLOUD_SPEED: number;
  BOTTOM_PAD: number;
  CLEAR_TIME: number;
  CLOUD_FREQUENCY: number;
  GAMEOVER_CLEAR_TIME: number;
  GAP_COEFFICIENT: number;
  GRAVITY: number;
  INITIAL_JUMP_VELOCITY: number;
  INVERT_FADE_DURATION: number;
  INVERT_DISTANCE: number;
  MAX_BLINK_COUNT: number;
  MAX_CLOUDS: number;
  MAX_OBSTACLE_LENGTH: number;
  MAX_OBSTACLE_DUPLICATION: number;
  MAX_SPEED: number;
  MIN_JUMP_HEIGHT: number;
  MOBILE_SPEED_COEFFICIENT: number;
  RESOURCE_TEMPLATE_ID: string;
  SPEED: number;
  SPEED_DROP_COEFFICIENT: number;
}

/** T-Rex runner. */
export class Runner {
  /** Singleton instance. */
  static instance_: Runner | null = null;

  /** Default game configuration. */
  static readonly config: RunnerConfig = {
    ACCELERATION: 0.001,
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 10,
    CLEAR_TIME: 3000,
    CLOUD_FREQUENCY: 0.5,
    GAMEOVER_CLEAR_TIME: 750,
    GAP_COEFFICIENT: 0.6,
    GRAVITY: 0.6,
    INITIAL_JUMP_VELOCITY: 12,
    INVERT_FADE_DURATION: 12000,
    INVERT_DISTANCE: 700,
    MAX_BLINK_COUNT: 3,
    MAX_CLOUDS: 6,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_OBSTACLE_DUPLICATION: 2,
    MAX_SPEED: 13,
    MIN_JUMP_HEIGHT: 35,
    MOBILE_SPEED_COEFFICIENT: 1.2,
    RESOURCE_TEMPLATE_ID: 'audio-resources',
    SPEED: 6,
    SPEED_DROP_COEFFICIENT: 3,
  };

  /** Default dimensions. */
  static readonly defaultDimensions: CanvasDimensions = {
    WIDTH: DEFAULT_WIDTH,
    HEIGHT: 150,
  };

  /** CSS class names. */
  static readonly classes = {
    CANVAS: 'runner-canvas',
    CONTAINER: 'runner-container',
    CRASHED: 'crashed',
    ICON: 'icon-offline',
    INVERTED: 'inverted',
    SNACKBAR: 'snackbar',
    SNACKBAR_SHOW: 'snackbar-show',
    TOUCH_CONTROLLER: 'controller',
  };

  /** Sprite definition layout of the spritesheet. */
  static readonly spriteDefinition: {
    LDPI: SpriteDefinition;
    HDPI: SpriteDefinition;
  } = {
    LDPI: {
      CACTUS_LARGE: { x: 332, y: 2 },
      CACTUS_SMALL: { x: 228, y: 2 },
      CLOUD: { x: 86, y: 2 },
      HORIZON: { x: 2, y: 54 },
      MOON: { x: 484, y: 2 },
      PTERODACTYL: { x: 134, y: 2 },
      RESTART: { x: 2, y: 2 },
      TEXT_SPRITE: { x: 655, y: 2 },
      TREX: { x: 848, y: 2 },
      STAR: { x: 645, y: 2 },
    },
    HDPI: {
      CACTUS_LARGE: { x: 652, y: 2 },
      CACTUS_SMALL: { x: 446, y: 2 },
      CLOUD: { x: 166, y: 2 },
      HORIZON: { x: 2, y: 104 },
      MOON: { x: 954, y: 2 },
      PTERODACTYL: { x: 260, y: 2 },
      RESTART: { x: 2, y: 2 },
      TEXT_SPRITE: { x: 1294, y: 2 },
      TREX: { x: 1678, y: 2 },
      STAR: { x: 1276, y: 2 },
    },
  };

  /** Sound FX. Reference to the ID of the audio tag on interstitial page. */
  static readonly sounds = {
    BUTTON_PRESS: 'offline-sound-press',
    HIT: 'offline-sound-hit',
    SCORE: 'offline-sound-reached',
  } as const;

  /** Key code mapping. */
  static readonly keycodes: {
    JUMP: Record<string, number>;
    DUCK: Record<string, number>;
    RESTART: Record<string, number>;
  } = {
    JUMP: { '38': 1, '32': 1 }, // Up, spacebar
    DUCK: { '40': 1 }, // Down
    RESTART: { '13': 1 }, // Enter
  };

  /** Runner event names. */
  static readonly events = {
    ANIM_END: 'webkitAnimationEnd',
    CLICK: 'click',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
    RESIZE: 'resize',
    TOUCHEND: 'touchend',
    TOUCHSTART: 'touchstart',
    VISIBILITY: 'visibilitychange',
    BLUR: 'blur',
    FOCUS: 'focus',
    LOAD: 'load',
  } as const;

  /** The sprite image element loaded from the page. */
  declare static imageSprite: HTMLImageElement;

  outerContainerEl!: HTMLElement;
  containerEl!: HTMLDivElement;
  detailsButton: Element | null = null;

  config!: RunnerConfig;

  dimensions!: CanvasDimensions;

  canvas: HTMLCanvasElement | null = null;
  canvasCtx!: CanvasRenderingContext2D;

  tRex!: Trex;

  distanceMeter!: DistanceMeter;
  distanceRan = 0;

  highestScore = 0;

  time = 0;
  runningTime = 0;
  msPerFrame = 1000 / FPS;
  currentSpeed!: number;

  activated = false; // Whether the easter egg has been activated.
  playing = false; // Whether the game is currently in play state.
  crashed = false;
  paused = false;
  inverted = false;
  invertTrigger = false;
  invertTimer = 0;
  resizeTimerId_: number | null = null;

  playCount = 0;

  // Sound FX.
  soundFx: Record<string, AudioBuffer> = {};

  // Global web audio context for playing sounds.
  audioContext: AudioContext | null = null;

  spriteDef!: SpriteDefinition;
  gameOverPanel: GameOverPanel | null = null;
  horizon!: Horizon;
  touchController!: HTMLDivElement;
  playingIntro = false;
  updatePending = false;
  raqId = 0;

  constructor(outerContainerId: string, opt_config?: RunnerConfig) {
    // Singleton
    if (Runner.instance_) {
      return Runner.instance_;
    }
    Runner.instance_ = this;

    this.outerContainerEl = document.querySelector(
      outerContainerId,
    ) as HTMLElement;
    this.detailsButton = this.outerContainerEl.querySelector('#details-button');

    this.config = opt_config || Runner.config;

    this.dimensions = Runner.defaultDimensions;

    this.currentSpeed = this.config.SPEED;

    if (this.isDisabled()) {
      this.setupDisabledRunner();
    } else {
      this.loadImages();
    }
  }

  /**
   * Whether the easter egg has been disabled. CrOS enterprise enrolled devices.
   */
  isDisabled(): boolean {
    // return loadTimeData && loadTimeData.valueExists('disabledEasterEgg');
    return false;
  }

  /** For disabled instances, set up a snackbar with the disabled message. */
  setupDisabledRunner(): void {
    this.containerEl = document.createElement('div');
    this.containerEl.className = Runner.classes.SNACKBAR;
    this.containerEl.textContent = loadTimeData.getValue('disabledEasterEgg');
    this.outerContainerEl.appendChild(this.containerEl);

    // Show notification when the activation key is pressed.
    document.addEventListener(Runner.events.KEYDOWN, (e: Event) => {
      const keyEvent = e as RunnerEvent;
      if (Runner.keycodes.JUMP[String(keyEvent.keyCode)]) {
        this.containerEl.classList.add(Runner.classes.SNACKBAR_SHOW);
        document.querySelector('.icon')!.classList.add('icon-disabled');
      }
    });
  }

  /** Setting individual settings for debugging. */
  updateConfigSetting(setting: string, value: unknown): void {
    if (setting in this.config && value != undefined) {
      (this.config as unknown as Record<string, unknown>)[setting] = value;

      switch (setting) {
        case 'GRAVITY':
        case 'MIN_JUMP_HEIGHT':
        case 'SPEED_DROP_COEFFICIENT':
          (this.tRex.config as unknown as Record<string, unknown>)[setting] =
            value;
          break;
        case 'INITIAL_JUMP_VELOCITY':
          this.tRex.setJumpVelocity(value as number);
          break;
        case 'SPEED':
          this.setSpeed(value as number);
          break;
      }
    }
  }

  /**
   * Cache the appropriate image sprite from the page and get the sprite sheet
   * definition.
   */
  loadImages(): void {
    if (IS_HIDPI) {
      Runner.imageSprite = document.getElementById(
        'offline-resources-2x',
      ) as HTMLImageElement;
      this.spriteDef = Runner.spriteDefinition.HDPI;
    } else {
      Runner.imageSprite = document.getElementById(
        'offline-resources-1x',
      ) as HTMLImageElement;
      this.spriteDef = Runner.spriteDefinition.LDPI;
    }

    if (Runner.imageSprite.complete) {
      this.init();
    } else {
      // If the images are not yet loaded, add a listener.
      Runner.imageSprite.addEventListener(
        Runner.events.LOAD,
        this.init.bind(this),
      );
    }
  }

  /** Load and decode base 64 encoded sounds. */
  loadSounds(): void {
    if (!IS_IOS) {
      const audioContext = new AudioContext();
      this.audioContext = audioContext;

      const resourceTemplate = (
        document.getElementById(
          this.config.RESOURCE_TEMPLATE_ID,
        ) as HTMLTemplateElement
      ).content;

      for (const sound in Runner.sounds) {
        const key = sound as keyof typeof Runner.sounds;
        const soundEl = resourceTemplate.getElementById(
          Runner.sounds[key],
        ) as HTMLAudioElement;
        let soundSrc = soundEl.src;
        soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);
        const buffer = decodeBase64ToArrayBuffer(soundSrc);

        // Async, so no guarantee of order in array.
        audioContext.decodeAudioData(buffer, (audioData: AudioBuffer) => {
          this.soundFx[key] = audioData;
        });
      }
    }
  }

  /**
   * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
   */
  setSpeed(opt_speed?: number): void {
    const speed = opt_speed || this.currentSpeed;

    // Reduce the speed on smaller mobile screens.
    if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
      const mobileSpeed =
        ((speed * this.dimensions.WIDTH) / DEFAULT_WIDTH) *
        this.config.MOBILE_SPEED_COEFFICIENT;
      this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
    } else if (opt_speed) {
      this.currentSpeed = opt_speed;
    }
  }

  /** Game initialiser. */
  init(): void {
    // Hide the static icon.
    (
      document.querySelector('.' + Runner.classes.ICON) as HTMLElement
    ).style.visibility = 'hidden';

    this.adjustDimensions();
    this.setSpeed();

    this.containerEl = document.createElement('div');
    this.containerEl.className = Runner.classes.CONTAINER;

    // Player canvas container.
    this.canvas = createCanvas(
      this.containerEl,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
      undefined,
    );

    this.canvasCtx = this.canvas.getContext('2d')!;
    this.canvasCtx.fillStyle = '#f7f7f7';
    this.canvasCtx.fill();
    Runner.updateCanvasScaling(this.canvas);

    // Horizon contains clouds, obstacles and the ground.
    this.horizon = new Horizon(
      this.canvas,
      this.spriteDef,
      this.dimensions,
      this.config.GAP_COEFFICIENT,
    );

    // Distance meter
    this.distanceMeter = new DistanceMeter(
      this.canvas,
      this.spriteDef.TEXT_SPRITE,
      this.dimensions.WIDTH,
    );

    // Draw t-rex
    this.tRex = new Trex(this.canvas, this.spriteDef.TREX);

    this.outerContainerEl.appendChild(this.containerEl);

    if (IS_MOBILE) {
      this.createTouchController();
    }

    this.startListening();
    this.update();

    window.addEventListener(
      Runner.events.RESIZE,
      this.debounceResize.bind(this),
    );
  }

  /** Create the touch controller. A div that covers whole screen. */
  createTouchController(): void {
    this.touchController = document.createElement('div');
    this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
    this.outerContainerEl.appendChild(this.touchController);
  }

  /** Debounce the resize event. */
  debounceResize(): void {
    if (!this.resizeTimerId_) {
      this.resizeTimerId_ = window.setInterval(
        this.adjustDimensions.bind(this),
        250,
      );
    }
  }

  /** Adjust game space dimensions on resize. */
  adjustDimensions(): void {
    window.clearInterval(this.resizeTimerId_ ?? undefined);
    this.resizeTimerId_ = null;

    const boxStyles = window.getComputedStyle(this.outerContainerEl);
    const padding = Number(
      boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2),
    );

    this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;

    // Redraw the elements back onto the canvas.
    if (this.canvas) {
      this.canvas.width = this.dimensions.WIDTH;
      this.canvas.height = this.dimensions.HEIGHT;

      Runner.updateCanvasScaling(this.canvas);

      this.distanceMeter.calcXPos(this.dimensions.WIDTH);
      this.clearCanvas();
      this.horizon.update(0, 0, true);
      this.tRex.update(0);

      // Outer container and distance meter.
      if (this.playing || this.crashed || this.paused) {
        this.containerEl.style.width = this.dimensions.WIDTH + 'px';
        this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
        this.distanceMeter.update(0, Math.ceil(this.distanceRan));
        this.stop();
      } else {
        this.tRex.draw(0, 0);
      }

      // Game over panel.
      if (this.crashed && this.gameOverPanel) {
        this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
        this.gameOverPanel.draw();
      }
    }
  }

  /**
   * Play the game intro.
   * Canvas container width expands out to the full width.
   */
  playIntro(): void {
    if (!this.activated && !this.crashed) {
      this.playingIntro = true;
      this.tRex.playingIntro = true;

      // CSS animation definition.
      const keyframes =
        '@-webkit-keyframes intro { ' +
        'from { width:' +
        Trex.config.WIDTH +
        'px }' +
        'to { width: ' +
        this.dimensions.WIDTH +
        'px }' +
        '}';

      // create a style sheet to put the keyframe rule in
      // and then place the style sheet in the html head
      const sheet = document.createElement('style');
      sheet.innerHTML = keyframes;
      document.head.appendChild(sheet);

      this.containerEl.addEventListener(
        Runner.events.ANIM_END,
        this.startGame.bind(this),
      );

      const style = this.containerEl.style as CSSStyleDeclaration & {
        webkitAnimation: string;
      };
      style.webkitAnimation = 'intro .4s ease-out 1 both';
      this.containerEl.style.width = this.dimensions.WIDTH + 'px';

      this.playing = true;
      this.activated = true;
    } else if (this.crashed) {
      this.restart();
    }
  }

  /** Update the game status to started. */
  startGame(): void {
    this.runningTime = 0;
    this.playingIntro = false;
    this.tRex.playingIntro = false;
    const style = this.containerEl.style as CSSStyleDeclaration & {
      webkitAnimation: string;
    };
    style.webkitAnimation = '';
    this.playCount++;

    // Handle tabbing off the page. Pause the current game.
    document.addEventListener(
      Runner.events.VISIBILITY,
      this.onVisibilityChange.bind(this),
    );

    window.addEventListener(
      Runner.events.BLUR,
      this.onVisibilityChange.bind(this),
    );

    window.addEventListener(
      Runner.events.FOCUS,
      this.onVisibilityChange.bind(this),
    );
  }

  clearCanvas(): void {
    this.canvasCtx.clearRect(
      0,
      0,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
    );
  }

  /** Update the game frame and schedules the next one. */
  update(): void {
    this.updatePending = false;

    const now = getTimeStamp();
    let deltaTime = now - (this.time || now);
    this.time = now;

    if (this.playing) {
      this.clearCanvas();

      if (this.tRex.jumping) {
        this.tRex.updateJump(deltaTime);
      }

      this.runningTime += deltaTime;
      const hasObstacles = this.runningTime > this.config.CLEAR_TIME;

      // First jump triggers the intro.
      if (this.tRex.jumpCount == 1 && !this.playingIntro) {
        this.playIntro();
      }

      // The horizon doesn't move until the intro is over.
      if (this.playingIntro) {
        this.horizon.update(0, this.currentSpeed, hasObstacles);
      } else {
        deltaTime = !this.activated ? 0 : deltaTime;
        this.horizon.update(
          deltaTime,
          this.currentSpeed,
          hasObstacles,
          this.inverted,
        );
      }

      // Check for collisions.
      const collision =
        hasObstacles &&
        checkForCollision(this.horizon.obstacles[0]!, this.tRex);

      if (!collision) {
        this.distanceRan +=
          (this.currentSpeed * deltaTime) / this.msPerFrame;

        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }

      const playAchievementSound = this.distanceMeter.update(
        deltaTime,
        Math.ceil(this.distanceRan),
      );

      if (playAchievementSound) {
        this.playSound(this.soundFx.SCORE);
      }

      // Night mode.
      if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
        this.invertTimer = 0;
        this.invertTrigger = false;
        this.invert();
      } else if (this.invertTimer) {
        this.invertTimer += deltaTime;
      } else {
        const actualDistance = this.distanceMeter.getActualDistance(
          Math.ceil(this.distanceRan),
        );

        if (actualDistance > 0) {
          this.invertTrigger = !(
            actualDistance % this.config.INVERT_DISTANCE
          );

          if (this.invertTrigger && this.invertTimer === 0) {
            this.invertTimer += deltaTime;
            this.invert();
          }
        }
      }
    }

    if (
      this.playing ||
      (!this.activated &&
        this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)
    ) {
      this.tRex.update(deltaTime);
      this.scheduleNextUpdate();
    }
  }

  /** Event handler. */
  handleEvent(e: Event): void {
    const evtType = e.type;
    switch (evtType) {
      case Runner.events.KEYDOWN:
      case Runner.events.TOUCHSTART:
      case Runner.events.MOUSEDOWN:
        this.onKeyDown(e as RunnerEvent);
        break;
      case Runner.events.KEYUP:
      case Runner.events.TOUCHEND:
      case Runner.events.MOUSEUP:
        this.onKeyUp(e as RunnerEvent);
        break;
    }
  }

  /** Bind relevant key / mouse / touch listeners. */
  startListening(): void {
    // Keys.
    document.addEventListener(Runner.events.KEYDOWN, this);
    document.addEventListener(Runner.events.KEYUP, this);

    if (IS_MOBILE) {
      // Mobile only touch devices.
      this.touchController.addEventListener(Runner.events.TOUCHSTART, this);
      this.touchController.addEventListener(Runner.events.TOUCHEND, this);
      this.containerEl.addEventListener(Runner.events.TOUCHSTART, this);
    } else {
      // Mouse.
      document.addEventListener(Runner.events.MOUSEDOWN, this);
      document.addEventListener(Runner.events.MOUSEUP, this);
    }
  }

  /** Remove all listeners. */
  stopListening(): void {
    document.removeEventListener(Runner.events.KEYDOWN, this);
    document.removeEventListener(Runner.events.KEYUP, this);

    if (IS_MOBILE) {
      this.touchController.removeEventListener(
        Runner.events.TOUCHSTART,
        this,
      );
      this.touchController.removeEventListener(
        Runner.events.TOUCHEND,
        this,
      );
      this.containerEl.removeEventListener(
        Runner.events.TOUCHSTART,
        this,
      );
    } else {
      document.removeEventListener(Runner.events.MOUSEDOWN, this);
      document.removeEventListener(Runner.events.MOUSEUP, this);
    }
  }

  /** Process keydown. */
  onKeyDown(e: RunnerEvent): void {
    // Prevent native page scrolling whilst tapping on mobile.
    if (IS_MOBILE && this.playing) {
      e.preventDefault();
    }

    if (e.target !== this.detailsButton) {
      if (
        !this.crashed &&
        (Runner.keycodes.JUMP[String(e.keyCode)] ||
          e.type == Runner.events.TOUCHSTART)
      ) {
        if (!this.playing) {
          this.loadSounds();
          this.playing = true;
          this.update();
          const win = window as WindowWithExtras;
          if (win.errorPageController) {
            win.errorPageController.trackEasterEgg();
          }
        }
        //  Play sound effect and jump on starting the game for the first time.
        if (!this.tRex.jumping && !this.tRex.ducking) {
          this.playSound(this.soundFx.BUTTON_PRESS);
          this.tRex.startJump(this.currentSpeed);
        }
      }

      if (
        this.crashed &&
        e.type == Runner.events.TOUCHSTART &&
        e.currentTarget == this.containerEl
      ) {
        this.restart();
      }
    }

    if (
      this.playing &&
      !this.crashed &&
      Runner.keycodes.DUCK[String(e.keyCode)]
    ) {
      e.preventDefault();
      if (this.tRex.jumping) {
        // Speed drop, activated only when jump key is not pressed.
        this.tRex.setSpeedDrop();
      } else if (!this.tRex.jumping && !this.tRex.ducking) {
        // Duck.
        this.tRex.setDuck(true);
      }
    }
  }

  /** Process key up. */
  onKeyUp(e: RunnerEvent): void {
    const keyCode = String(e.keyCode);
    const isjumpKey =
      Runner.keycodes.JUMP[keyCode] ||
      e.type == Runner.events.TOUCHEND ||
      e.type == Runner.events.MOUSEDOWN;

    if (this.isRunning() && isjumpKey) {
      this.tRex.endJump();
    } else if (Runner.keycodes.DUCK[keyCode]) {
      this.tRex.speedDrop = false;
      this.tRex.setDuck(false);
    } else if (this.crashed) {
      // Check that enough time has elapsed before allowing jump key to restart.
      const deltaTime = getTimeStamp() - this.time;

      if (
        Runner.keycodes.RESTART[keyCode] ||
        this.isLeftClickOnCanvas(e) ||
        (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
          Runner.keycodes.JUMP[keyCode])
      ) {
        this.restart();
      }
    } else if (this.paused && isjumpKey) {
      // Reset the jump state
      this.tRex.reset();
      this.play();
    }
  }

  /**
   * Returns whether the event was a left click on canvas.
   * On Windows right click is registered as a click.
   */
  isLeftClickOnCanvas(e: RunnerEvent): boolean {
    return (
      e.button != null &&
      e.button < 2 &&
      e.type == Runner.events.MOUSEUP &&
      e.target == this.canvas
    );
  }

  /** RequestAnimationFrame wrapper. */
  scheduleNextUpdate(): void {
    if (!this.updatePending) {
      this.updatePending = true;
      this.raqId = requestAnimationFrame(this.update.bind(this));
    }
  }

  /** Whether the game is running. */
  isRunning(): boolean {
    return !!this.raqId;
  }

  /** Game over state. */
  gameOver(): void {
    this.playSound(this.soundFx.HIT);
    vibrate(200);

    this.stop();
    this.crashed = true;
    this.distanceMeter.acheivement = false;

    this.tRex.update(100, Trex.status.CRASHED);

    // Game over panel.
    if (!this.gameOverPanel) {
      this.gameOverPanel = new GameOverPanel(
        this.canvas!,
        this.spriteDef.TEXT_SPRITE,
        this.spriteDef.RESTART,
        this.dimensions,
      );
    } else {
      this.gameOverPanel.draw();
    }

    // Update the high score.
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }

    // Reset the time clock.
    this.time = getTimeStamp();
  }

  stop(): void {
    this.playing = false;
    this.paused = true;
    cancelAnimationFrame(this.raqId);
    this.raqId = 0;
  }

  play(): void {
    if (!this.crashed) {
      this.playing = true;
      this.paused = false;
      this.tRex.update(0, Trex.status.RUNNING);
      this.time = getTimeStamp();
      this.update();
    }
  }

  restart(): void {
    if (!this.raqId) {
      this.playCount++;
      this.runningTime = 0;
      this.playing = true;
      this.crashed = false;
      this.distanceRan = 0;
      this.setSpeed(this.config.SPEED);
      this.time = getTimeStamp();
      this.containerEl.classList.remove(Runner.classes.CRASHED);
      this.clearCanvas();
      this.distanceMeter.reset();
      this.horizon.reset();
      this.tRex.reset();
      this.playSound(this.soundFx.BUTTON_PRESS);
      this.invert(true);
      this.update();
    }
  }

  /** Pause the game if the tab is not in focus. */
  onVisibilityChange(e: Event): void {
    const doc = document as DocumentWithExtras;
    if (
      document.hidden ||
      doc.webkitHidden ||
      e.type == 'blur' ||
      document.visibilityState != 'visible'
    ) {
      this.stop();
    } else if (!this.crashed) {
      this.tRex.reset();
      this.play();
    }
  }

  /** Play a sound. */
  playSound(soundBuffer?: AudioBuffer): void {
    if (soundBuffer) {
      const sourceNode = this.audioContext!.createBufferSource();
      sourceNode.buffer = soundBuffer;
      sourceNode.connect(this.audioContext!.destination);
      sourceNode.start(0);
    }
  }

  /** Inverts the current page / canvas colors. */
  invert(reset?: boolean): void {
    if (reset) {
      document
        .getElementById('t')!
        .classList.toggle(Runner.classes.INVERTED, false);
      this.invertTimer = 0;
      this.inverted = false;
    } else {
      this.inverted = document
        .getElementById('t')!
        .classList.toggle(Runner.classes.INVERTED, this.invertTrigger);
    }
  }

  /**
   * Updates the canvas size taking into
   * account the backing store pixel ratio and
   * the device pixel ratio.
   *
   * See article by Paul Lewis:
   * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
   */
  static updateCanvasScaling(
    canvas: HTMLCanvasElement,
    opt_width?: number,
    opt_height?: number,
  ): boolean {
    const context = canvas.getContext('2d')!;

    // Query the various pixel ratios
    const devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
    const vendorContext = context as CanvasRenderingContext2D & {
      webkitBackingStorePixelRatio?: number;
    };
    const backingStoreRatio =
      Math.floor(vendorContext.webkitBackingStorePixelRatio ?? 0) || 1;
    const ratio = devicePixelRatio / backingStoreRatio;

    // Upscale the canvas if the two ratios don't match
    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = opt_width || canvas.width;
      const oldHeight = opt_height || canvas.height;

      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;

      canvas.style.width = oldWidth + 'px';
      canvas.style.height = oldHeight + 'px';

      // Scale the context to counter the fact that we've manually scaled
      // our canvas element.
      context.scale(ratio, ratio);
      return true;
    } else if (devicePixelRatio == 1) {
      // Reset the canvas width / height. Fixes scaling bug when the page is
      // zoomed and the devicePixelRatio changes accordingly.
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
    }
    return false;
  }
}

(window as WindowWithExtras).Runner = Runner;
