/**
 * The 6-dof equations of motion include: 
 * 
 * - 3 translational equations of motion
 * - 3 rotational equations of motion
 * 
 * These are vector equations
 * 
 * The state vector v has elements:
 * u = 
 * v = 
 * w = 
 * 
 * The angular velocity vector w has elements:
 * p = 
 * q = 
 * r = 
 * 
 * External forces vector F has elements:
 * X = 
 * Y = 
 * Z = 
 * 
 * DCM = Direction Cosine Matrix
 * 
 * Euler angles:
 * - phi = roll angle
 * - theta = pitch angle
 * - psi = yaw angle
 * 
 * Gravity acts in the positive down direction in NED frame
 * 
 * Conventions for naming variables:
 * - identifiable
 * - coordinate system
 * - units
 * 
 * For example: u_b_mps = velocity in body frame in meters per second
 * 
 * u = x_b component of aircraft translational velocity relative to the surrounding air
 * v = y_b component of aircraft translational velocity relative to the surrounding air
 * w = z_b component of aircraft translational velocity relative to the surrounding air
 * 
 * p = x_b component of aircraft angular velocity relative to the surrounding air (rolling rate)
 * q = y_b component of aircraft angular velocity relative to the surrounding air (pitching rate)
 * r = z_b component of aircraft angular velocity relative to the surrounding air (yawing rate)
 * 
 * f_xb = x_b component of total pseudo aerodynamic force vector, including thrust
 * f_yb = y_b component of total pseudo aerodynamic force vector, including thrust
 * f_zb = z_b component of total pseudo aerodynamic force vector, including thrust
 * 
 * m_xb = x_b component of total moment pseudo aerodynamic moment vector, including thrust
 * m_yb = y_b component of total moment pseudo aerodynamic moment vector, including thrust
 * m_zb = z_b component of total moment pseudo aerodynamic moment vector, including thrust
 * 
 * X = x_b component of aerodynamic force, excluding thrust (axial force)
 * Y = y_b component of aerodynamic force, excluding thrust (side force)
 * Z = z_b component of aerodynamic force, excluding thrust (normal force)
 * 
 * l = x_b component of aerodynamic moment, excluding thrust (rolling moment)
 * m = y_b component of aerodynamic moment, excluding thrust (pitching moment)
 * n = z_b component of aerodynamic moment, excluding thrust (yawing moment)
 * 
 * 
 * The euler angle forumations (system of 12 first order differential equations) can be numerically integrated to yield the following as functions of time:
 * - position vector
 * - euler angles
 * - translational velocities
 * - rotational velocities
 * 
 * Notes these are non-linear differential equations.
 * 
 */

import EulerAngles from "./support/attitude/EulerAngles";
import BodyNedDCM from "./support/transforms/BodyNedDCM";
import BodyVector from "./support/vectors/BodyVector";
import Radians from "./support/angles/Radians";

console.log("Testing DCM with zero Euler angles...");

// Test DCM with zero Euler angles
const zeroAngles = new EulerAngles(
  new Radians(0), // phi (roll)
  new Radians(0), // theta (pitch) 
  new Radians(0)  // psi (yaw)
);

const dcm = new BodyNedDCM(zeroAngles);

console.log("DCM Matrix with zero angles:");
const matrix = dcm.getMatrix();
console.log(matrix);

// Test velocity transformation
const bodyVelocity = new BodyVector(50, 0, 0); // 50 m/s forward
const nedVelocity = dcm.transformFromBody(bodyVelocity);

console.log("\nBody velocity:", { x: bodyVelocity.x, y: bodyVelocity.y, z: bodyVelocity.z });
console.log("NED velocity:", { north: nedVelocity.north, east: nedVelocity.east, down: nedVelocity.down });

// Test the reverse transformation
const backToBody = dcm.transformToBody(nedVelocity);
console.log("Back to body:", { x: backToBody.x, y: backToBody.y, z: backToBody.z });

console.log("\nTest complete!");