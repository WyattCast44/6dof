import Environment from "./support/enviroment/Enviroment";
import ConstantGravityModel from "./support/gravity/ConstantGravityModel";
import StandardAtmosphere1976 from "./support/atmosphere/StandardAtmosphere1976";
import WindModel from "./support/wind/WindModel";

let windModel = new WindModel();
let gravityModel = new ConstantGravityModel();
let atmosphereModel = new StandardAtmosphere1976(gravityModel);

let environment = new Environment(gravityModel, atmosphereModel, windModel);

console.log(environment);

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
 * 
 * 
 */