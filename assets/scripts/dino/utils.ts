/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */
import { IS_IOS, IS_MOBILE } from './config.js';
import { Runner } from './runner.js';

/** Get random number. */
export function getRandomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Vibrate on mobile devices. */
export function vibrate(duration: number): void {
  if (IS_MOBILE && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}

/** Create canvas element. */
export function createCanvas(
  container: HTMLElement,
  width: number,
  height: number,
  opt_classname?: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = opt_classname
    ? Runner.classes.CANVAS + ' ' + opt_classname
    : Runner.classes.CANVAS;
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  return canvas;
}

/** Decodes the base 64 audio to ArrayBuffer used by Web Audio. */
export function decodeBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const len = (base64String.length / 4) * 3;
  const str = atob(base64String);
  const arrayBuffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(arrayBuffer);

  for (let i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Return the current timestamp. */
export function getTimeStamp(): number {
  return IS_IOS ? new Date().getTime() : performance.now();
}
