/**
 * Base class for 3-dimensional vectors with common mathematical operations.
 *
 * This provides the foundation for position, velocity, and other 3D quantities
 * used in flight dynamics calculations.
 *
 * @remarks
 * All Vector3 instances are immutable. Operations return new instances.
 */
abstract class Vector3 {
    constructor(
      public readonly x: number,
      public readonly y: number,
      public readonly z: number
    ) {
      this.validate();
    }
  
    /**
     * Validate that all components are finite numbers.
     */
    protected validate(): void {
      if (!Number.isFinite(this.x)) {
        throw new RangeError(`x component must be finite, got ${this.x}`);
      }
      if (!Number.isFinite(this.y)) {
        throw new RangeError(`y component must be finite, got ${this.y}`);
      }
      if (!Number.isFinite(this.z)) {
        throw new RangeError(`z component must be finite, got ${this.z}`);
      }
    }
  
    /**
     * Calculate the magnitude (length) of the vector.
     */
    magnitude(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
  
    /**
     * Calculate the squared magnitude (avoids sqrt for comparisons).
     */
    magnitudeSquared(): number {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
  
    /**
     * Calculate the dot product with another vector.
     */
    dot(other: Vector3): number {
      return this.x * other.x + this.y * other.y + this.z * other.z;
    }
  
    /**
     * Convert to a plain array [x, y, z].
     */
    toArray(): [number, number, number] {
      return [this.x, this.y, this.z];
    }
  
    /**
     * Check equality with another vector within a tolerance.
     */
    equals(other: Vector3, tolerance: number = 1e-10): boolean {
      return (
        Math.abs(this.x - other.x) <= tolerance &&
        Math.abs(this.y - other.y) <= tolerance &&
        Math.abs(this.z - other.z) <= tolerance
      );
    }
  
    /**
     * Create a string representation of the vector.
     */
    toString(): string {
      return `[${this.x.toFixed(4)}, ${this.y.toFixed(4)}, ${this.z.toFixed(4)}]`;
    }
  }
  
  export default Vector3;