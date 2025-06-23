import EulerAngles from "../attitude/EulerAngles";
import BodyVector from "../vectors/BodyVector";
import NedVector from "../vectors/NedVector";
import DCM from "./DCM";

/**
 * BodyNedDCM - Direction Cosine Matrix for Body-to-NED and NED-to-Body Transformations
 *
 * This class implements the direction cosine matrix (DCM) that transforms
 * vectors from the body-fixed coordinate system to the North-East-Down (NED)
 * navigation coordinate system and vice versa.
 * 
 * NOTE: Aerospace convention uses positive angles for clockwise rotation (right-hand rule),
 * while mathematical convention uses positive angles for counterclockwise rotation.
 * We handle this by negating the yaw angle in the trigonometric calculations.
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
 * const dcm = new BodyNedDCM(eulerAngles);
 * const nedVector = dcm.transform(bodyVector);
 */
class BodyNedDCM extends DCM {
  /**
   * Generate the 3x3 direction cosine matrix for Body to NED transformation.
   *
   * Using the 3-2-1 Euler angle sequence
   *
   * Where 3 is rotation about the z-axis, 2 is rotation about the y-axis, and 1 is rotation about the x-axis
   *
   * NOTE: Aerospace convention uses positive angles for clockwise rotation (right-hand rule),
   * while mathematical convention uses positive angles for counterclockwise rotation.
   * We handle this by negating the yaw angle in the trigonometric calculations.
   *
   * @param eulerAngles - The Euler angles
   *
   * @returns The 3x3 direction cosine matrix
   */
  calculateBodyToNedDCM(eulerAngles: EulerAngles): number[][] {
    const psi = eulerAngles.azimuth_psi.value; // Yaw angle
    const theta = eulerAngles.elevation_theta.value; // Pitch angle
    const phi = eulerAngles.bank_phi.value; // Roll angle

    // Trigonometric functions
    const sinPhi = Math.sin(phi); // sin(φ)
    const cosPhi = Math.cos(phi); // cos(φ)
    const sinTheta = Math.sin(theta); // sin(θ)
    const cosTheta = Math.cos(theta); // cos(θ)
    
    // Aerospace convention: positive yaw = clockwise rotation
    // Mathematical convention: positive angles = counterclockwise rotation
    // So we negate the yaw angle to convert between conventions
    const sinPsi = Math.sin(-psi); // sin(-ψ) for aerospace convention
    const cosPsi = Math.cos(-psi); // cos(-ψ) for aerospace convention

    // 3-2-1 Euler angle sequence DCM (Body to NED)
    let matrix = [
      [
        cosTheta * cosPsi,
        cosTheta * sinPsi,
        -sinTheta,
      ],
      [
        sinPhi * sinTheta * cosPsi - cosPhi * sinPsi,
        sinPhi * sinTheta * sinPsi + cosPhi * cosPsi,
        sinPhi * cosTheta,
      ],
      [
        cosPhi * sinTheta * cosPsi + sinPhi * sinPsi,
        cosPhi * sinTheta * sinPsi - sinPhi * cosPsi,
        cosPhi * cosTheta,
      ],
    ];

    // need to scrub the matrix for any -0 values and set them to 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Object.is(matrix[i][j], -0)) {
          matrix[i][j] = 0;
        }
      }
    }

    return matrix;
  }

  /**
   * Transform a vector from body coordinates to NED coordinates
   *
   * @param bodyVector - Vector in body coordinates [x, y, z]
   * @returns Vector in NED coordinates [north, east, down]
   */
  transformFromBody(bodyVector: BodyVector): NedVector {
    const { x, y, z } = bodyVector;

    // Use the DCM matrix directly for body to NED transformation
    const matrix = this.getMatrix();

    const north = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z;
    const east = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z;
    const down = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z;

    return new NedVector(north, east, down);
  }

  transformToBody(nedVector: NedVector): BodyVector {
    const { north, east, down } = nedVector;

    // we need to transpose the matrix to get the correct transformation
    // this is because the matrix is defined in the body frame, but we want to transform to the NED frame
    // the transpose of the matrix is the inverse of the matrix
    const matrix = this.getTranspose();

    const x = matrix[0][0] * north + matrix[0][1] * east + matrix[0][2] * down;
    const y = matrix[1][0] * north + matrix[1][1] * east + matrix[1][2] * down;
    const z = matrix[2][0] * north + matrix[2][1] * east + matrix[2][2] * down;

    return new BodyVector(x, y, z);
  }

  /**
   * Get the transpose of the DCM (NED to body transformation)
   *
   * @returns The transpose of the Body-to-NED DCM
   */
  getTranspose(): number[][] {
    let matrix = this.getMatrix();

    return [
      [matrix[0][0], matrix[1][0], matrix[2][0]],
      [matrix[0][1], matrix[1][1], matrix[2][1]],
      [matrix[0][2], matrix[1][2], matrix[2][2]],
    ];
  }

  isOrthogonal(tolerance: number = 1e-10): boolean {
    const matrix = this.getMatrix();
    const transpose = this.getTranspose();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let k = 0; k < 3; k++) {
          sum += matrix[i][k] * transpose[k][j];
        }

        const expected = i === j ? 1 : 0;
        if (Math.abs(sum - expected) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  getDeterminant(): number {
    let matrix = this.getMatrix();

    return (
      matrix[0][0] *
        (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] *
        (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
    );
  }
}

export default BodyNedDCM;
