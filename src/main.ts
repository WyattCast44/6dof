import Wind from "./core/wind/Wind";
import MSL from "./core/altitude/MSL";
import Feet from "./core/length/Feet";
import Knots from "./core/velocity/Knots";
import Seconds from "./core/time/Seconds";
import Aircraft from "./core/aircraft/Aircraft";
import Integrator from "./core/numerical/Integrator";
import StateVector from "./core/numerical/StateVector";
import Environment from "./core/environment/Environment";
import FlightDynamics from "./core/flight/FlightDynamics";
import SimpleWindModel from "./core/wind/SimpleWindModel";
import LinearDecayModel from "./core/wind/LinearDecayModel";
import type GravityModel from "./core/gravity/GravityModel";
import LightFixedWing from "./core/aircraft/LightFixedWing";
import FixedTimeSimulation from "./core/sim/FixedTimeSimulation";
import type AtmosphereModel from "./core/atmosphere/AtmosphereModel";
import ConstantGravityModel from "./core/gravity/ConstantGravityModel";
import AircraftDynamicsModel from "./core/aircraft/AircraftDynamicsModel";
import StandardAtmosphere1976 from "./core/atmosphere/StandardAtmosphere1976";

// ============================================================================
// 1. BUILD THE ENVIRONMENT
// ============================================================================

let gravityModel: GravityModel = new ConstantGravityModel();
let atmosphereModel: AtmosphereModel = new StandardAtmosphere1976(gravityModel);

let windModel = new SimpleWindModel({
  atmosphereModel: atmosphereModel,
  decayModel: new LinearDecayModel(),
});

const windProfile = [
  {
    altitude: new MSL(new Feet(0)),
    wind: new Wind({ speed: 8, direction: 260 }),
  },
  {
    altitude: new MSL(new Feet(1000)),
    wind: new Wind({ speed: 15, direction: 280 }),
  },
  {
    altitude: new MSL(new Feet(3000)),
    wind: new Wind({ speed: 25, direction: 245 }),
  },
  {
    altitude: new MSL(new Feet(10_000)),
    wind: new Wind({ speed: 55, direction: 85 }),
  },
];

for (const { altitude, wind } of windProfile) {
  windModel.addAltitude(altitude, wind);
}

let environment = new Environment(gravityModel, atmosphereModel, windModel);

/**
 * Create the initial state vector of the aircraft
 */
let stateVector = StateVector.levelFlight({
  altitude: new MSL(new Feet(10_000)),
  airspeed: new Knots(100).toMetersPerSecond(),
});

/**
 * Build the aircraft properties
 */
let vehicleType = new LightFixedWing();

/**
 * Build the dynamics model
 */
let dynamicsModel = new AircraftDynamicsModel(vehicleType, environment);

let aircraft = new Aircraft({
  properties: vehicleType,
  initialState: stateVector,
});

let flightDynamics = new FlightDynamics(aircraft, environment);

/**
 * Create integrator and run simulation
 */
let integrator = new Integrator(dynamicsModel);

/**
 * Create the fixed time simulation
 */
const simulation = new FixedTimeSimulation({
  timeStep: new Seconds(0.1), // 10 Hz
  totalTime: Seconds.fromMinutes(1), // 1 minute
  outputInterval: new Seconds(5), // every 5 seconds
});

export default simulation;
