import Radians from "../angles/Radians";

/**
 * Represents aircraft attitude using Euler angles in the standard aerospace convention.
 *
 * ## Rotation Sequence
 * Uses the 3-2-1 (ZYX) rotation sequence, also known as Tait-Bryan angles:
 * 1. Yaw (ψ) rotation about the Z-axis (down)
 * 2. Pitch (θ) rotation about the new Y-axis (right)
 * 3. Roll (φ) rotation about the new X-axis (forward)
 *
 * ## Sign Conventions
 * - **Roll (φ)**: Positive = right wing down
 * - **Pitch (θ)**: Positive = nose up
 * - **Yaw (ψ)**: Positive = nose right (clockwise when viewed from above)
 *
 * ## Angle Ranges
 * - Roll: -π to +π (or -180° to +180°)
 * - Pitch: -π/2 to +π/2 (or -90° to +90°) — gimbal lock at ±90°
 * - Yaw: -π to +π (or -180° to +180°), or 0 to 2π (0° to 360°)
 *
 * @example
 * ```typescript
 * // Level flight, heading north
 * const level = EulerAngles.zero();
 *
 * // 30° bank turn, slight nose up
 * const turn = EulerAngles.fromDegrees(30, 5, 0);
 *
 * // Using radians
 * const attitude = new EulerAngles(
 *   new Radians(0.5),   // roll
 *   new Radians(0.1),   // pitch
 *   new Radians(1.57)   // yaw (≈90° heading)
 * );
 * ```
 *
 * @remarks
 * All instances are immutable. Operations return new EulerAngles instances.
 */
class EulerAngles {
  /** Roll angle φ (phi) - rotation about body x-axis */
  public readonly phi: Radians;
  /** Pitch angle θ (theta) - rotation about body y-axis */
  public readonly theta: Radians;
  /** Yaw angle ψ (psi) - rotation about body z-axis */
  public readonly psi: Radians;

  /**
   * Create EulerAngles from Radians objects.
   *
   * @param phi - Roll angle (Radians or number)
   * @param theta - Pitch angle (Radians or number)
   * @param psi - Yaw/heading angle (Radians or number)
   */
  constructor(
    phi: Radians | number,
    theta: Radians | number,
    psi: Radians | number
  ) {
    this.phi = phi instanceof Radians ? phi : new Radians(phi);
    this.theta = theta instanceof Radians ? theta : new Radians(theta);
    this.psi = psi instanceof Radians ? psi : new Radians(psi);

    this.validate();
  }

  /**
   * Validate angle values.
   */
  private validate(): void {
    if (!Number.isFinite(this.phi.value)) {
      throw new RangeError(`Roll (phi) must be finite, got ${this.phi.value}`);
    }
    if (!Number.isFinite(this.theta.value)) {
      throw new RangeError(`Pitch (theta) must be finite, got ${this.theta.value}`);
    }
    if (!Number.isFinite(this.psi.value)) {
      throw new RangeError(`Yaw (psi) must be finite, got ${this.psi.value}`);
    }

    // Warn about gimbal lock (pitch near ±90°)
    if (Math.abs(this.theta.value) > Math.PI / 2 - 0.01) {
      console.warn(
        `Warning: Pitch angle (${this.theta.value.toFixed(4)} rad) is near ±90°, ` +
        `which can cause gimbal lock issues in Euler angle representation.`
      );
    }
  }

  /**
   * Create EulerAngles with all zeros (level flight, heading north).
   */
  static zero(): EulerAngles {
    return new EulerAngles(0, 0, 0);
  }

  /**
   * Create EulerAngles from degree values.
   *
   * @param rollDeg - Roll in degrees
   * @param pitchDeg - Pitch in degrees
   * @param yawDeg - Yaw/heading in degrees
   */
  static fromDegrees(rollDeg: number, pitchDeg: number, yawDeg: number): EulerAngles {
    const degToRad = Math.PI / 180;
    return new EulerAngles(
      rollDeg * degToRad,
      pitchDeg * degToRad,
      yawDeg * degToRad
    );
  }

  /**
   * Create EulerAngles from radian values.
   */
  static fromRadians(phi: number, theta: number, psi: number): EulerAngles {
    return new EulerAngles(phi, theta, psi);
  }

  // Convenient aliases using standard terminology

  /** Roll angle (alias for phi) */
  get roll(): Radians {
    return this.phi;
  }

  /** Pitch angle (alias for theta) */
  get pitch(): Radians {
    return this.theta;
  }

  /** Yaw/heading angle (alias for psi) */
  get yaw(): Radians {
    return this.psi;
  }

  /** Heading angle (alias for psi, common in navigation) */
  get heading(): Radians {
    return this.psi;
  }

  /**
   * Get roll in degrees.
   */
  get rollDegrees(): number {
    return this.phi.value * (180 / Math.PI);
  }

  /**
   * Get pitch in degrees.
   */
  get pitchDegrees(): number {
    return this.theta.value * (180 / Math.PI);
  }

  /**
   * Get yaw/heading in degrees.
   */
  get yawDegrees(): number {
    return this.psi.value * (180 / Math.PI);
  }

  /**
   * Add another set of Euler angles (useful for small angle increments).
   *
   * @remarks
   * This is only accurate for small angles. For large rotations,
   * use quaternion or rotation matrix multiplication.
   */
  add(other: EulerAngles): EulerAngles {
    return new EulerAngles(
      this.phi.value + other.phi.value,
      this.theta.value + other.theta.value,
      this.psi.value + other.psi.value
    );
  }

  /**
   * Scale all angles by a factor.
   */
  scale(factor: number): EulerAngles {
    return new EulerAngles(
      this.phi.value * factor,
      this.theta.value * factor,
      this.psi.value * factor
    );
  }

  /**
   * Create a copy of these Euler angles.
   */
  clone(): EulerAngles {
    return new EulerAngles(this.phi.value, this.theta.value, this.psi.value);
  }

  /**
   * Convert to array [phi, theta, psi].
   */
  toArray(): [number, number, number] {
    return [this.phi.value, this.theta.value, this.psi.value];
  }

  /**
   * Check equality with another EulerAngles within a tolerance.
   */
  equals(other: EulerAngles, tolerance: number = 1e-10): boolean {
    return (
      Math.abs(this.phi.value - other.phi.value) <= tolerance &&
      Math.abs(this.theta.value - other.theta.value) <= tolerance &&
      Math.abs(this.psi.value - other.psi.value) <= tolerance
    );
  }

  /**
   * Normalize angles to standard ranges.
   * - Roll: [-π, π]
   * - Pitch: [-π/2, π/2]
   * - Yaw: [-π, π]
   */
  normalize(): EulerAngles {
    const normalizeAngle = (angle: number): number => {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    };

    return new EulerAngles(
      normalizeAngle(this.phi.value),
      Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.theta.value)),
      normalizeAngle(this.psi.value)
    );
  }

  toString(): string {
    return `EulerAngles(φ: ${this.rollDegrees.toFixed(2)}°, θ: ${this.pitchDegrees.toFixed(2)}°, ψ: ${this.yawDegrees.toFixed(2)}°)`;
  }
}

export default EulerAngles;