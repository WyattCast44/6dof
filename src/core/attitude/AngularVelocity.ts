import RadiansPerSecond from "../rates/RadiansPerSecond";

/**
 * Represents angular velocity (body rates) in body-fixed axes.
 *
 * ## Body-Fixed Angular Rates
 * - **p (roll rate)**: Angular velocity about the body x-axis (forward)
 * - **q (pitch rate)**: Angular velocity about the body y-axis (right)
 * - **r (yaw rate)**: Angular velocity about the body z-axis (down)
 *
 * ## Sign Conventions
 * Using right-hand rule about each body axis:
 * - Positive p: Rolling right (right wing down)
 * - Positive q: Pitching up (nose up)
 * - Positive r: Yawing right (nose right)
 *
 * @example
 * ```typescript
 * // Steady coordinated turn (rolling and yawing)
 * const rates = AngularVelocity.fromComponents(0.1, 0, 0.05);
 *
 * // Using RadiansPerSecond
 * const rates2 = new AngularVelocity(
 *   new RadiansPerSecond(0.1),
 *   new RadiansPerSecond(0),
 *   new RadiansPerSecond(0.05)
 * );
 * ```
 *
 * @remarks
 * All instances are immutable. Operations return new AngularVelocity instances.
 */
class AngularVelocity {
  /** Roll rate p - angular velocity about body x-axis */
  public readonly p: RadiansPerSecond;
  /** Pitch rate q - angular velocity about body y-axis */
  public readonly q: RadiansPerSecond;
  /** Yaw rate r - angular velocity about body z-axis */
  public readonly r: RadiansPerSecond;

  constructor(
    p: RadiansPerSecond | number,
    q: RadiansPerSecond | number,
    r: RadiansPerSecond | number
  ) {
    this.p = p instanceof RadiansPerSecond ? p : new RadiansPerSecond(p);
    this.q = q instanceof RadiansPerSecond ? q : new RadiansPerSecond(q);
    this.r = r instanceof RadiansPerSecond ? r : new RadiansPerSecond(r);

    this.validate();
  }

  /**
   * Validate rate values.
   */
  private validate(): void {
    if (!Number.isFinite(this.p.value)) {
      throw new RangeError(`Roll rate (p) must be finite, got ${this.p.value}`);
    }
    if (!Number.isFinite(this.q.value)) {
      throw new RangeError(`Pitch rate (q) must be finite, got ${this.q.value}`);
    }
    if (!Number.isFinite(this.r.value)) {
      throw new RangeError(`Yaw rate (r) must be finite, got ${this.r.value}`);
    }
  }

  /**
   * Create AngularVelocity with all zeros (no rotation).
   */
  static zero(): AngularVelocity {
    return new AngularVelocity(0, 0, 0);
  }

  /**
   * Create AngularVelocity from raw rad/s values.
   */
  static fromComponents(p: number, q: number, r: number): AngularVelocity {
    return new AngularVelocity(p, q, r);
  }

  /**
   * Create AngularVelocity from degrees per second.
   */
  static fromDegreesPerSecond(
    pDeg: number,
    qDeg: number,
    rDeg: number
  ): AngularVelocity {
    const degToRad = Math.PI / 180;
    return new AngularVelocity(
      pDeg * degToRad,
      qDeg * degToRad,
      rDeg * degToRad
    );
  }

  /**
   * Create AngularVelocity from an array [p, q, r].
   */
  static fromArray(arr: [number, number, number] | Float64Array): AngularVelocity {
    return AngularVelocity.fromComponents(arr[0], arr[1], arr[2]);
  }

  // Convenient aliases

  /** Roll rate (alias for p) */
  get rollRate(): RadiansPerSecond {
    return this.p;
  }

  /** Pitch rate (alias for q) */
  get pitchRate(): RadiansPerSecond {
    return this.q;
  }

  /** Yaw rate (alias for r) */
  get yawRate(): RadiansPerSecond {
    return this.r;
  }

  /**
   * Get roll rate in degrees per second.
   */
  get rollRateDegrees(): number {
    return this.p.value * (180 / Math.PI);
  }

  /**
   * Get pitch rate in degrees per second.
   */
  get pitchRateDegrees(): number {
    return this.q.value * (180 / Math.PI);
  }

  /**
   * Get yaw rate in degrees per second.
   */
  get yawRateDegrees(): number {
    return this.r.value * (180 / Math.PI);
  }

  /**
   * Calculate the total angular rate (magnitude).
   */
  get magnitude(): number {
    return Math.sqrt(
      this.p.value * this.p.value +
      this.q.value * this.q.value +
      this.r.value * this.r.value
    );
  }

  /**
   * Add another angular velocity.
   */
  add(other: AngularVelocity): AngularVelocity {
    return AngularVelocity.fromComponents(
      this.p.value + other.p.value,
      this.q.value + other.q.value,
      this.r.value + other.r.value
    );
  }

  /**
   * Subtract another angular velocity.
   */
  subtract(other: AngularVelocity): AngularVelocity {
    return AngularVelocity.fromComponents(
      this.p.value - other.p.value,
      this.q.value - other.q.value,
      this.r.value - other.r.value
    );
  }

  /**
   * Scale angular velocity by a factor.
   */
  scale(factor: number): AngularVelocity {
    return AngularVelocity.fromComponents(
      this.p.value * factor,
      this.q.value * factor,
      this.r.value * factor
    );
  }

  /**
   * Create a copy of this angular velocity.
   */
  clone(): AngularVelocity {
    return AngularVelocity.fromComponents(
      this.p.value,
      this.q.value,
      this.r.value
    );
  }

  /**
   * Convert to array [p, q, r].
   */
  toArray(): [number, number, number] {
    return [this.p.value, this.q.value, this.r.value];
  }

  /**
   * Check equality with another AngularVelocity within a tolerance.
   */
  equals(other: AngularVelocity, tolerance: number = 1e-10): boolean {
    return (
      Math.abs(this.p.value - other.p.value) <= tolerance &&
      Math.abs(this.q.value - other.q.value) <= tolerance &&
      Math.abs(this.r.value - other.r.value) <= tolerance
    );
  }

  toString(): string {
    return `AngularVelocity(p: ${this.rollRateDegrees.toFixed(2)}°/s, q: ${this.pitchRateDegrees.toFixed(2)}°/s, r: ${this.yawRateDegrees.toFixed(2)}°/s)`;
  }
}

export default AngularVelocity;