/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */

/** A position within a sprite sheet. */
export interface SpritePosition {
  x: number;
  y: number;
}

/** Canvas / game dimensions. */
export interface CanvasDimensions {
  WIDTH: number;
  HEIGHT: number;
}

/** Sprite sheet layout of the spritesheet. */
export interface SpriteDefinition {
  CACTUS_LARGE: SpritePosition;
  CACTUS_SMALL: SpritePosition;
  CLOUD: SpritePosition;
  HORIZON: SpritePosition;
  MOON: SpritePosition;
  PTERODACTYL: SpritePosition;
  RESTART: SpritePosition;
  TEXT_SPRITE: SpritePosition;
  TREX: SpritePosition;
  STAR: SpritePosition;
}

/** Default game width. */
export const DEFAULT_WIDTH = 600;

/** Frames per second. */
export const FPS = 60;

export const IS_HIDPI = window.devicePixelRatio > 1;

export const IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);

export const IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;
