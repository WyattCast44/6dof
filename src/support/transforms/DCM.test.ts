import { describe, it, expect } from "vitest";
import EulerAngles from "../attitude/EulerAngles";
import Radians from "../angles/Radians";
import BodyNedDCM from "./BodyNedDCM";
import Degrees from "../angles/Degrees";
import BodyVector from "../vectors/BodyVector";
import NedVector from "../vectors/NedVector";

describe("Direction Cosine Matrix (DCM) Transformations", () => {
  describe("BodyToNedDCM", () => {
    it("should transform level flight velocity correctly", () => {
      const levelFlight = new EulerAngles(0, 0, 0);
      const bodyToNed = new BodyNedDCM(levelFlight);

      const bodyVelocity = new BodyVector(50, 0, 0); // 50 m/s forward
      const nedVelocity = bodyToNed.transformFromBody(bodyVelocity);

      expect(nedVelocity.north).toBeCloseTo(50.0, 2); // North
      expect(nedVelocity.east).toBeCloseTo(0.0, 2); // East
      expect(nedVelocity.down).toBeCloseTo(0.0, 2); // Down
    });

    // we should be able to go from ned to body
    it("should be able to go from ned to body", () => {
      const nedVelocity = new NedVector(50, 0, 0);
      const bodyToNed = new BodyNedDCM(new EulerAngles(0, 0, 0));
      const bodyVelocity = bodyToNed.transformToBody(nedVelocity);

      expect(bodyVelocity.x).toBeCloseTo(50.0, 2); // North
      expect(bodyVelocity.y).toBeCloseTo(0.0, 2); // East
      expect(bodyVelocity.z).toBeCloseTo(0.0, 2); // Down

      const nedVelocity2 = new NedVector(0, 50, 0);
      const bodyVelocity2 = bodyToNed.transformToBody(nedVelocity2);

      expect(bodyVelocity2.x).toBeCloseTo(0.0, 2); // North
      expect(bodyVelocity2.y).toBeCloseTo(50.0, 2); // East
      expect(bodyVelocity2.z).toBeCloseTo(0.0, 2); // Down
    })

    it("test case from the video", () => {
      // handle going from body to ned
      let wingTipVector = new BodyVector(0, 1.76, 0.12);
  
      let eulerAngles = new EulerAngles(
        new Degrees(45).toRadians(),
        new Degrees(0).toRadians(),
        new Degrees(0).toRadians()
      );
  
      let dcm = new BodyNedDCM(eulerAngles);
  
      let transformedVector = dcm.transformFromBody(wingTipVector);
  
      expect(transformedVector.north).toBeCloseTo(-1.244, 2); // north
      expect(transformedVector.east).toBeCloseTo(1.244, 2); // east
      expect(transformedVector.down).toBeCloseTo(0.12, 2); // down

      // now go from ned to body
      let wingTipVector2 = new NedVector(-1.244, 1.244, 0.12);
      let transformedVector2 = dcm.transformToBody(wingTipVector2);

      expect(transformedVector2.x).toBeCloseTo(0.0, 2); // North
      expect(transformedVector2.y).toBeCloseTo(1.76, 2); // East
      expect(transformedVector2.z).toBeCloseTo(0.12, 2); // Down
    });

    it("should transform pitch up velocity correctly", () => {
      const pitchUp = new EulerAngles(0, new Degrees(10).toRadians(), 0);
      const bodyToNed = new BodyNedDCM(pitchUp);

      const bodyVelocity = new BodyVector(50, 0, 0);
      const nedVelocity = bodyToNed.transformFromBody(bodyVelocity);

      expect(nedVelocity.north).toBeCloseTo(49.24, 2); // North
      expect(nedVelocity.east).toBeCloseTo(0.0, 2); // East
      expect(nedVelocity.down).toBeCloseTo(8.68, 2); // Down (negative = up)
    });

    it("should transform roll velocity correctly", () => {
      const roll = new EulerAngles(0, 0, new Degrees(15).toRadians());
      const bodyToNed = new BodyNedDCM(roll);

      const bodyVelocity = new BodyVector(50, 0, 0);
      const nedVelocity = bodyToNed.transformFromBody(bodyVelocity);

      // For pure roll, forward velocity should remain unchanged in North direction
      expect(nedVelocity.north).toBeCloseTo(50.0, 2); // North
      expect(nedVelocity.east).toBeCloseTo(0.0, 2); // East
      expect(nedVelocity.down).toBeCloseTo(0.0, 2); // Down
    });
  });

  describe("DCM Properties", () => {
    it("should have orthogonal matrices", () => {
      const testCases = [
        new EulerAngles(0, 0, 0), // Level flight
        new EulerAngles(new Radians((15 * Math.PI) / 180), 0, 0), // Roll
        new EulerAngles(0, new Radians((10 * Math.PI) / 180), 0), // Pitch
        new EulerAngles(0, 0, new Radians((45 * Math.PI) / 180)), // Yaw
        new EulerAngles(
          new Radians((10 * Math.PI) / 180),
          new Radians((5 * Math.PI) / 180),
          new Radians((20 * Math.PI) / 180)
        ), // Combined rotation
      ];

      testCases.forEach((angles, index) => {
        const bodyToNed = new BodyNedDCM(angles);

        expect(
          bodyToNed.isOrthogonal(),
          `BodyToNed DCM ${index} should be orthogonal`
        ).toBe(true);
      });
    });

    it("should have determinant of 1", () => {
      const testCases = [
        new EulerAngles(0, 0, 0), // Level flight
        new EulerAngles(new Radians((15 * Math.PI) / 180), 0, 0), // Roll
        new EulerAngles(0, new Radians((10 * Math.PI) / 180), 0), // Pitch
        new EulerAngles(0, 0, new Radians((45 * Math.PI) / 180)), // Yaw
        new EulerAngles(
          new Radians((10 * Math.PI) / 180),
          new Radians((5 * Math.PI) / 180),
          new Radians((20 * Math.PI) / 180)
        ), // Combined rotation
      ];

      testCases.forEach((angles, index) => {
        const bodyToNed = new BodyNedDCM(angles);

        expect(
          bodyToNed.getDeterminant(),
          `BodyToNed DCM ${index} determinant`
        ).toBeCloseTo(1.0, 6);
      });
    });

    it("shoul/* d have transpose as inverse", () => {
      const angles = new EulerAngles(
        new Degrees(10).toRadians(),
        new Degrees(5).toRadians(),
        new Degrees(20).toRadians()
      );

      const bodyToNed = new BodyNedDCM(angles);

      // BodyToNed transpose should equal NedToBody matrix
      const matrix = bodyToNed.getMatrix();
      const transpose = bodyToNed.getTranspose();

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(transpose[i][j]).toBeCloseTo(matrix[j][i], 6);
        }
      }
    });
  });

  describe("Inverse Transformations", () => {
    it("should handle edge cases correctly", () => {
      const angles = new EulerAngles(0, 0, 0);
      const bodyToNed = new BodyNedDCM(angles);

      // Zero vector
      const zeroVector = new BodyVector(0, 0, 0);
      const transformedZero = bodyToNed.transformFromBody(zeroVector);
      const inverseZero = bodyToNed.transformToBody(transformedZero);

      expect(inverseZero.x).toBeCloseTo(0, 6);
      expect(inverseZero.y).toBeCloseTo(0, 6);
      expect(inverseZero.z).toBeCloseTo(0, 6);

      // Very large values
      const largeVector = new BodyVector(1e6, 1e6, 1e6);
      const transformedLarge = bodyToNed.transformFromBody(largeVector);
      const inverseLarge = bodyToNed.transformToBody(transformedLarge);

      expect(inverseLarge.x).toBeCloseTo(largeVector.x, 6);
      expect(inverseLarge.y).toBeCloseTo(largeVector.y, 6);
      expect(inverseLarge.z).toBeCloseTo(largeVector.z, 6);

      // Very small values
      const smallVector = new BodyVector(1e-6, 1e-6, 1e-6);
      const transformedSmall = bodyToNed.transformFromBody(smallVector);
      const inverseSmall = bodyToNed.transformToBody(transformedSmall);

      expect(inverseSmall.x).toBeCloseTo(smallVector.x, 6);
      expect(inverseSmall.y).toBeCloseTo(smallVector.y, 6);
      expect(inverseSmall.z).toBeCloseTo(smallVector.z, 6);
    });
  });

  describe("Matrix Operations", () => {
    it("should return correct matrix structure", () => {
      const angles = new EulerAngles(0, 0, 0);
      const bodyToNed = new BodyNedDCM(angles);

      const bodyToNedMatrix = bodyToNed.getMatrix();

      // Check matrix dimensions
      expect(bodyToNedMatrix).toHaveLength(3);

      bodyToNedMatrix.forEach((row) => {
        expect(row).toHaveLength(3);
      });

      // Check identity matrix for level flight
      expect(bodyToNedMatrix[0]).toEqual([1, 0, 0]);
      expect(bodyToNedMatrix[1]).toEqual([0, 1, 0]);
      expect(bodyToNedMatrix[2]).toEqual([0, 0, 1]);
    });

    it("should return copy of matrix, not reference", () => {
      const angles = new EulerAngles(0, 0, 0);
      const bodyToNed = new BodyNedDCM(angles);

      const matrix1 = bodyToNed.getMatrix();
      const matrix2 = bodyToNed.getMatrix();

      // Modify one matrix
      matrix1[0][0] = 999;

      // Other matrix should be unchanged
      expect(matrix2[0][0]).toBe(1);
    });
  });
});
