import Wind from "./core/wind/Wind";
import MSL from "./core/altitude/MSL";
import Feet from "./core/length/Feet";
import Knots from "./core/velocity/Knots";
import Meters from "./core/length/Meters";
import Seconds from "./core/time/Seconds";
import WindModel from "./core/wind/WindModel";
import Simulation from "./core/sim/Simulation";
import Integrator from "./core/numerical/Integrator";
import Environment from "./core/enviroment/Enviroment";
import StateVector from "./core/numerical/StateVector";
import CardinalDegree from "./core/angles/CardinalDegree";
import LightFixedWing from "./core/aircraft/LightFixedWing";
import MetersPerSecond from "./core/velocity/MetersPerSecond";
import ConstantGravityModel from "./core/gravity/ConstantGravityModel";
import AircraftDynamicsModel from "./core/aircraft/AircraftDynamicsModel";
import StandardAtmosphere1976 from "./core/atmosphere/StandardAtmosphere1976";
import Aircraft from "./core/aircraft/Aircraft";
import SimpleWindModel from "./core/wind/SimpleWindModel";
import LinearDecayModel from "./core/wind/LinearDecayModel";

/**
 * Build the wind model
 */
let windModel = new SimpleWindModel(new LinearDecayModel());

windModel.addAltitude(
  new MSL(new Feet(0)),
  new Wind({ speed: new Knots(8), direction: new CardinalDegree(260) })
);

windModel.addAltitude(
  new MSL(new Feet(1000)),
  new Wind({ speed: new Knots(15), direction: new CardinalDegree(280) })
);
windModel.addAltitude(
  new MSL(new Feet(3000)),
  new Wind({ speed: new Knots(25), direction: new CardinalDegree(245) })
);
windModel.addAltitude(
  new MSL(new Feet(10_000)),
  new Wind({ speed: new Knots(55), direction: new CardinalDegree(85) })
);

/**
 * Build the environment
 */
let gravityModel = new ConstantGravityModel();
let atmosphereModel = new StandardAtmosphere1976(gravityModel);
let environment = new Environment(gravityModel, atmosphereModel, windModel);

/**
 * Build the aircraft and dynamics model
 */
let vehicleType = new LightFixedWing();

/**
 * Build the dynamics model
 */
let dynamicsModel = new AircraftDynamicsModel(vehicleType, environment);

/**
 * Create the initial state of the aircraft
 */
let initialAircraftState = StateVector.wingsLevelFlight({
  altitude: new MSL(new Meters(1000)),
  forwardSpeed: new MetersPerSecond(50),
});

let aircraftDynamicsModel = new AircraftDynamicsModel(vehicleType, environment);

let aircraft = new Aircraft({
  properties: vehicleType,
  dynamicsModel: aircraftDynamicsModel,
  initialState: initialAircraftState
});

console.log(aircraft);

/**
 * Create integrator and run simulation
 */
let integrator = new Integrator(aircraftDynamicsModel);

let simulation = new Simulation({
  timeStep: new Seconds(1),
  totalTime: new Seconds(10),
  outputInterval: new Seconds(1),
  initialState: initialAircraftState,
  integrator,
});

//window.simulation = simulation;

console.log('Simulation ready to start...');

simulation.run();

export default simulation;