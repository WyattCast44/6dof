import Vector3 from "./Vector3";
import Meters from "../length/Meters";

/**
 * Represents a position in 3D space using the NED (North-East-Down) coordinate frame.
 *
 * ## Coordinate Convention (NED)
 * - **X (North)**: Positive toward geographic north
 * - **Y (East)**: Positive toward geographic east
 * - **Z (Down)**: Positive toward Earth's center (below sea level)
 *
 * ## Altitude Interpretation
 * - Sea level: z = 0
 * - Above sea level (e.g., 1000m altitude): z = -1000
 * - Below sea level (e.g., Dead Sea): z = +430
 *
 * @example
 * ```typescript
 * // Aircraft at 1000m altitude, 500m north, 200m east of origin
 * const pos = PositionVector.fromMeters(500, 200, -1000);
 *
 * // Using Meters objects
 * const pos2 = new PositionVector(
 *   new Meters(500),
 *   new Meters(200),
 *   new Meters(-1000)
 * );
 * ```
 *
 * @remarks
 * All instances are immutable. Operations return new PositionVector instances.
 */
class PositionVector extends Vector3 {
  /** North component in meters */
  public readonly north: Meters;
  /** East component in meters */
  public readonly east: Meters;
  /** Down component in meters (positive = below sea level) */
  public readonly down: Meters;

  constructor(north: Meters, east: Meters, down: Meters) {
    super(north.value, east.value, down.value);
    this.north = north;
    this.east = east;
    this.down = down;
  }

  /**
   * Create a PositionVector from raw meter values.
   */
  static fromMeters(north: number, east: number, down: number): PositionVector {
    return new PositionVector(
      new Meters(north),
      new Meters(east),
      new Meters(down)
    );
  }

  /**
   * Create a PositionVector from an object with optional Meters or number values.
   */
  static from(vector: {
    north: Meters | number;
    east: Meters | number;
    down: Meters | number;
  }): PositionVector {
    const north = vector.north instanceof Meters ? vector.north : new Meters(vector.north);
    const east = vector.east instanceof Meters ? vector.east : new Meters(vector.east);
    const down = vector.down instanceof Meters ? vector.down : new Meters(vector.down);
    return new PositionVector(north, east, down);
  }
  
  /**
   * Create a position at a given altitude above sea level.
   *
   * @param altitudeMSL - Altitude above mean sea level (positive = up)
   * @param north - North offset from origin (default 0)
   * @param east - East offset from origin (default 0)
   */
  static atAltitude(
    altitudeMSL: Meters | number,
    north: Meters | number = 0,
    east: Meters | number = 0
  ): PositionVector {
    const altValue = altitudeMSL instanceof Meters ? altitudeMSL.value : altitudeMSL;
    const northValue = north instanceof Meters ? north.value : north;
    const eastValue = east instanceof Meters ? east.value : east;

    // Convert MSL altitude to NED down component (negate)
    return PositionVector.fromMeters(northValue, eastValue, -altValue);
  }

  /**
   * Get the altitude above mean sea level (positive = up).
   */
  get altitudeMSL(): Meters {
    return new Meters(-this.down.value);
  }

  /**
   * Add another position vector (or displacement).
   */
  add(other: PositionVector): PositionVector {
    return PositionVector.fromMeters(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z
    );
  }

  /**
   * Subtract another position vector.
   */
  subtract(other: PositionVector): PositionVector {
    return PositionVector.fromMeters(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  }

  /**
   * Scale the position vector by a factor.
   */
  scale(factor: number): PositionVector {
    return PositionVector.fromMeters(
      this.x * factor,
      this.y * factor,
      this.z * factor
    );
  }

  /**
   * Create a copy of this position vector.
   */
  clone(): PositionVector {
    return PositionVector.fromMeters(this.x, this.y, this.z);
  }

  /**
   * Calculate distance to another position.
   */
  distanceTo(other: PositionVector): Meters {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return new Meters(Math.sqrt(dx * dx + dy * dy + dz * dz));
  }

  toString(): string {
    return `PositionVector(N: ${this.north.value.toFixed(2)}m, E: ${this.east.value.toFixed(2)}m, D: ${this.down.value.toFixed(2)}m)`;
  }
}

export default PositionVector;