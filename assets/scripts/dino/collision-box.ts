/**
 * Ported from the Chromium offline T-Rex runner (BSD-3-Clause).
 */

/** Collision box object. */
export class CollisionBox {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}
}
