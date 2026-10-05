// assets/scripts/dino/config.ts
var DEFAULT_WIDTH = 600;
var FPS = 60;
var IS_HIDPI = window.devicePixelRatio > 1;
var IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);
var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

// assets/scripts/dino/utils.ts
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function vibrate(duration) {
  if (IS_MOBILE && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}
function createCanvas(container, width, height, opt_classname) {
  const canvas = document.createElement("canvas");
  canvas.className = opt_classname ? Runner.classes.CANVAS + " " + opt_classname : Runner.classes.CANVAS;
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);
  return canvas;
}
function decodeBase64ToArrayBuffer(base64String) {
  const len = base64String.length / 4 * 3;
  const str = atob(base64String);
  const arrayBuffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}
function getTimeStamp() {
  return IS_IOS ? (/* @__PURE__ */ new Date()).getTime() : performance.now();
}

// assets/scripts/dino/collision-box.ts
var CollisionBox = class {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
};

// assets/scripts/dino/trex.ts
var Trex = class _Trex {
  /** T-rex player config. */
  static config = {
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
    WIDTH_DUCK: 59
  };
  /** Used in collision detection. */
  static collisionBoxes = {
    DUCKING: [new CollisionBox(1, 18, 55, 25)],
    RUNNING: [
      new CollisionBox(22, 0, 17, 16),
      new CollisionBox(1, 18, 30, 9),
      new CollisionBox(10, 35, 14, 8),
      new CollisionBox(1, 24, 29, 5),
      new CollisionBox(5, 30, 21, 4),
      new CollisionBox(9, 34, 15, 4)
    ]
  };
  static status = {
    CRASHED: "CRASHED",
    DUCKING: "DUCKING",
    JUMPING: "JUMPING",
    RUNNING: "RUNNING",
    WAITING: "WAITING"
  };
  /** Blinking coefficient. */
  static BLINK_TIMING = 7e3;
  /** Animation config for different states. */
  static animFrames = {
    WAITING: {
      frames: [44, 0],
      msPerFrame: 1e3 / 3
    },
    RUNNING: {
      frames: [88, 132],
      msPerFrame: 1e3 / 12
    },
    CRASHED: {
      frames: [220],
      msPerFrame: 1e3 / 60
    },
    JUMPING: {
      frames: [0],
      msPerFrame: 1e3 / 60
    },
    DUCKING: {
      frames: [264, 323],
      msPerFrame: 1e3 / 8
    }
  };
  canvas;
  canvasCtx;
  spritePos;
  xPos = 0;
  yPos = 0;
  // Position when on the ground.
  groundYPos = 0;
  currentFrame = 0;
  currentAnimFrames = [];
  blinkDelay = 0;
  blinkCount = 0;
  animStartTime = 0;
  timer = 0;
  msPerFrame = 1e3 / FPS;
  config;
  // Current status.
  status = _Trex.status.WAITING;
  jumping = false;
  ducking = false;
  jumpVelocity = 0;
  reachedMinHeight = false;
  speedDrop = false;
  jumpCount = 0;
  minJumpHeight = 0;
  playingIntro;
  constructor(canvas, spritePos) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.spritePos = spritePos;
    this.config = _Trex.config;
    this.init();
  }
  /**
   * T-rex player initaliser.
   * Sets the t-rex to blink at random intervals.
   */
  init() {
    this.groundYPos = Runner.defaultDimensions.HEIGHT - this.config.HEIGHT - Runner.config.BOTTOM_PAD;
    this.yPos = this.groundYPos;
    this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;
    this.draw(0, 0);
    this.update(0, _Trex.status.WAITING);
  }
  /**
   * Setter for the jump velocity.
   * The approriate drop velocity is also set.
   */
  setJumpVelocity(setting) {
    this.config.INIITAL_JUMP_VELOCITY = -setting;
    this.config.DROP_VELOCITY = -setting / 2;
  }
  /** Set the animation status. */
  update(deltaTime, opt_status) {
    this.timer += deltaTime;
    if (opt_status) {
      this.status = opt_status;
      this.currentFrame = 0;
      this.msPerFrame = _Trex.animFrames[opt_status].msPerFrame;
      this.currentAnimFrames = _Trex.animFrames[opt_status].frames;
      if (opt_status == _Trex.status.WAITING) {
        this.animStartTime = getTimeStamp();
        this.setBlinkDelay();
      }
    }
    if (this.playingIntro && this.xPos < this.config.START_X_POS) {
      this.xPos += Math.round(
        this.config.START_X_POS / this.config.INTRO_DURATION * deltaTime
      );
    }
    if (this.status == _Trex.status.WAITING) {
      this.blink(getTimeStamp());
    } else {
      this.draw(this.currentAnimFrames[this.currentFrame], 0);
    }
    if (this.timer >= this.msPerFrame) {
      this.currentFrame = this.currentFrame == this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
      this.timer = 0;
    }
    if (this.speedDrop && this.yPos == this.groundYPos) {
      this.speedDrop = false;
      this.setDuck(true);
    }
  }
  /** Draw the t-rex to a particular position. */
  draw(x, y) {
    let sourceX = x;
    let sourceY = y;
    let sourceWidth = this.ducking && this.status != _Trex.status.CRASHED ? this.config.WIDTH_DUCK : this.config.WIDTH;
    let sourceHeight = this.config.HEIGHT;
    if (IS_HIDPI) {
      sourceX *= 2;
      sourceY *= 2;
      sourceWidth *= 2;
      sourceHeight *= 2;
    }
    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;
    if (this.ducking && this.status != _Trex.status.CRASHED) {
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH_DUCK,
        this.config.HEIGHT
      );
    } else {
      if (this.ducking && this.status == _Trex.status.CRASHED) {
        this.xPos++;
      }
      this.canvasCtx.drawImage(
        Runner.imageSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        this.xPos,
        this.yPos,
        this.config.WIDTH,
        this.config.HEIGHT
      );
    }
  }
  /** Sets a random time for the blink to happen. */
  setBlinkDelay() {
    this.blinkDelay = Math.ceil(Math.random() * _Trex.BLINK_TIMING);
  }
  /** Make t-rex blink at random intervals. */
  blink(time) {
    const deltaTime = time - this.animStartTime;
    if (deltaTime >= this.blinkDelay) {
      this.draw(this.currentAnimFrames[this.currentFrame], 0);
      if (this.currentFrame == 1) {
        this.setBlinkDelay();
        this.animStartTime = time;
        this.blinkCount++;
      }
    }
  }
  /** Initialise a jump. */
  startJump(speed) {
    if (!this.jumping) {
      this.update(0, _Trex.status.JUMPING);
      this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - speed / 10;
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;
    }
  }
  /** Jump is complete, falling down. */
  endJump() {
    if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
      this.jumpVelocity = this.config.DROP_VELOCITY;
    }
  }
  /** Update frame for a jump. */
  updateJump(deltaTime, speed) {
    const msPerFrame = _Trex.animFrames[this.status].msPerFrame;
    const framesElapsed = deltaTime / msPerFrame;
    if (this.speedDrop) {
      this.yPos += Math.round(
        this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed
      );
    } else {
      this.yPos += Math.round(this.jumpVelocity * framesElapsed);
    }
    this.jumpVelocity += this.config.GRAVITY * framesElapsed;
    if (this.yPos < this.minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true;
    }
    if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump();
    }
    if (this.yPos > this.groundYPos) {
      this.reset();
      this.jumpCount++;
    }
    this.update(deltaTime);
  }
  /** Set the speed drop. Immediately cancels the current jump. */
  setSpeedDrop() {
    this.speedDrop = true;
    this.jumpVelocity = 1;
  }
  setDuck(isDucking) {
    if (isDucking && this.status != _Trex.status.DUCKING) {
      this.update(0, _Trex.status.DUCKING);
      this.ducking = true;
    } else if (this.status == _Trex.status.DUCKING) {
      this.update(0, _Trex.status.RUNNING);
      this.ducking = false;
    }
  }
  /** Reset the t-rex to running at start of game. */
  reset() {
    this.yPos = this.groundYPos;
    this.jumpVelocity = 0;
    this.jumping = false;
    this.ducking = false;
    this.update(0, _Trex.status.RUNNING);
    this.speedDrop = false;
    this.jumpCount = 0;
  }
};

// assets/scripts/dino/collision.ts
function checkForCollision(obstacle, tRex, opt_canvasCtx) {
  const tRexBox = new CollisionBox(
    tRex.xPos + 1,
    tRex.yPos + 1,
    tRex.config.WIDTH - 2,
    tRex.config.HEIGHT - 2
  );
  const obstacleBox = new CollisionBox(
    obstacle.xPos + 1,
    obstacle.yPos + 1,
    obstacle.typeConfig.width * obstacle.size - 2,
    obstacle.typeConfig.height - 2
  );
  if (opt_canvasCtx) {
    drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
  }
  if (boxCompare(tRexBox, obstacleBox)) {
    const collisionBoxes = obstacle.collisionBoxes;
    const tRexCollisionBoxes = tRex.ducking ? Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
    for (let t = 0; t < tRexCollisionBoxes.length; t++) {
      for (let i = 0; i < collisionBoxes.length; i++) {
        const adjTrexBox = createAdjustedCollisionBox(
          tRexCollisionBoxes[t],
          tRexBox
        );
        const adjObstacleBox = createAdjustedCollisionBox(
          collisionBoxes[i],
          obstacleBox
        );
        const crashed = boxCompare(adjTrexBox, adjObstacleBox);
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
function createAdjustedCollisionBox(box, adjustment) {
  return new CollisionBox(
    box.x + adjustment.x,
    box.y + adjustment.y,
    box.width,
    box.height
  );
}
function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
  canvasCtx.save();
  canvasCtx.strokeStyle = "#f00";
  canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);
  canvasCtx.strokeStyle = "#0f0";
  canvasCtx.strokeRect(
    obstacleBox.x,
    obstacleBox.y,
    obstacleBox.width,
    obstacleBox.height
  );
  canvasCtx.restore();
}
function boxCompare(tRexBox, obstacleBox) {
  let crashed = false;
  if (tRexBox.x < obstacleBox.x + obstacleBox.width && tRexBox.x + tRexBox.width > obstacleBox.x && tRexBox.y < obstacleBox.y + obstacleBox.height && tRexBox.height + tRexBox.y > obstacleBox.y) {
    crashed = true;
  }
  return crashed;
}

// assets/scripts/dino/game-over-panel.ts
var GameOverPanel = class _GameOverPanel {
  /** Dimensions used in the panel. */
  static dimensions = {
    TEXT_X: 0,
    TEXT_Y: 13,
    TEXT_WIDTH: 191,
    TEXT_HEIGHT: 11,
    RESTART_WIDTH: 36,
    RESTART_HEIGHT: 32
  };
  canvas;
  canvasCtx;
  canvasDimensions;
  textImgPos;
  restartImgPos;
  constructor(canvas, textImgPos, restartImgPos, dimensions) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.canvasDimensions = dimensions;
    this.textImgPos = textImgPos;
    this.restartImgPos = restartImgPos;
    this.draw();
  }
  /** Update the panel dimensions. */
  updateDimensions(width, opt_height) {
    this.canvasDimensions.WIDTH = width;
    if (opt_height) {
      this.canvasDimensions.HEIGHT = opt_height;
    }
  }
  /** Draw the panel. */
  draw() {
    const dimensions = _GameOverPanel.dimensions;
    const centerX = this.canvasDimensions.WIDTH / 2;
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
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      textSourceX,
      textSourceY,
      textSourceWidth,
      textSourceHeight,
      textTargetX,
      textTargetY,
      textTargetWidth,
      textTargetHeight
    );
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.restartImgPos.x,
      this.restartImgPos.y,
      restartSourceWidth,
      restartSourceHeight,
      restartTargetX,
      restartTargetY,
      dimensions.RESTART_WIDTH,
      dimensions.RESTART_HEIGHT
    );
  }
};

// assets/scripts/dino/distance-meter.ts
var DistanceMeter = class _DistanceMeter {
  /** @enum {number} */
  static dimensions = {
    WIDTH: 10,
    HEIGHT: 13,
    DEST_WIDTH: 11
  };
  /**
   * Y positioning of the digits in the sprite sheet.
   * X position is always 0.
   */
  static yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];
  /** Distance meter config. */
  static config = {
    // Number of digits.
    MAX_DISTANCE_UNITS: 5,
    // Distance that causes achievement animation.
    ACHIEVEMENT_DISTANCE: 100,
    // Used for conversion from pixel distance to a scaled unit.
    COEFFICIENT: 0.025,
    // Flash duration in milliseconds.
    FLASH_DURATION: 1e3 / 4,
    // Flash iterations for achievement animation.
    FLASH_ITERATIONS: 3
  };
  canvas;
  canvasCtx;
  image;
  spritePos;
  x = 0;
  y = 5;
  maxScore = 0;
  highScore = [];
  digits = [];
  acheivement = false;
  defaultString = "";
  flashTimer = 0;
  flashIterations = 0;
  config = _DistanceMeter.config;
  maxScoreUnits;
  constructor(canvas, spritePos, canvasWidth) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.image = Runner.imageSprite;
    this.spritePos = spritePos;
    this.maxScoreUnits = this.config.MAX_DISTANCE_UNITS;
    this.init(canvasWidth);
  }
  /** Initialise the distance meter to '00000'. */
  init(width) {
    let maxDistanceStr = "";
    this.calcXPos(width);
    this.maxScore = this.maxScoreUnits;
    for (let i = 0; i < this.maxScoreUnits; i++) {
      this.draw(i, 0);
      this.defaultString += "0";
      maxDistanceStr += "9";
    }
    this.maxScore = parseInt(maxDistanceStr);
  }
  /** Calculate the xPos in the canvas. */
  calcXPos(canvasWidth) {
    this.x = canvasWidth - _DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1);
  }
  /** Draw a digit to canvas. */
  draw(digitPos, value, opt_highScore) {
    let sourceWidth = _DistanceMeter.dimensions.WIDTH;
    let sourceHeight = _DistanceMeter.dimensions.HEIGHT;
    let sourceX = _DistanceMeter.dimensions.WIDTH * value;
    let sourceY = 0;
    const targetX = digitPos * _DistanceMeter.dimensions.DEST_WIDTH;
    const targetY = this.y;
    const targetWidth = _DistanceMeter.dimensions.WIDTH;
    const targetHeight = _DistanceMeter.dimensions.HEIGHT;
    if (IS_HIDPI) {
      sourceWidth *= 2;
      sourceHeight *= 2;
      sourceX *= 2;
    }
    sourceX += this.spritePos.x;
    sourceY += this.spritePos.y;
    this.canvasCtx.save();
    if (opt_highScore) {
      const highScoreX = this.x - this.maxScoreUnits * 2 * _DistanceMeter.dimensions.WIDTH;
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
      targetHeight
    );
    this.canvasCtx.restore();
  }
  /** Covert pixel distance to a 'real' distance. */
  getActualDistance(distance) {
    return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
  }
  /** Update the distance meter. */
  update(deltaTime, distance) {
    let paint = true;
    let playSound = false;
    if (!this.acheivement) {
      distance = this.getActualDistance(distance);
      if (distance > this.maxScore && this.maxScoreUnits == this.config.MAX_DISTANCE_UNITS) {
        this.maxScoreUnits++;
        this.maxScore = parseInt(this.maxScore + "9");
      }
      if (distance > 0) {
        if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
          this.acheivement = true;
          this.flashTimer = 0;
          playSound = true;
        }
        const distanceStr = (this.defaultString + distance).substr(
          -this.maxScoreUnits
        );
        this.digits = distanceStr.split("");
      } else {
        this.digits = this.defaultString.split("");
      }
    } else {
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
    if (paint) {
      for (let i = this.digits.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.digits[i]));
      }
    }
    this.drawHighScore();
    return playSound;
  }
  /** Draw the high score. */
  drawHighScore() {
    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = 0.8;
    for (let i = this.highScore.length - 1; i >= 0; i--) {
      this.draw(i, parseInt(this.highScore[i], 10), true);
    }
    this.canvasCtx.restore();
  }
  /**
   * Set the highscore as a array string.
   * Position of char in the sprite: H - 10, I - 11.
   */
  setHighScore(distance) {
    distance = this.getActualDistance(distance);
    const highScoreStr = (this.defaultString + distance).substr(
      -this.maxScoreUnits
    );
    this.highScore = ["10", "11", ""].concat(highScoreStr.split(""));
  }
  /** Reset the distance meter back to '00000'. */
  reset() {
    this.update(0);
    this.acheivement = false;
  }
};

// assets/scripts/dino/cloud.ts
var Cloud = class _Cloud {
  /** Cloud object config. */
  static config = {
    HEIGHT: 14,
    MAX_CLOUD_GAP: 400,
    MAX_SKY_LEVEL: 30,
    MIN_CLOUD_GAP: 100,
    MIN_SKY_LEVEL: 71,
    WIDTH: 46
  };
  canvas;
  canvasCtx;
  spritePos;
  containerWidth;
  xPos;
  yPos = 0;
  remove = false;
  cloudGap;
  constructor(canvas, spritePos, containerWidth) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.spritePos = spritePos;
    this.containerWidth = containerWidth;
    this.xPos = containerWidth;
    this.cloudGap = getRandomNum(
      _Cloud.config.MIN_CLOUD_GAP,
      _Cloud.config.MAX_CLOUD_GAP
    );
    this.init();
  }
  /** Initialise the cloud. Sets the Cloud height. */
  init() {
    this.yPos = getRandomNum(
      _Cloud.config.MAX_SKY_LEVEL,
      _Cloud.config.MIN_SKY_LEVEL
    );
    this.draw();
  }
  /** Draw the cloud. */
  draw() {
    this.canvasCtx.save();
    let sourceWidth = _Cloud.config.WIDTH;
    let sourceHeight = _Cloud.config.HEIGHT;
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
      _Cloud.config.WIDTH,
      _Cloud.config.HEIGHT
    );
    this.canvasCtx.restore();
  }
  /** Update the cloud position. */
  update(speed) {
    if (!this.remove) {
      this.xPos -= Math.ceil(speed);
      this.draw();
      if (!this.isVisible()) {
        this.remove = true;
      }
    }
  }
  /** Check if the cloud is visible on the stage. */
  isVisible() {
    return this.xPos + _Cloud.config.WIDTH > 0;
  }
};

// assets/scripts/dino/night-mode.ts
var NightMode = class _NightMode {
  static config = {
    FADE_SPEED: 0.035,
    HEIGHT: 40,
    MOON_SPEED: 0.25,
    NUM_STARS: 2,
    STAR_SIZE: 9,
    STAR_SPEED: 0.3,
    STAR_MAX_Y: 70,
    WIDTH: 20
  };
  static phases = [140, 120, 100, 60, 40, 20, 0];
  spritePos;
  canvas;
  canvasCtx;
  xPos;
  yPos = 30;
  currentPhase = 0;
  opacity = 0;
  containerWidth;
  stars = [];
  drawStars = false;
  constructor(canvas, spritePos, containerWidth) {
    this.spritePos = spritePos;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.xPos = containerWidth - 50;
    this.containerWidth = containerWidth;
    this.placeStars();
  }
  /** Update moving moon, changing phases. */
  update(activated, delta) {
    if (activated && this.opacity == 0) {
      this.currentPhase++;
      if (this.currentPhase >= _NightMode.phases.length) {
        this.currentPhase = 0;
      }
    }
    if (activated && (this.opacity < 1 || this.opacity == 0)) {
      this.opacity += _NightMode.config.FADE_SPEED;
    } else if (this.opacity > 0) {
      this.opacity -= _NightMode.config.FADE_SPEED;
    }
    if (this.opacity > 0) {
      this.xPos = this.updateXPos(this.xPos, _NightMode.config.MOON_SPEED);
      if (this.drawStars) {
        for (let i = 0; i < _NightMode.config.NUM_STARS; i++) {
          this.stars[i].x = this.updateXPos(
            this.stars[i].x,
            _NightMode.config.STAR_SPEED
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
  updateXPos(currentPos, speed) {
    if (currentPos < -_NightMode.config.WIDTH) {
      currentPos = this.containerWidth;
    } else {
      currentPos -= speed;
    }
    return currentPos;
  }
  draw() {
    let moonSourceWidth = this.currentPhase == 3 ? _NightMode.config.WIDTH * 2 : _NightMode.config.WIDTH;
    let moonSourceHeight = _NightMode.config.HEIGHT;
    let moonSourceX = this.spritePos.x + _NightMode.phases[this.currentPhase];
    const moonOutputWidth = moonSourceWidth;
    let starSize = _NightMode.config.STAR_SIZE;
    let starSourceX = Runner.spriteDefinition.LDPI.STAR.x;
    if (IS_HIDPI) {
      moonSourceWidth *= 2;
      moonSourceHeight *= 2;
      moonSourceX = this.spritePos.x + _NightMode.phases[this.currentPhase] * 2;
      starSize *= 2;
      starSourceX = Runner.spriteDefinition.HDPI.STAR.x;
    }
    this.canvasCtx.save();
    this.canvasCtx.globalAlpha = this.opacity;
    if (this.drawStars) {
      for (let i = 0; i < _NightMode.config.NUM_STARS; i++) {
        this.canvasCtx.drawImage(
          Runner.imageSprite,
          starSourceX,
          this.stars[i].sourceY,
          starSize,
          starSize,
          Math.round(this.stars[i].x),
          this.stars[i].y,
          _NightMode.config.STAR_SIZE,
          _NightMode.config.STAR_SIZE
        );
      }
    }
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      moonSourceX,
      this.spritePos.y,
      moonSourceWidth,
      moonSourceHeight,
      Math.round(this.xPos),
      this.yPos,
      moonOutputWidth,
      _NightMode.config.HEIGHT
    );
    this.canvasCtx.globalAlpha = 1;
    this.canvasCtx.restore();
  }
  /** Do star placement. */
  placeStars() {
    const segmentSize = Math.round(
      this.containerWidth / _NightMode.config.NUM_STARS
    );
    for (let i = 0; i < _NightMode.config.NUM_STARS; i++) {
      const sourceY = IS_HIDPI ? Runner.spriteDefinition.HDPI.STAR.y + _NightMode.config.STAR_SIZE * 2 * i : Runner.spriteDefinition.LDPI.STAR.y + _NightMode.config.STAR_SIZE * i;
      this.stars[i] = {
        x: getRandomNum(segmentSize * i, segmentSize * (i + 1)),
        y: getRandomNum(0, _NightMode.config.STAR_MAX_Y),
        sourceY
      };
    }
  }
  reset() {
    this.currentPhase = 0;
    this.opacity = 0;
    this.update(false);
  }
};

// assets/scripts/dino/obstacle.ts
var Obstacle = class _Obstacle {
  /** Coefficient for calculating the maximum gap. */
  static MAX_GAP_COEFFICIENT = 1.5;
  /** Maximum obstacle grouping count. */
  static MAX_OBSTACLE_LENGTH = 3;
  /**
   * Obstacle definitions.
   * minGap: minimum pixel space betweeen obstacles.
   * multipleSpeed: Speed at which multiples are allowed.
   * speedOffset: speed faster / slower than the horizon.
   * minSpeed: Minimum speed which the obstacle can make an appearance.
   */
  static types = [
    {
      type: "CACTUS_SMALL",
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 7, 5, 27),
        new CollisionBox(4, 0, 6, 34),
        new CollisionBox(10, 4, 7, 14)
      ]
    },
    {
      type: "CACTUS_LARGE",
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 12, 7, 38),
        new CollisionBox(8, 0, 7, 49),
        new CollisionBox(13, 10, 10, 38)
      ]
    },
    {
      type: "PTERODACTYL",
      width: 46,
      height: 40,
      yPos: [100, 75, 50],
      // Variable height.
      yPosMobile: [100, 50],
      // Variable height mobile.
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      collisionBoxes: [
        new CollisionBox(15, 15, 16, 5),
        new CollisionBox(18, 21, 24, 6),
        new CollisionBox(2, 14, 4, 3),
        new CollisionBox(6, 10, 4, 7),
        new CollisionBox(10, 8, 6, 9)
      ],
      numFrames: 2,
      frameRate: 1e3 / 6,
      speedOffset: 0.8
    }
  ];
  canvasCtx;
  spritePos;
  typeConfig;
  gapCoefficient;
  size;
  dimensions;
  remove = false;
  xPos;
  yPos = 0;
  width = 0;
  collisionBoxes = [];
  gap = 0;
  speedOffset = 0;
  // For animated obstacles.
  currentFrame = 0;
  timer = 0;
  followingObstacleCreated;
  constructor(canvasCtx, type, spriteImgPos, dimensions, gapCoefficient, speed, opt_xOffset) {
    this.canvasCtx = canvasCtx;
    this.spritePos = spriteImgPos;
    this.typeConfig = type;
    this.gapCoefficient = gapCoefficient;
    this.size = getRandomNum(1, _Obstacle.MAX_OBSTACLE_LENGTH);
    this.dimensions = dimensions;
    this.xPos = dimensions.WIDTH + (opt_xOffset || 0);
    this.init(speed);
  }
  /** Initialise the DOM for the obstacle. */
  init(speed) {
    this.cloneCollisionBoxes();
    if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      this.size = 1;
    }
    this.width = this.typeConfig.width * this.size;
    if (Array.isArray(this.typeConfig.yPos)) {
      const yPosConfig = IS_MOBILE ? this.typeConfig.yPosMobile : this.typeConfig.yPos;
      this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
    } else {
      this.yPos = this.typeConfig.yPos;
    }
    this.draw();
    if (this.size > 1) {
      this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width;
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
    }
    if (this.typeConfig.speedOffset) {
      this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset : -this.typeConfig.speedOffset;
    }
    this.gap = this.getGap(this.gapCoefficient, speed);
  }
  /** Draw and crop based on size. */
  draw() {
    let sourceWidth = this.typeConfig.width;
    let sourceHeight = this.typeConfig.height;
    if (IS_HIDPI) {
      sourceWidth = sourceWidth * 2;
      sourceHeight = sourceHeight * 2;
    }
    let sourceX = sourceWidth * this.size * (0.5 * (this.size - 1)) + this.spritePos.x;
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
      this.typeConfig.height
    );
  }
  /** Obstacle frame update. */
  update(deltaTime, speed) {
    if (!this.remove) {
      if (this.typeConfig.speedOffset) {
        speed += this.speedOffset;
      }
      this.xPos -= Math.floor(speed * FPS / 1e3 * deltaTime);
      if (this.typeConfig.numFrames) {
        this.timer += deltaTime;
        if (this.timer >= this.typeConfig.frameRate) {
          this.currentFrame = this.currentFrame == this.typeConfig.numFrames - 1 ? 0 : this.currentFrame + 1;
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
  getGap(gapCoefficient, speed) {
    const minGap = Math.round(
      this.width * speed + this.typeConfig.minGap * gapCoefficient
    );
    const maxGap = Math.round(minGap * _Obstacle.MAX_GAP_COEFFICIENT);
    return getRandomNum(minGap, maxGap);
  }
  /** Check if obstacle is visible. */
  isVisible() {
    return this.xPos + this.width > 0;
  }
  /**
   * Make a copy of the collision boxes, since these will change based on
   * obstacle type and size.
   */
  cloneCollisionBoxes() {
    const collisionBoxes = this.typeConfig.collisionBoxes;
    for (let i = collisionBoxes.length - 1; i >= 0; i--) {
      this.collisionBoxes[i] = new CollisionBox(
        collisionBoxes[i].x,
        collisionBoxes[i].y,
        collisionBoxes[i].width,
        collisionBoxes[i].height
      );
    }
  }
};

// assets/scripts/dino/horizon.ts
var HORIZON_DIMENSION_KEYS = ["WIDTH", "HEIGHT", "YPOS"];
var HorizonLine = class _HorizonLine {
  /** Horizon line dimensions. */
  static dimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    YPOS: 127
  };
  spritePos;
  canvas;
  canvasCtx;
  sourceDimensions = { WIDTH: 0, HEIGHT: 0, YPOS: 0 };
  dimensions;
  sourceXPos;
  xPos = [];
  yPos = 0;
  bumpThreshold = 0.5;
  constructor(canvas, spritePos) {
    this.spritePos = spritePos;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.dimensions = _HorizonLine.dimensions;
    this.sourceXPos = [
      this.spritePos.x,
      this.spritePos.x + this.dimensions.WIDTH
    ];
    this.setSourceDimensions();
    this.draw();
  }
  /** Set the source dimensions of the horizon line. */
  setSourceDimensions() {
    for (const dimension of HORIZON_DIMENSION_KEYS) {
      if (IS_HIDPI) {
        if (dimension != "YPOS") {
          this.sourceDimensions[dimension] = _HorizonLine.dimensions[dimension] * 2;
        }
      } else {
        this.sourceDimensions[dimension] = _HorizonLine.dimensions[dimension];
      }
      this.dimensions[dimension] = _HorizonLine.dimensions[dimension];
    }
    this.xPos = [0, _HorizonLine.dimensions.WIDTH];
    this.yPos = _HorizonLine.dimensions.YPOS;
  }
  /** Return the crop x position of a type. */
  getRandomType() {
    return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
  }
  /** Draw the horizon line. */
  draw() {
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[0],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[0],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
    this.canvasCtx.drawImage(
      Runner.imageSprite,
      this.sourceXPos[1],
      this.spritePos.y,
      this.sourceDimensions.WIDTH,
      this.sourceDimensions.HEIGHT,
      this.xPos[1],
      this.yPos,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
  }
  /** Update the x position of an indivdual piece of the line. */
  updateXPos(pos, increment) {
    const line1 = pos;
    const line2 = pos == 0 ? 1 : 0;
    this.xPos[line1] = this.xPos[line1] - increment;
    this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
    if (this.xPos[line1] <= -this.dimensions.WIDTH) {
      this.xPos[line1] = this.xPos[line1] + this.dimensions.WIDTH * 2;
      this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
      this.sourceXPos[line1] = this.getRandomType() + this.spritePos.x;
    }
  }
  /** Update the horizon line. */
  update(deltaTime, speed) {
    const increment = Math.floor(speed * (FPS / 1e3) * deltaTime);
    if (this.xPos[0] <= 0) {
      this.updateXPos(0, increment);
    } else {
      this.updateXPos(1, increment);
    }
    this.draw();
  }
  /** Reset horizon to the starting position. */
  reset() {
    this.xPos[0] = 0;
    this.xPos[1] = _HorizonLine.dimensions.WIDTH;
  }
};
var Horizon = class _Horizon {
  /** Horizon config. */
  static config = {
    BG_CLOUD_SPEED: 0.2,
    BUMPY_THRESHOLD: 0.3,
    CLOUD_FREQUENCY: 0.5,
    HORIZON_HEIGHT: 16,
    MAX_CLOUDS: 6
  };
  canvas;
  canvasCtx;
  config = _Horizon.config;
  dimensions;
  gapCoefficient;
  obstacles = [];
  obstacleHistory = [];
  horizonOffsets = [0, 0];
  cloudFrequency;
  spritePos;
  nightMode;
  // Cloud
  clouds = [];
  cloudSpeed;
  // Horizon
  horizonLine;
  runningTime = 0;
  constructor(canvas, spritePos, dimensions, gapCoefficient) {
    this.canvas = canvas;
    this.canvasCtx = this.canvas.getContext("2d");
    this.dimensions = dimensions;
    this.gapCoefficient = gapCoefficient;
    this.cloudFrequency = this.config.CLOUD_FREQUENCY;
    this.spritePos = spritePos;
    this.cloudSpeed = this.config.BG_CLOUD_SPEED;
    this.init();
  }
  /** Initialise the horizon. Just add the line and a cloud. No obstacles. */
  init() {
    this.addCloud();
    this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);
    this.nightMode = new NightMode(
      this.canvas,
      this.spritePos.MOON,
      this.dimensions.WIDTH
    );
  }
  /**
   * @param updateObstacles Used as an override to prevent
   *     the obstacles from being updated / added. This happens in the
   *     ease in section.
   * @param showNightMode Night mode activated.
   */
  update(deltaTime, currentSpeed, updateObstacles, showNightMode) {
    this.runningTime += deltaTime;
    this.horizonLine.update(deltaTime, currentSpeed);
    this.nightMode.update(showNightMode ?? false);
    this.updateClouds(deltaTime, currentSpeed);
    if (updateObstacles) {
      this.updateObstacles(deltaTime, currentSpeed);
    }
  }
  /** Update the cloud positions. */
  updateClouds(deltaTime, speed) {
    const cloudSpeed = this.cloudSpeed / 1e3 * deltaTime * speed;
    const numClouds = this.clouds.length;
    if (numClouds) {
      for (let i = numClouds - 1; i >= 0; i--) {
        this.clouds[i].update(cloudSpeed);
      }
      const lastCloud = this.clouds[numClouds - 1];
      if (numClouds < this.config.MAX_CLOUDS && this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap && this.cloudFrequency > Math.random()) {
        this.addCloud();
      }
      this.clouds = this.clouds.filter((obj) => !obj.remove);
    } else {
      this.addCloud();
    }
  }
  /** Update the obstacle positions. */
  updateObstacles(deltaTime, currentSpeed) {
    const updatedObstacles = this.obstacles.slice(0);
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime, currentSpeed);
      if (obstacle.remove) {
        updatedObstacles.shift();
      }
    }
    this.obstacles = updatedObstacles;
    if (this.obstacles.length > 0) {
      const lastObstacle = this.obstacles[this.obstacles.length - 1];
      if (lastObstacle && !lastObstacle.followingObstacleCreated && lastObstacle.isVisible() && lastObstacle.xPos + lastObstacle.width + lastObstacle.gap < this.dimensions.WIDTH) {
        this.addNewObstacle(currentSpeed);
        lastObstacle.followingObstacleCreated = true;
      }
    } else {
      this.addNewObstacle(currentSpeed);
    }
  }
  removeFirstObstacle() {
    this.obstacles.shift();
  }
  /** Add a new obstacle. */
  addNewObstacle(currentSpeed) {
    const obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
    const obstacleType = Obstacle.types[obstacleTypeIndex];
    if (this.duplicateObstacleCheck(obstacleType.type) || currentSpeed < obstacleType.minSpeed) {
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
          obstacleType.width
        )
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
  duplicateObstacleCheck(nextObstacleType) {
    let duplicateCount = 0;
    for (let i = 0; i < this.obstacleHistory.length; i++) {
      duplicateCount = this.obstacleHistory[i] == nextObstacleType ? duplicateCount + 1 : 0;
    }
    return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION;
  }
  /**
   * Reset the horizon layer.
   * Remove existing obstacles and reposition the horizon line.
   */
  reset() {
    this.obstacles = [];
    this.horizonLine.reset();
    this.nightMode.reset();
  }
  /** Update the canvas width and scaling. */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  /** Add a new cloud to the horizon. */
  addCloud() {
    this.clouds.push(
      new Cloud(this.canvas, this.spritePos.CLOUD, this.dimensions.WIDTH)
    );
  }
};

// assets/scripts/dino/runner.ts
var Runner = class _Runner {
  /** Singleton instance. */
  static instance_ = null;
  /** Default game configuration. */
  static config = {
    ACCELERATION: 1e-3,
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 10,
    CLEAR_TIME: 3e3,
    CLOUD_FREQUENCY: 0.5,
    GAMEOVER_CLEAR_TIME: 750,
    GAP_COEFFICIENT: 0.6,
    GRAVITY: 0.6,
    INITIAL_JUMP_VELOCITY: 12,
    INVERT_FADE_DURATION: 12e3,
    INVERT_DISTANCE: 700,
    MAX_BLINK_COUNT: 3,
    MAX_CLOUDS: 6,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_OBSTACLE_DUPLICATION: 2,
    MAX_SPEED: 13,
    MIN_JUMP_HEIGHT: 35,
    MOBILE_SPEED_COEFFICIENT: 1.2,
    RESOURCE_TEMPLATE_ID: "audio-resources",
    SPEED: 6,
    SPEED_DROP_COEFFICIENT: 3
  };
  /** Default dimensions. */
  static defaultDimensions = {
    WIDTH: DEFAULT_WIDTH,
    HEIGHT: 150
  };
  /** CSS class names. */
  static classes = {
    CANVAS: "runner-canvas",
    CONTAINER: "runner-container",
    CRASHED: "crashed",
    ICON: "icon-offline",
    INVERTED: "inverted",
    SNACKBAR: "snackbar",
    SNACKBAR_SHOW: "snackbar-show",
    TOUCH_CONTROLLER: "controller"
  };
  /** Sprite definition layout of the spritesheet. */
  static spriteDefinition = {
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
      STAR: { x: 645, y: 2 }
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
      STAR: { x: 1276, y: 2 }
    }
  };
  /** Sound FX. Reference to the ID of the audio tag on interstitial page. */
  static sounds = {
    BUTTON_PRESS: "offline-sound-press",
    HIT: "offline-sound-hit",
    SCORE: "offline-sound-reached"
  };
  /** Key code mapping. */
  static keycodes = {
    JUMP: { "38": 1, "32": 1 },
    // Up, spacebar
    DUCK: { "40": 1 },
    // Down
    RESTART: { "13": 1 }
    // Enter
  };
  /** Runner event names. */
  static events = {
    ANIM_END: "webkitAnimationEnd",
    CLICK: "click",
    KEYDOWN: "keydown",
    KEYUP: "keyup",
    MOUSEDOWN: "mousedown",
    MOUSEUP: "mouseup",
    RESIZE: "resize",
    TOUCHEND: "touchend",
    TOUCHSTART: "touchstart",
    VISIBILITY: "visibilitychange",
    BLUR: "blur",
    FOCUS: "focus",
    LOAD: "load"
  };
  outerContainerEl;
  containerEl;
  detailsButton = null;
  config;
  dimensions;
  canvas = null;
  canvasCtx;
  tRex;
  distanceMeter;
  distanceRan = 0;
  highestScore = 0;
  time = 0;
  runningTime = 0;
  msPerFrame = 1e3 / FPS;
  currentSpeed;
  activated = false;
  // Whether the easter egg has been activated.
  playing = false;
  // Whether the game is currently in play state.
  crashed = false;
  paused = false;
  inverted = false;
  invertTrigger = false;
  invertTimer = 0;
  resizeTimerId_ = null;
  playCount = 0;
  // Sound FX.
  soundFx = {};
  // Global web audio context for playing sounds.
  audioContext = null;
  spriteDef;
  gameOverPanel = null;
  horizon;
  touchController;
  playingIntro = false;
  updatePending = false;
  raqId = 0;
  constructor(outerContainerId, opt_config) {
    if (_Runner.instance_) {
      return _Runner.instance_;
    }
    _Runner.instance_ = this;
    this.outerContainerEl = document.querySelector(
      outerContainerId
    );
    this.detailsButton = this.outerContainerEl.querySelector("#details-button");
    this.config = opt_config || _Runner.config;
    this.dimensions = _Runner.defaultDimensions;
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
  isDisabled() {
    return false;
  }
  /** For disabled instances, set up a snackbar with the disabled message. */
  setupDisabledRunner() {
    this.containerEl = document.createElement("div");
    this.containerEl.className = _Runner.classes.SNACKBAR;
    this.containerEl.textContent = loadTimeData.getValue("disabledEasterEgg");
    this.outerContainerEl.appendChild(this.containerEl);
    document.addEventListener(_Runner.events.KEYDOWN, (e) => {
      const keyEvent = e;
      if (_Runner.keycodes.JUMP[String(keyEvent.keyCode)]) {
        this.containerEl.classList.add(_Runner.classes.SNACKBAR_SHOW);
        document.querySelector(".icon").classList.add("icon-disabled");
      }
    });
  }
  /** Setting individual settings for debugging. */
  updateConfigSetting(setting, value) {
    if (setting in this.config && value != void 0) {
      this.config[setting] = value;
      switch (setting) {
        case "GRAVITY":
        case "MIN_JUMP_HEIGHT":
        case "SPEED_DROP_COEFFICIENT":
          this.tRex.config[setting] = value;
          break;
        case "INITIAL_JUMP_VELOCITY":
          this.tRex.setJumpVelocity(value);
          break;
        case "SPEED":
          this.setSpeed(value);
          break;
      }
    }
  }
  /**
   * Cache the appropriate image sprite from the page and get the sprite sheet
   * definition.
   */
  loadImages() {
    if (IS_HIDPI) {
      _Runner.imageSprite = document.getElementById(
        "offline-resources-2x"
      );
      this.spriteDef = _Runner.spriteDefinition.HDPI;
    } else {
      _Runner.imageSprite = document.getElementById(
        "offline-resources-1x"
      );
      this.spriteDef = _Runner.spriteDefinition.LDPI;
    }
    if (_Runner.imageSprite.complete) {
      this.init();
    } else {
      _Runner.imageSprite.addEventListener(
        _Runner.events.LOAD,
        this.init.bind(this)
      );
    }
  }
  /** Load and decode base 64 encoded sounds. */
  loadSounds() {
    if (!IS_IOS) {
      const audioContext = new AudioContext();
      this.audioContext = audioContext;
      const resourceTemplate = document.getElementById(
        this.config.RESOURCE_TEMPLATE_ID
      ).content;
      for (const sound in _Runner.sounds) {
        const key = sound;
        const soundEl = resourceTemplate.getElementById(
          _Runner.sounds[key]
        );
        let soundSrc = soundEl.src;
        soundSrc = soundSrc.substr(soundSrc.indexOf(",") + 1);
        const buffer = decodeBase64ToArrayBuffer(soundSrc);
        audioContext.decodeAudioData(buffer, (audioData) => {
          this.soundFx[key] = audioData;
        });
      }
    }
  }
  /**
   * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
   */
  setSpeed(opt_speed) {
    const speed = opt_speed || this.currentSpeed;
    if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
      const mobileSpeed = speed * this.dimensions.WIDTH / DEFAULT_WIDTH * this.config.MOBILE_SPEED_COEFFICIENT;
      this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
    } else if (opt_speed) {
      this.currentSpeed = opt_speed;
    }
  }
  /** Game initialiser. */
  init() {
    document.querySelector("." + _Runner.classes.ICON).style.visibility = "hidden";
    this.adjustDimensions();
    this.setSpeed();
    this.containerEl = document.createElement("div");
    this.containerEl.className = _Runner.classes.CONTAINER;
    this.canvas = createCanvas(
      this.containerEl,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT,
      void 0
    );
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.fillStyle = "#f7f7f7";
    this.canvasCtx.fill();
    _Runner.updateCanvasScaling(this.canvas);
    this.horizon = new Horizon(
      this.canvas,
      this.spriteDef,
      this.dimensions,
      this.config.GAP_COEFFICIENT
    );
    this.distanceMeter = new DistanceMeter(
      this.canvas,
      this.spriteDef.TEXT_SPRITE,
      this.dimensions.WIDTH
    );
    this.tRex = new Trex(this.canvas, this.spriteDef.TREX);
    this.outerContainerEl.appendChild(this.containerEl);
    if (IS_MOBILE) {
      this.createTouchController();
    }
    this.startListening();
    this.update();
    window.addEventListener(
      _Runner.events.RESIZE,
      this.debounceResize.bind(this)
    );
  }
  /** Create the touch controller. A div that covers whole screen. */
  createTouchController() {
    this.touchController = document.createElement("div");
    this.touchController.className = _Runner.classes.TOUCH_CONTROLLER;
    this.outerContainerEl.appendChild(this.touchController);
  }
  /** Debounce the resize event. */
  debounceResize() {
    if (!this.resizeTimerId_) {
      this.resizeTimerId_ = window.setInterval(
        this.adjustDimensions.bind(this),
        250
      );
    }
  }
  /** Adjust game space dimensions on resize. */
  adjustDimensions() {
    window.clearInterval(this.resizeTimerId_ ?? void 0);
    this.resizeTimerId_ = null;
    const boxStyles = window.getComputedStyle(this.outerContainerEl);
    const padding = Number(
      boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2)
    );
    this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;
    if (this.canvas) {
      this.canvas.width = this.dimensions.WIDTH;
      this.canvas.height = this.dimensions.HEIGHT;
      _Runner.updateCanvasScaling(this.canvas);
      this.distanceMeter.calcXPos(this.dimensions.WIDTH);
      this.clearCanvas();
      this.horizon.update(0, 0, true);
      this.tRex.update(0);
      if (this.playing || this.crashed || this.paused) {
        this.containerEl.style.width = this.dimensions.WIDTH + "px";
        this.containerEl.style.height = this.dimensions.HEIGHT + "px";
        this.distanceMeter.update(0, Math.ceil(this.distanceRan));
        this.stop();
      } else {
        this.tRex.draw(0, 0);
      }
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
  playIntro() {
    if (!this.activated && !this.crashed) {
      this.playingIntro = true;
      this.tRex.playingIntro = true;
      const keyframes = "@-webkit-keyframes intro { from { width:" + Trex.config.WIDTH + "px }to { width: " + this.dimensions.WIDTH + "px }}";
      const sheet = document.createElement("style");
      sheet.innerHTML = keyframes;
      document.head.appendChild(sheet);
      this.containerEl.addEventListener(
        _Runner.events.ANIM_END,
        this.startGame.bind(this)
      );
      const style = this.containerEl.style;
      style.webkitAnimation = "intro .4s ease-out 1 both";
      this.containerEl.style.width = this.dimensions.WIDTH + "px";
      this.playing = true;
      this.activated = true;
    } else if (this.crashed) {
      this.restart();
    }
  }
  /** Update the game status to started. */
  startGame() {
    this.runningTime = 0;
    this.playingIntro = false;
    this.tRex.playingIntro = false;
    const style = this.containerEl.style;
    style.webkitAnimation = "";
    this.playCount++;
    document.addEventListener(
      _Runner.events.VISIBILITY,
      this.onVisibilityChange.bind(this)
    );
    window.addEventListener(
      _Runner.events.BLUR,
      this.onVisibilityChange.bind(this)
    );
    window.addEventListener(
      _Runner.events.FOCUS,
      this.onVisibilityChange.bind(this)
    );
  }
  clearCanvas() {
    this.canvasCtx.clearRect(
      0,
      0,
      this.dimensions.WIDTH,
      this.dimensions.HEIGHT
    );
  }
  /** Update the game frame and schedules the next one. */
  update() {
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
      if (this.tRex.jumpCount == 1 && !this.playingIntro) {
        this.playIntro();
      }
      if (this.playingIntro) {
        this.horizon.update(0, this.currentSpeed, hasObstacles);
      } else {
        deltaTime = !this.activated ? 0 : deltaTime;
        this.horizon.update(
          deltaTime,
          this.currentSpeed,
          hasObstacles,
          this.inverted
        );
      }
      const collision = hasObstacles && checkForCollision(this.horizon.obstacles[0], this.tRex);
      if (!collision) {
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }
      const playAchievementSound = this.distanceMeter.update(
        deltaTime,
        Math.ceil(this.distanceRan)
      );
      if (playAchievementSound) {
        this.playSound(this.soundFx.SCORE);
      }
      if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
        this.invertTimer = 0;
        this.invertTrigger = false;
        this.invert();
      } else if (this.invertTimer) {
        this.invertTimer += deltaTime;
      } else {
        const actualDistance = this.distanceMeter.getActualDistance(
          Math.ceil(this.distanceRan)
        );
        if (actualDistance > 0) {
          this.invertTrigger = !(actualDistance % this.config.INVERT_DISTANCE);
          if (this.invertTrigger && this.invertTimer === 0) {
            this.invertTimer += deltaTime;
            this.invert();
          }
        }
      }
    }
    if (this.playing || !this.activated && this.tRex.blinkCount < _Runner.config.MAX_BLINK_COUNT) {
      this.tRex.update(deltaTime);
      this.scheduleNextUpdate();
    }
  }
  /** Event handler. */
  handleEvent(e) {
    const evtType = e.type;
    switch (evtType) {
      case _Runner.events.KEYDOWN:
      case _Runner.events.TOUCHSTART:
      case _Runner.events.MOUSEDOWN:
        this.onKeyDown(e);
        break;
      case _Runner.events.KEYUP:
      case _Runner.events.TOUCHEND:
      case _Runner.events.MOUSEUP:
        this.onKeyUp(e);
        break;
    }
  }
  /** Bind relevant key / mouse / touch listeners. */
  startListening() {
    document.addEventListener(_Runner.events.KEYDOWN, this);
    document.addEventListener(_Runner.events.KEYUP, this);
    if (IS_MOBILE) {
      this.touchController.addEventListener(_Runner.events.TOUCHSTART, this);
      this.touchController.addEventListener(_Runner.events.TOUCHEND, this);
      this.containerEl.addEventListener(_Runner.events.TOUCHSTART, this);
    } else {
      document.addEventListener(_Runner.events.MOUSEDOWN, this);
      document.addEventListener(_Runner.events.MOUSEUP, this);
    }
  }
  /** Remove all listeners. */
  stopListening() {
    document.removeEventListener(_Runner.events.KEYDOWN, this);
    document.removeEventListener(_Runner.events.KEYUP, this);
    if (IS_MOBILE) {
      this.touchController.removeEventListener(
        _Runner.events.TOUCHSTART,
        this
      );
      this.touchController.removeEventListener(
        _Runner.events.TOUCHEND,
        this
      );
      this.containerEl.removeEventListener(
        _Runner.events.TOUCHSTART,
        this
      );
    } else {
      document.removeEventListener(_Runner.events.MOUSEDOWN, this);
      document.removeEventListener(_Runner.events.MOUSEUP, this);
    }
  }
  /** Process keydown. */
  onKeyDown(e) {
    if (IS_MOBILE && this.playing) {
      e.preventDefault();
    }
    if (e.target !== this.detailsButton) {
      if (!this.crashed && (_Runner.keycodes.JUMP[String(e.keyCode)] || e.type == _Runner.events.TOUCHSTART)) {
        if (!this.playing) {
          this.loadSounds();
          this.playing = true;
          this.update();
          const win = window;
          if (win.errorPageController) {
            win.errorPageController.trackEasterEgg();
          }
        }
        if (!this.tRex.jumping && !this.tRex.ducking) {
          this.playSound(this.soundFx.BUTTON_PRESS);
          this.tRex.startJump(this.currentSpeed);
        }
      }
      if (this.crashed && e.type == _Runner.events.TOUCHSTART && e.currentTarget == this.containerEl) {
        this.restart();
      }
    }
    if (this.playing && !this.crashed && _Runner.keycodes.DUCK[String(e.keyCode)]) {
      e.preventDefault();
      if (this.tRex.jumping) {
        this.tRex.setSpeedDrop();
      } else if (!this.tRex.jumping && !this.tRex.ducking) {
        this.tRex.setDuck(true);
      }
    }
  }
  /** Process key up. */
  onKeyUp(e) {
    const keyCode = String(e.keyCode);
    const isjumpKey = _Runner.keycodes.JUMP[keyCode] || e.type == _Runner.events.TOUCHEND || e.type == _Runner.events.MOUSEDOWN;
    if (this.isRunning() && isjumpKey) {
      this.tRex.endJump();
    } else if (_Runner.keycodes.DUCK[keyCode]) {
      this.tRex.speedDrop = false;
      this.tRex.setDuck(false);
    } else if (this.crashed) {
      const deltaTime = getTimeStamp() - this.time;
      if (_Runner.keycodes.RESTART[keyCode] || this.isLeftClickOnCanvas(e) || deltaTime >= this.config.GAMEOVER_CLEAR_TIME && _Runner.keycodes.JUMP[keyCode]) {
        this.restart();
      }
    } else if (this.paused && isjumpKey) {
      this.tRex.reset();
      this.play();
    }
  }
  /**
   * Returns whether the event was a left click on canvas.
   * On Windows right click is registered as a click.
   */
  isLeftClickOnCanvas(e) {
    return e.button != null && e.button < 2 && e.type == _Runner.events.MOUSEUP && e.target == this.canvas;
  }
  /** RequestAnimationFrame wrapper. */
  scheduleNextUpdate() {
    if (!this.updatePending) {
      this.updatePending = true;
      this.raqId = requestAnimationFrame(this.update.bind(this));
    }
  }
  /** Whether the game is running. */
  isRunning() {
    return !!this.raqId;
  }
  /** Game over state. */
  gameOver() {
    this.playSound(this.soundFx.HIT);
    vibrate(200);
    this.stop();
    this.crashed = true;
    this.distanceMeter.acheivement = false;
    this.tRex.update(100, Trex.status.CRASHED);
    if (!this.gameOverPanel) {
      this.gameOverPanel = new GameOverPanel(
        this.canvas,
        this.spriteDef.TEXT_SPRITE,
        this.spriteDef.RESTART,
        this.dimensions
      );
    } else {
      this.gameOverPanel.draw();
    }
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }
    this.time = getTimeStamp();
  }
  stop() {
    this.playing = false;
    this.paused = true;
    cancelAnimationFrame(this.raqId);
    this.raqId = 0;
  }
  play() {
    if (!this.crashed) {
      this.playing = true;
      this.paused = false;
      this.tRex.update(0, Trex.status.RUNNING);
      this.time = getTimeStamp();
      this.update();
    }
  }
  restart() {
    if (!this.raqId) {
      this.playCount++;
      this.runningTime = 0;
      this.playing = true;
      this.crashed = false;
      this.distanceRan = 0;
      this.setSpeed(this.config.SPEED);
      this.time = getTimeStamp();
      this.containerEl.classList.remove(_Runner.classes.CRASHED);
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
  onVisibilityChange(e) {
    const doc = document;
    if (document.hidden || doc.webkitHidden || e.type == "blur" || document.visibilityState != "visible") {
      this.stop();
    } else if (!this.crashed) {
      this.tRex.reset();
      this.play();
    }
  }
  /** Play a sound. */
  playSound(soundBuffer) {
    if (soundBuffer) {
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = soundBuffer;
      sourceNode.connect(this.audioContext.destination);
      sourceNode.start(0);
    }
  }
  /** Inverts the current page / canvas colors. */
  invert(reset) {
    if (reset) {
      document.getElementById("t").classList.toggle(_Runner.classes.INVERTED, false);
      this.invertTimer = 0;
      this.inverted = false;
    } else {
      this.inverted = document.getElementById("t").classList.toggle(_Runner.classes.INVERTED, this.invertTrigger);
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
  static updateCanvasScaling(canvas, opt_width, opt_height) {
    const context = canvas.getContext("2d");
    const devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
    const vendorContext = context;
    const backingStoreRatio = Math.floor(vendorContext.webkitBackingStorePixelRatio ?? 0) || 1;
    const ratio = devicePixelRatio / backingStoreRatio;
    if (devicePixelRatio !== backingStoreRatio) {
      const oldWidth = opt_width || canvas.width;
      const oldHeight = opt_height || canvas.height;
      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;
      canvas.style.width = oldWidth + "px";
      canvas.style.height = oldHeight + "px";
      context.scale(ratio, ratio);
      return true;
    } else if (devicePixelRatio == 1) {
      canvas.style.width = canvas.width + "px";
      canvas.style.height = canvas.height + "px";
    }
    return false;
  }
};
window.Runner = Runner;

// assets/scripts/dino/index.ts
var JUMP_CODES = /* @__PURE__ */ new Set(["Space", "ArrowUp", "ArrowDown", "KeyW", "KeyS"]);
var JUMP_KEYS = /* @__PURE__ */ new Set([" ", "Spacebar", "ArrowUp", "ArrowDown", "w", "W", "s", "S"]);
function isEditable(target) {
  const element = target;
  if (!element || !element.tagName) return false;
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable === true;
}
function installScrollGuard() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (isEditable(event.target)) return;
      if (JUMP_CODES.has(event.code) || JUMP_KEYS.has(event.key)) event.preventDefault();
    },
    { passive: false }
  );
}
var guardInstalled = false;
function initDino(selector = ".interstitial-wrapper") {
  if (!document.querySelector(selector)) return;
  new Runner(selector);
  if (!guardInstalled) {
    guardInstalled = true;
    installScrollGuard();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  initDino();
});
export {
  initDino
};
