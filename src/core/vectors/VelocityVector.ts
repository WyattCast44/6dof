import Vector3 from "./Vector3";
import MetersPerSecond from "../velocity/MetersPerSecond";

/**
 * Represents velocity in 3D space using body-fixed axes.
 *
 * ## Body-Fixed Coordinate Convention
 * - **u (forward)**: Velocity along the body x-axis (positive = forward/nose direction)
 * - **v (right)**: Velocity along the body y-axis (positive = right wing direction)
 * - **w (down)**: Velocity along the body z-axis (positive = down/belly direction)
 *
 * ## Sign Conventions
 * - Positive u: Moving forward
 * - Positive v: Slipping right (sideslip)
 * - Positive w: Moving down relative to body (positive angle of attack)
 *
 * @example
 * ```typescript
 * // Aircraft flying forward at 50 m/s with slight sideslip
 * const vel = VelocityVector.fromComponents(50, 2, 0);
 *
 * // Using MetersPerSecond objects
 * const vel2 = new VelocityVector(
 *   new MetersPerSecond(50),
 *   new MetersPerSecond(2),
 *   new MetersPerSecond(0)
 * );
 * ```
 *
 * @remarks
 * All instances are immutable. Operations return new VelocityVector instances.
 */
class VelocityVector extends Vector3 {
  /** Forward velocity component (body x-axis) */
  public readonly u: MetersPerSecond;
  /** Right velocity component (body y-axis) */
  public readonly v: MetersPerSecond;
  /** Down velocity component (body z-axis) */
  public readonly w: MetersPerSecond;

  constructor(u: MetersPerSecond, v: MetersPerSecond, w: MetersPerSecond) {
    super(u.value, v.value, w.value);
    this.u = u;
    this.v = v;
    this.w = w;
  }

  /**
   * Create a VelocityVector from raw m/s values.
   */
  static fromComponents(u: number, v: number, w: number): VelocityVector {
    return new VelocityVector(
      new MetersPerSecond(u),
      new MetersPerSecond(v),
      new MetersPerSecond(w)
    );
  }

  /**
   * Create a VelocityVector from an object with optional MetersPerSecond or number values.
   */
  static from(vector: {
    u: MetersPerSecond | number;
    v: MetersPerSecond | number;
    w: MetersPerSecond | number;
  }): VelocityVector {
    const u = vector.u instanceof MetersPerSecond ? vector.u : new MetersPerSecond(vector.u);
    const v = vector.v instanceof MetersPerSecond ? vector.v : new MetersPerSecond(vector.v);
    const w = vector.w instanceof MetersPerSecond ? vector.w : new MetersPerSecond(vector.w);
    return new VelocityVector(u, v, w);
  }

  /**
   * Create a forward-only velocity (common for level flight initialization).
   */
  static forward(speed: MetersPerSecond | number): VelocityVector {
    const speedValue = speed instanceof MetersPerSecond ? speed.value : speed;
    return VelocityVector.fromComponents(speedValue, 0, 0);
  }

  /**
   * Get the total airspeed (magnitude of velocity vector).
   */
  get airspeed(): MetersPerSecond {
    return new MetersPerSecond(this.magnitude());
  }

  /**
   * Get the forward component (alias for u).
   */
  get forward(): MetersPerSecond {
    return this.u;
  }

  /**
   * Get the right/lateral component (alias for v).
   */
  get right(): MetersPerSecond {
    return this.v;
  }

  /**
   * Get the down component (alias for w).
   */
  get down(): MetersPerSecond {
    return this.w;
  }

  /**
   * Calculate angle of attack (alpha) in radians.
   * Alpha = atan2(w, u)
   */
  get angleOfAttack(): number {
    return Math.atan2(this.w.value, this.u.value);
  }

  /**
   * Calculate sideslip angle (beta) in radians.
   * Beta = atan2(v, u)
   */
  get sideslipAngle(): number {
    return Math.atan2(this.v.value, this.u.value);
  }

  /**
   * Add another velocity vector.
   */
  add(other: VelocityVector): VelocityVector {
    return VelocityVector.fromComponents(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z
    );
  }

  /**
   * Subtract another velocity vector.
   */
  subtract(other: VelocityVector): VelocityVector {
    return VelocityVector.fromComponents(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  }

  /**
   * Scale the velocity vector by a factor.
   */
  scale(factor: number): VelocityVector {
    return VelocityVector.fromComponents(
      this.x * factor,
      this.y * factor,
      this.z * factor
    );
  }

  /**
   * Create a copy of this velocity vector.
   */
  clone(): VelocityVector {
    return VelocityVector.fromComponents(this.x, this.y, this.z);
  }

  toString(): string {
    return `VelocityVector(u: ${this.u.value.toFixed(2)} m/s, v: ${this.v.value.toFixed(2)} m/s, w: ${this.w.value.toFixed(2)} m/s)`;
  }
}

export default VelocityVector;