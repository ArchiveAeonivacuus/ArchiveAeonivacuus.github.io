/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 * Extracted from the Chromium source code.
 */
import { Runner } from './runner.js';

const JUMP_CODES = new Set(['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS']);
const JUMP_KEYS = new Set([' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S']);

/** The native runner only prevents scrolling on mobile/duck. On a normal page
 * we must stop Space / arrow keys from scrolling the document while playing. */
function isEditable(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element || !element.tagName) return false;
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable === true;
}

function installScrollGuard(): void {
  document.addEventListener(
    'keydown',
    (event) => {
      if (isEditable(event.target)) return;
      if (JUMP_CODES.has(event.code) || JUMP_KEYS.has(event.key)) event.preventDefault();
    },
    { passive: false },
  );
}

let guardInstalled = false;

/** Start the T-Rex runner if the container is present in the page. */
export function initDino(selector = '.interstitial-wrapper'): void {
  if (!document.querySelector(selector)) return;
  new Runner(selector);
  if (!guardInstalled) {
    guardInstalled = true;
    installScrollGuard();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDino();
});
