import EulerAngles from "../attitude/EulerAngles";

/**
 * NedToBodyDCM - Direction Cosine Matrix for NED to Body Transformation
 * 
 * This class implements the direction cosine matrix (DCM) that transforms
 * vectors from the North-East-Down (NED) navigation coordinate system to
 * the body-fixed coordinate system.
 * 
 * This is the inverse transformation of BodyToNedDCM, using the transpose
 * of the body-to-NED DCM matrix.
 * 
 * COORDINATE SYSTEMS:
 * - NED: X-North, Y-East, Z-down
 * - Body: X-forward, Y-right, Z-down
 * 
 * USAGE:
 * const dcm = new NedToBodyDCM(eulerAngles);
 * const bodyVector = dcm.transform(nedVector);
 */
class NedToBodyDCM {
  private readonly matrix: number[][];

  constructor(eulerAngles: EulerAngles) {
    this.matrix = this.calculateDCM(eulerAngles);
  }

  /**
   * Calculate the 3x3 direction cosine matrix (transpose of body-to-NED)
   */
  private calculateDCM(eulerAngles: EulerAngles): number[][] {
    const phi = eulerAngles.bank_phi.value;      // Roll angle
    const theta = eulerAngles.elevation_theta.value; // Pitch angle
    const psi = eulerAngles.azimuth_psi.value;   // Yaw angle

    // Trigonometric functions
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const cosPsi = Math.cos(psi);
    const sinPsi = Math.sin(psi);

    // NED to Body DCM (transpose of body-to-NED)
    // C_n^b = (C_b^n)^T
    return [
      [
        cosTheta * cosPsi,
        sinPhi * sinTheta * cosPsi - cosPhi * sinPsi,
        cosPhi * sinTheta * cosPsi + sinPhi * sinPsi
      ],
      [
        cosTheta * sinPsi,
        sinPhi * sinTheta * sinPsi + cosPhi * cosPsi,
        cosPhi * sinTheta * sinPsi - sinPhi * cosPsi
      ],
      [
        -sinTheta,
        sinPhi * cosTheta,
        cosPhi * cosTheta
      ]
    ];
  }

  /**
   * Transform a vector from NED coordinates to body coordinates
   * 
   * @param nedVector - Vector in NED coordinates [north, east, down]
   * @returns Vector in body coordinates [x, y, z]
   */
  transform(nedVector: [number, number, number]): [number, number, number] {
    const [north, east, down] = nedVector;
    
    const x = this.matrix[0][0] * north + this.matrix[0][1] * east + this.matrix[0][2] * down;
    const y = this.matrix[1][0] * north + this.matrix[1][1] * east + this.matrix[1][2] * down;
    const z = this.matrix[2][0] * north + this.matrix[2][1] * east + this.matrix[2][2] * down;

    return [x, y, z];
  }

  /**
   * Transform velocity vector from NED to body coordinates
   */
  transformVelocity(north: number, east: number, down: number): [number, number, number] {
    return this.transform([north, east, down]);
  }

  /**
   * Transform gravity vector from NED to body coordinates
   * Gravity in NED is [0, 0, g] where g is positive downward
   */
  transformGravity(gravityMagnitude: number): [number, number, number] {
    return this.transform([0, 0, gravityMagnitude]);
  }

  /**
   * Get the raw DCM matrix
   */
  getMatrix(): number[][] {
    return this.matrix.map(row => [...row]); // Return a copy
  }

  /**
   * Get the transpose of the DCM (body to NED transformation)
   */
  getTranspose(): number[][] {
    return [
      [this.matrix[0][0], this.matrix[1][0], this.matrix[2][0]],
      [this.matrix[0][1], this.matrix[1][1], this.matrix[2][1]],
      [this.matrix[0][2], this.matrix[1][2], this.matrix[2][2]]
    ];
  }

  /**
   * Verify that the DCM is orthogonal (C * C^T = I)
   */
  isOrthogonal(tolerance: number = 1e-10): boolean {
    const transpose = this.getTranspose();
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += this.matrix[i][k] * transpose[k][j];
        }
        
        const expected = i === j ? 1 : 0;
        if (Math.abs(sum - expected) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get the determinant (should be 1 for proper rotation matrix)
   */
  getDeterminant(): number {
    return this.matrix[0][0] * (this.matrix[1][1] * this.matrix[2][2] - this.matrix[1][2] * this.matrix[2][1]) -
           this.matrix[0][1] * (this.matrix[1][0] * this.matrix[2][2] - this.matrix[1][2] * this.matrix[2][0]) +
           this.matrix[0][2] * (this.matrix[1][0] * this.matrix[2][1] - this.matrix[1][1] * this.matrix[2][0]);
  }
}

export default NedToBodyDCM; 