import Environment from "./support/enviroment/Enviroment";
import ConstantGravityModel from "./support/gravity/ConstantGravityModel";
import StandardAtmosphere1976 from "./support/atmosphere/StandardAtmosphere1976";
import WindModel from "./support/wind/WindModel";
import Wind from "./support/wind/Wind";
import CardinalDegree from "./support/angles/CardinalDegree";
import Feet from "./support/length/Feet";
import Knots from "./support/velocity/Knots";
import AircraftDynamicsModel from "./support/aircraft/AircraftDynamicsModel";
import Integrator from "./support/numerical/Integrator";
import StateVector from "./support/numerical/StateVector";
import LightFixedWing from "./support/aircraft/LightFixedWing";
import MetersPerSecond from "./support/velocity/MetersPerSecond";
import Meters from "./support/length/Meters";
import EulerAngles from "./support/attitude/EulerAngles";
import RotationalVelocities from "./support/attitude/RotationalVelocities";
import { testDCMTransformations } from "./support/transforms/DCMTest";

/**
 * Test DCM transformations
 */
console.log("Testing DCM transformations...");
testDCMTransformations();
console.log("");

/**
 * Build the wind model
 */
let windModel = new WindModel();
windModel.addAltitude(new Feet(0), new Wind(new Knots(8), new CardinalDegree(260)));
windModel.addAltitude(new Feet(1000), new Wind(new Knots(15), new CardinalDegree(280)));
windModel.addAltitude(new Feet(3000), new Wind(new Knots(25), new CardinalDegree(245)));

/**
 * Build the environment
 */
let gravityModel = new ConstantGravityModel();
let atmosphereModel = new StandardAtmosphere1976(gravityModel);
let environment = new Environment(gravityModel, atmosphereModel, windModel);

/**
 * Build the aircraft and dynamics model
 */
let aircraft = new LightFixedWing();
let initialAircraftState = new StateVector(
  new Meters(0), // North position
  new Meters(0), // East position
  new Meters(-1000), // Down position
  new MetersPerSecond(50), // Forward velocity
  new MetersPerSecond(0), // Lateral velocity
  new MetersPerSecond(0), // Vertical velocity
  new EulerAngles(0, 0, 0), // Euler angles
  new RotationalVelocities(0, 0, 0) // Rotational velocities
);
let aircraftDynamicsModel = new AircraftDynamicsModel(aircraft, environment);

/**
 * Create integrator and run simulation
 */
let integrator = new Integrator(aircraftDynamicsModel);

// Simulation parameters
const timeStep = 0.1;        // 100ms time step
const simulationTime = 10;   // 10 seconds
const outputInterval = 1;    // Output every 1 second

console.log("=== 6DOF Aircraft Simulation ===");
console.log("");

// Run simulation
let currentState = initialAircraftState;
let currentTime = 0;

while (currentTime <= simulationTime) {
  // Output state at specified intervals

  let shouldOutput = Math.abs(currentTime % outputInterval) < timeStep;

  if (shouldOutput) {
    console.log(`Time: ${currentTime.toFixed(1)}s`);
    console.log(`Position: N=${currentState.x_n_m.value.toFixed(0)}m, E=${currentState.y_n_m.value.toFixed(0)}m, Alt=${(-currentState.z_n_m.value).toFixed(0)}m`);
    console.log(`Velocity: u=${currentState.u_b_mps.value.toFixed(1)}m/s, v=${currentState.v_b_mps.value.toFixed(1)}m/s, w=${currentState.w_b_mps.value.toFixed(1)}m/s`);
    console.log(`Attitude: φ=${(currentState.angles.bank_phi.value * 180 / Math.PI).toFixed(1)}°, θ=${(currentState.angles.elevation_theta.value * 180 / Math.PI).toFixed(1)}°, ψ=${(currentState.angles.azimuth_psi.value * 180 / Math.PI).toFixed(1)}°`);
    console.log(`Angular Rates: p=${(currentState.rates.roll_p.value * 180 / Math.PI).toFixed(1)}°/s, q=${(currentState.rates.pitch_q.value * 180 / Math.PI).toFixed(1)}°/s, r=${(currentState.rates.yaw_r.value * 180 / Math.PI).toFixed(1)}°/s`);
    console.log("---");
  }
  
  // Integrate to next time step
  if (currentTime < simulationTime) {
    currentState = integrator.integrate(currentState, currentTime, timeStep);
  }
  
  currentTime += timeStep;
}

console.log("Simulation complete!");
