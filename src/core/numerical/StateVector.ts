import type MSL from "../altitude/MSL";
import EulerAngles from "../attitude/EulerAngles";
import AngularVelocity from "../attitude/AngularVelocity";
import PositionVector from "../vectors/PositionVector";
import VelocityVector from "../vectors/VelocityVector";
import MetersPerSecond from "../velocity/MetersPerSecond";

/**
 * Complete state of a rigid body aircraft with 12 degrees of freedom.
 *
 * ## State Components (12 DOF)
 * - **Position** (3 DOF): North, East, Down in NED frame
 * - **Velocity** (3 DOF): u, v, w in body-fixed frame
 * - **Attitude** (3 DOF): φ, θ, ψ Euler angles (roll, pitch, yaw)
 * - **Angular rates** (3 DOF): p, q, r body angular velocities
 *
 * ## Coordinate Frames
 * - Position uses NED (North-East-Down) inertial frame
 * - Velocity uses body-fixed frame (forward-right-down)
 * - Angular rates use body-fixed frame
 *
 * ## Usage in Integration
 * The StateVector is designed for use with numerical integrators.
 * It provides `toArray()` and `fromArray()` methods for efficient
 * integration, plus `add()` and `scale()` for RK4 and similar methods.
 *
 * @example
 * ```typescript
 * // Create level flight state
 * const state = StateVector.levelFlight({
 *   altitude: new MSL(new Meters(1000)),
 *   airspeed: new MetersPerSecond(50),
 *   heading: 0,
 * });
 *
 * // For integration: y_new = y + h * dydt
 * const newState = state.add(derivative.scale(dt));
 * ```
 *
 * @remarks
 * All StateVector instances are immutable. Operations return new instances.
 */
class StateVector {
  /** Number of state variables (12 DOF) */
  static readonly SIZE = 12;

  constructor(
    /** Position in NED inertial frame */
    public readonly position: PositionVector,
    /** Velocity in body-fixed frame */
    public readonly velocity: VelocityVector,
    /** Attitude as Euler angles (roll, pitch, yaw) */
    public readonly attitude: EulerAngles,
    /** Angular velocity in body-fixed frame */
    public readonly angularVelocity: AngularVelocity
  ) {
    // All components validate themselves in their constructors
  }

  /**
   * Create a zero state (origin, no motion, level attitude).
   */
  static zero(): StateVector {
    return new StateVector(
      PositionVector.fromMeters(0, 0, 0),
      VelocityVector.fromComponents(0, 0, 0),
      EulerAngles.zero(),
      AngularVelocity.zero()
    );
  }

  /**
   * Create a state for wings-level, unaccelerated flight.
   *
   * @param altitude - Altitude above mean sea level
   * @param airspeed - Forward airspeed
   * @param heading - Optional heading in radians (default 0 = north)
   */
  static levelFlight({
    altitude,
    airspeed,
    heading = 0,
  }: {
    altitude: MSL;
    airspeed: MetersPerSecond | number;
    heading?: number;
  }): StateVector {
    const airspeedValue = airspeed instanceof MetersPerSecond ? airspeed.value : airspeed;

    return new StateVector(
      PositionVector.atAltitude(altitude.value),
      VelocityVector.forward(airspeedValue),
      EulerAngles.fromRadians(0, 0, heading),
      AngularVelocity.zero()
    );
  }

  /**
   * Create a StateVector from individual component values.
   */
  static create({
    position,
    velocity,
    attitude,
    angularVelocity,
  }: {
    position?: { north: number; east: number; down: number };
    velocity?: { u: number; v: number; w: number };
    attitude?: { roll: number; pitch: number; yaw: number };
    angularVelocity?: { p: number; q: number; r: number };
  }): StateVector {
    return new StateVector(
      position
        ? PositionVector.fromMeters(position.north, position.east, position.down)
        : PositionVector.fromMeters(0, 0, 0),
      velocity
        ? VelocityVector.fromComponents(velocity.u, velocity.v, velocity.w)
        : VelocityVector.fromComponents(0, 0, 0),
      attitude
        ? EulerAngles.fromRadians(attitude.roll, attitude.pitch, attitude.yaw)
        : EulerAngles.zero(),
      angularVelocity
        ? AngularVelocity.fromComponents(angularVelocity.p, angularVelocity.q, angularVelocity.r)
        : AngularVelocity.zero()
    );
  }

  /**
   * Create a StateVector from a flat array of 12 values.
   *
   * Array order: [x, y, z, u, v, w, φ, θ, ψ, p, q, r]
   * - [0-2]: Position (north, east, down) in meters
   * - [3-5]: Velocity (u, v, w) in m/s
   * - [6-8]: Attitude (roll, pitch, yaw) in radians
   * - [9-11]: Angular velocity (p, q, r) in rad/s
   */
  static fromArray(arr: number[] | Float64Array): StateVector {
    if (arr.length !== StateVector.SIZE) {
      throw new RangeError(
        `StateVector requires exactly ${StateVector.SIZE} values, got ${arr.length}`
      );
    }

    return new StateVector(
      PositionVector.fromMeters(arr[0], arr[1], arr[2]),
      VelocityVector.fromComponents(arr[3], arr[4], arr[5]),
      EulerAngles.fromRadians(arr[6], arr[7], arr[8]),
      AngularVelocity.fromComponents(arr[9], arr[10], arr[11])
    );
  }

  /**
   * Convert to a flat array of 12 values.
   *
   * Array order: [x, y, z, u, v, w, φ, θ, ψ, p, q, r]
   */
  toArray(): Float64Array {
    const arr = new Float64Array(StateVector.SIZE);
    
    // Position
    arr[0] = this.position.x;
    arr[1] = this.position.y;
    arr[2] = this.position.z;
    
    // Velocity
    arr[3] = this.velocity.x;
    arr[4] = this.velocity.y;
    arr[5] = this.velocity.z;
    
    // Attitude
    arr[6] = this.attitude.phi.value;
    arr[7] = this.attitude.theta.value;
    arr[8] = this.attitude.psi.value;
    
    // Angular velocity
    arr[9] = this.angularVelocity.p.value;
    arr[10] = this.angularVelocity.q.value;
    arr[11] = this.angularVelocity.r.value;

    return arr;
  }

  /**
   * Add another StateVector (component-wise).
   * Commonly used in integration: y_new = y + Δy
   */
  add(other: StateVector): StateVector {
    return new StateVector(
      this.position.add(other.position),
      this.velocity.add(other.velocity),
      this.attitude.add(other.attitude),
      this.angularVelocity.add(other.angularVelocity)
    );
  }

  /**
   * Subtract another StateVector (component-wise).
   */
  subtract(other: StateVector): StateVector {
    return new StateVector(
      this.position.subtract(other.position),
      this.velocity.subtract(other.velocity),
      this.attitude.add(other.attitude.scale(-1)), // EulerAngles doesn't have subtract
      this.angularVelocity.subtract(other.angularVelocity)
    );
  }

  /**
   * Scale all components by a factor.
   * Commonly used in integration: Δy = h * dydt
   */
  scale(factor: number): StateVector {
    return new StateVector(
      this.position.scale(factor),
      this.velocity.scale(factor),
      this.attitude.scale(factor),
      this.angularVelocity.scale(factor)
    );
  }

  /**
   * Create a deep copy of this StateVector.
   */
  clone(): StateVector {
    return new StateVector(
      this.position.clone(),
      this.velocity.clone(),
      this.attitude.clone(),
      this.angularVelocity.clone()
    );
  }

  /**
   * Check equality with another StateVector within a tolerance.
   */
  equals(other: StateVector, tolerance: number = 1e-10): boolean {
    return (
      this.position.equals(other.position, tolerance) &&
      this.velocity.equals(other.velocity, tolerance) &&
      this.attitude.equals(other.attitude, tolerance) &&
      this.angularVelocity.equals(other.angularVelocity, tolerance)
    );
  }

  /**
   * Get a normalized version of the state (angles in standard ranges).
   */
  normalize(): StateVector {
    return new StateVector(
      this.position.clone(),
      this.velocity.clone(),
      this.attitude.normalize(),
      this.angularVelocity.clone()
    );
  }

  // Convenient accessors

  /** Altitude above mean sea level (positive = up) */
  get altitudeMSL() {
    return this.position.altitudeMSL;
  }

  /** Total airspeed magnitude */
  get airspeed() {
    return this.velocity.airspeed;
  }

  /** Angle of attack in radians */
  get angleOfAttack(): number {
    return this.velocity.angleOfAttack;
  }

  /** Sideslip angle in radians */
  get sideslipAngle(): number {
    return this.velocity.sideslipAngle;
  }

  toString(): string {
    return (
      `StateVector {\n` +
      `  position: ${this.position.toString()}\n` +
      `  velocity: ${this.velocity.toString()}\n` +
      `  attitude: ${this.attitude.toString()}\n` +
      `  rates: ${this.angularVelocity.toString()}\n` +
      `}`
    );
  }

  /**
   * Create a human-readable summary of the flight state.
   */
  toFlightSummary(): string {
    return (
      `Alt: ${this.altitudeMSL.value.toFixed(0)}m | ` +
      `IAS: ${this.airspeed.value.toFixed(1)} m/s | ` +
      `HDG: ${this.attitude.yawDegrees.toFixed(0)}° | ` +
      `Bank: ${this.attitude.rollDegrees.toFixed(1)}° | ` +
      `Pitch: ${this.attitude.pitchDegrees.toFixed(1)}°`
    );
  }
}

export default StateVector;