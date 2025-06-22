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
let aircraftDynamicsModel = new AircraftDynamicsModel(aircraft, environment);

/**
 * Create initial aircraft state (level flight at 1000m altitude)
 */
let initialState = new StateVector();
initialState.x_n_m = 0;           // North position
initialState.y_n_m = 0;           // East position  
initialState.z_n_m = -1000;       // Down position (negative for altitude)
initialState.u_b_mps = 50;        // Forward velocity (50 m/s ≈ 97 knots)
initialState.v_b_mps = 0;         // Lateral velocity
initialState.w_b_mps = 0;         // Vertical velocity
initialState.phi_rad = 0;         // Roll angle (level flight)
initialState.theta_rad = 0;       // Pitch angle (level flight)
initialState.psi_rad = 0;         // Yaw angle (heading North)
initialState.p_b_radps = -0.0174533;       // Roll rate 1 degree per second
initialState.q_b_radps = 0;       // Pitch rate
initialState.r_b_radps = 0;       // Yaw rate

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
let currentState = initialState;
let currentTime = 0;

while (currentTime <= simulationTime) {
  // Output state at specified intervals

  let shouldOutput = Math.abs(currentTime % outputInterval) < timeStep;

  if (shouldOutput) {
    console.log(`Time: ${currentTime.toFixed(1)}s`);
    console.log(`Position: N=${currentState.x_n_m.toFixed(0)}m, E=${currentState.y_n_m.toFixed(0)}m, Alt=${(-currentState.z_n_m).toFixed(0)}m`);
    console.log(`Velocity: u=${currentState.u_b_mps.toFixed(1)}m/s, v=${currentState.v_b_mps.toFixed(1)}m/s, w=${currentState.w_b_mps.toFixed(1)}m/s`);
    console.log(`Attitude: φ=${(currentState.phi_rad * 180 / Math.PI).toFixed(1)}°, θ=${(currentState.theta_rad * 180 / Math.PI).toFixed(1)}°, ψ=${(currentState.psi_rad * 180 / Math.PI).toFixed(1)}°`);
    console.log(`Angular Rates: p=${(currentState.p_b_radps * 180 / Math.PI).toFixed(1)}°/s, q=${(currentState.q_b_radps * 180 / Math.PI).toFixed(1)}°/s, r=${(currentState.r_b_radps * 180 / Math.PI).toFixed(1)}°/s`);
    console.log("---");
  }
  
  // Integrate to next time step
  if (currentTime < simulationTime) {
    currentState = integrator.integrate(currentState, currentTime, timeStep);
  }
  
  currentTime += timeStep;
}

console.log("Simulation complete!");
