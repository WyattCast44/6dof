import Wind from "./core/wind/Wind";
import MSL from "./core/altitude/MSL";
import Feet from "./core/length/Feet";
import Knots from "./core/velocity/Knots";
import Seconds from "./core/time/Seconds";
import StateVector from "./core/numerical/StateVector";
import Environment from "./core/environment/Environment";
import SimpleWindModel from "./core/wind/SimpleWindModel";
import LinearDecayModel from "./core/wind/LinearDecayModel";
import type GravityModel from "./core/gravity/GravityModel";
import LightFixedWing from "./core/aircraft/LightFixedWing";
import FixedTimeSimulation from "./core/sim/FixedTimeSimulation";
import type AtmosphereModel from "./core/atmosphere/AtmosphereModel";
import ConstantGravityModel from "./core/gravity/ConstantGravityModel";
import StandardAtmosphere1976 from "./core/atmosphere/StandardAtmosphere1976";
import AircraftSimulator from "./core/sim/AircraftSimulator";

// ============================================================================
// 1. BUILD THE ENVIRONMENT
// ============================================================================

const gravityModel: GravityModel = new ConstantGravityModel();
const atmosphereModel: AtmosphereModel = new StandardAtmosphere1976(gravityModel);

const windModel = new SimpleWindModel({
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

const environment = new Environment(gravityModel, atmosphereModel, windModel);

// ============================================================================
// 2. BUILD THE AIRCRAFT SIMULATOR
// ============================================================================

const initialState = StateVector.levelFlight({
  altitude: new MSL(new Feet(10_000)),
  airspeed: new Knots(100).toMetersPerSecond(),
});

const simulator = new AircraftSimulator({
  aircraft: new LightFixedWing(),
  initialState,
  environment,
});

// Set throttle for approximately level flight (~70%)
simulator.controls = { throttle: 0.7, elevator: 0, aileron: 0, rudder: 0 };

// ============================================================================
// 3. CREATE AND WIRE THE SIMULATION LOOP
// ============================================================================

const simulation = new FixedTimeSimulation({
  timeStep: new Seconds(0.01),       // 100 Hz integration
  totalTime: Seconds.fromMinutes(1), // 1 minute
  outputInterval: new Seconds(5),    // print every 5 seconds
});

simulation.registerCallback("update", (_time, dt) => simulator.step(dt));
simulation.registerCallback("afterOutput", () => {
  console.log(simulator.getFlightSummary());
});

export { simulator };
export default simulation;
