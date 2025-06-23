import Environment from "./support/enviroment/Enviroment";
import ConstantGravityModel from "./support/gravity/ConstantGravityModel";
import StandardAtmosphere1976 from "./support/atmosphere/StandardAtmosphere1976";
import WindModel from "./support/wind/WindModel";
import Wind from "./support/wind/Wind";
import CardinalDegree from "./support/angles/CardinalDegree";
import Knots from "./support/velocity/Knots";
import AircraftDynamicsModel from "./support/aircraft/AircraftDynamicsModel";
import Integrator from "./support/numerical/Integrator";
import StateVector from "./support/numerical/StateVector";
import LightFixedWing from "./support/aircraft/LightFixedWing";
import MetersPerSecond from "./support/velocity/MetersPerSecond";
import Meters from "./support/length/Meters";
import EulerAngles from "./support/attitude/EulerAngles";
import RotationalVelocities from "./support/attitude/RotationalVelocities";
import MSL from "./support/altitude/MSL";
import Feet from "./support/length/Feet";
import PositionVector from "./support/vectors/PositionVector";
import VelocityVector from "./support/vectors/VelocityVector";
import Simulation from "./support/sim/Simulation";

/**
 * Build the wind model
 */
let windModel = new WindModel();
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
  new PositionVector(new Meters(0), new Meters(0), new Meters(-1000)), // start at 0, 0, 1000 m above sea level
  new VelocityVector(new MetersPerSecond(50), new MetersPerSecond(0), new MetersPerSecond(0)), // start at 50 m/s forward, 0 lateral and vertical velocity
  new EulerAngles(0, 0, 0), // start at 0, 0, 0 euler angles
  new RotationalVelocities(0, 0, 0) // start at 0, 0, 0 rotational velocities
);

let aircraftDynamicsModel = new AircraftDynamicsModel(aircraft, environment);

/**
 * Create integrator and run simulation
 */
let integrator = new Integrator(aircraftDynamicsModel);

let simulation = new Simulation({
  timeStep: 1,
  totalTime: 10,
  outputInterval: 1,
  initialState: initialAircraftState,
  integrator,
});

simulation.run();