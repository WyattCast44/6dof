import EulerAngles from "../attitude/EulerAngles";
import Radians from "../angles/Radians";
import BodyToNedDCM from "./BodyToNedDCM";
import NedToBodyDCM from "./NedToBodyDCM";

/**
 * Simple test to verify DCM transformations work correctly
 */
function testDCMTransformations() {
  console.log("=== DCM Transformation Tests ===");

  // Test 1: Level flight (no rotation)
  console.log("\n1. Testing level flight (no rotation):");
  const levelFlight = new EulerAngles(0, 0, 0);
  const bodyToNed = new BodyToNedDCM(levelFlight);
  const nedToBody = new NedToBodyDCM(levelFlight);

  // Test velocity transformation
  const bodyVelocity: [number, number, number] = [50, 0, 0]; // 50 m/s forward
  const nedVelocity = bodyToNed.transform(bodyVelocity);
  console.log(`Body velocity [${bodyVelocity}]:`);
  console.log(`  NED velocity: [${nedVelocity.map(v => v.toFixed(2))}]`);
  console.log(`  Expected: [50.00, 0.00, 0.00]`);

  // Test gravity transformation
  const gravityBody = nedToBody.transformGravity(9.81);
  console.log(`Gravity in body frame: [${gravityBody.map(g => g.toFixed(2))}]`);
  console.log(`Expected: [0.00, 0.00, 9.81]`);

  // Test 2: Pitch up (10 degrees)
  console.log("\n2. Testing pitch up (10°):");
  const pitchUp = new EulerAngles(0, new Radians(10 * Math.PI / 180), 0);
  const bodyToNedPitch = new BodyToNedDCM(pitchUp);
  const nedToBodyPitch = new NedToBodyDCM(pitchUp);

  const nedVelocityPitch = bodyToNedPitch.transform(bodyVelocity);
  console.log(`Body velocity [${bodyVelocity}]:`);
  console.log(`  NED velocity: [${nedVelocityPitch.map(v => v.toFixed(2))}]`);
  console.log(`  Expected: [49.24, 0.00, -8.68]`);

  const gravityBodyPitch = nedToBodyPitch.transformGravity(9.81);
  console.log(`Gravity in body frame: [${gravityBodyPitch.map(g => g.toFixed(2))}]`);
  console.log(`Expected: [1.70, 0.00, 9.66]`);

  // Test 3: Roll (15 degrees)
  console.log("\n3. Testing roll (15°):");
  const roll = new EulerAngles(new Radians(15 * Math.PI / 180), 0, 0);
  const bodyToNedRoll = new BodyToNedDCM(roll);
  const nedToBodyRoll = new NedToBodyDCM(roll);

  const gravityBodyRoll = nedToBodyRoll.transformGravity(9.81);
  console.log(`Gravity in body frame: [${gravityBodyRoll.map(g => g.toFixed(2))}]`);
  console.log(`Expected: [0.00, 2.54, 9.48]`);

  // Test 4: Verify orthogonality
  console.log("\n4. Testing DCM orthogonality:");
  console.log(`Level flight DCM orthogonal: ${bodyToNed.isOrthogonal()}`);
  console.log(`Pitch up DCM orthogonal: ${bodyToNedPitch.isOrthogonal()}`);
  console.log(`Roll DCM orthogonal: ${bodyToNedRoll.isOrthogonal()}`);

  // Test 5: Verify determinant = 1
  console.log("\n5. Testing DCM determinant:");
  console.log(`Level flight determinant: ${bodyToNed.getDeterminant().toFixed(6)}`);
  console.log(`Pitch up determinant: ${bodyToNedPitch.getDeterminant().toFixed(6)}`);
  console.log(`Roll determinant: ${bodyToNedRoll.getDeterminant().toFixed(6)}`);

  // Test 6: Verify inverse transformation
  console.log("\n6. Testing inverse transformation:");
  const originalVector: [number, number, number] = [10, 5, -3];
  const transformed = bodyToNedPitch.transform(originalVector);
  const inverseTransformed = nedToBodyPitch.transform(transformed);
  console.log(`Original: [${originalVector}]`);
  console.log(`Transformed: [${transformed.map(v => v.toFixed(2))}]`);
  console.log(`Inverse: [${inverseTransformed.map(v => v.toFixed(2))}]`);
  console.log(`Error: [${originalVector.map((v, i) => Math.abs(v - inverseTransformed[i]).toFixed(6))}]`);

  console.log("\n=== DCM Tests Complete ===");
}

export { testDCMTransformations }; 