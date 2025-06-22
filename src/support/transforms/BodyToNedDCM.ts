import EulerAngles from "../attitude/EulerAngles";

/**
 * BodyToNedDCM - Direction Cosine Matrix for Body to NED Transformation
 * 
 * This class implements the direction cosine matrix (DCM) that transforms
 * vectors from the body-fixed coordinate system to the North-East-Down (NED)
 * navigation coordinate system.
 * 
 * The transformation uses the 3-2-1 Euler angle sequence:
 * 1. Yaw (ψ) about the Z-axis
 * 2. Pitch (θ) about the Y-axis  
 * 3. Roll (φ) about the X-axis
 * 
 * COORDINATE SYSTEMS:
 * - Body: X-forward, Y-right, Z-down
 * - NED: X-North, Y-East, Z-down
 * 
 * USAGE:
 * const dcm = new BodyToNedDCM(eulerAngles);
 * const nedVector = dcm.transform(bodyVector);
 */
class BodyToNedDCM {
  private readonly matrix: number[][];

  constructor(eulerAngles: EulerAngles) {
    this.matrix = this.calculateDCM(eulerAngles);
  }

  /**
   * Calculate the 3x3 direction cosine matrix
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

    // 3-2-1 Euler angle sequence DCM
    // C_b^n = C_1(φ) * C_2(θ) * C_3(ψ)
    return [
      [
        cosTheta * cosPsi,
        cosTheta * sinPsi,
        -sinTheta
      ],
      [
        sinPhi * sinTheta * cosPsi - cosPhi * sinPsi,
        sinPhi * sinTheta * sinPsi + cosPhi * cosPsi,
        sinPhi * cosTheta
      ],
      [
        cosPhi * sinTheta * cosPsi + sinPhi * sinPsi,
        cosPhi * sinTheta * sinPsi - sinPhi * cosPsi,
        cosPhi * cosTheta
      ]
    ];
  }

  /**
   * Transform a vector from body coordinates to NED coordinates
   * 
   * @param bodyVector - Vector in body coordinates [x, y, z]
   * @returns Vector in NED coordinates [north, east, down]
   */
  transform(bodyVector: [number, number, number]): [number, number, number] {
    const [x, y, z] = bodyVector;
    
    const north = this.matrix[0][0] * x + this.matrix[0][1] * y + this.matrix[0][2] * z;
    const east = this.matrix[1][0] * x + this.matrix[1][1] * y + this.matrix[1][2] * z;
    const down = this.matrix[2][0] * x + this.matrix[2][1] * y + this.matrix[2][2] * z;

    return [north, east, down];
  }

  /**
   * Transform velocity vector from body to NED coordinates
   */
  transformVelocity(u: number, v: number, w: number): [number, number, number] {
    return this.transform([u, v, w]);
  }

  /**
   * Get the raw DCM matrix
   */
  getMatrix(): number[][] {
    return this.matrix.map(row => [...row]); // Return a copy
  }

  /**
   * Get the transpose of the DCM (NED to body transformation)
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

export default BodyToNedDCM; 