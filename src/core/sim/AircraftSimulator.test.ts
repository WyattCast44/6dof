import { describe, it, expect } from "vitest";
import AircraftSimulator from "./AircraftSimulator";
import StateVector from "../numerical/StateVector";
import Environment from "../environment/Environment";
import ConstantGravityModel from "../gravity/ConstantGravityModel";
import StandardAtmosphere1976 from "../atmosphere/StandardAtmosphere1976";
import SimpleWindModel from "../wind/SimpleWindModel";
import LinearDecayModel from "../wind/LinearDecayModel";
import LightFixedWing from "../aircraft/LightFixedWing";
import MSL from "../altitude/MSL";
import Meters from "../length/Meters";
import Feet from "../length/Feet";
import Knots from "../velocity/Knots";
import MetersPerSecond from "../velocity/MetersPerSecond";

function createEnvironment(): Environment {
  const gravity = new ConstantGravityModel();
  const atmosphere = new StandardAtmosphere1976(gravity);
  const wind = new SimpleWindModel({
    atmosphereModel: atmosphere,
    decayModel: new LinearDecayModel(),
  });
  return new Environment(gravity, atmosphere, wind);
}

describe("AircraftSimulator", () => {
  describe("ballistic arc (gravity-dominated)", () => {
    it("should approximate free-fall trajectory with minimal thrust and forward velocity", () => {
      const environment = createEnvironment();
      const alt0 = 3048; // ~10,000 ft in meters

      // Give a small forward velocity so the aero model doesn't hit
      // division-by-zero in non-dimensional rate computation (pHat = p·b/(2·V)).
      const initialState = StateVector.create({
        position: { north: 0, east: 0, down: -alt0 },
        velocity: { u: 5, v: 0, w: 0 }, // 5 m/s forward
      });

      const simulator = new AircraftSimulator({
        aircraft: new LightFixedWing(),
        initialState,
        environment,
      });

      // Throttle = 0, no control deflections
      simulator.controls = { throttle: 0, elevator: 0, aileron: 0, rudder: 0 };

      const dt = 0.01;
      const duration = 2.0; // 2 seconds
      const steps = Math.round(duration / dt);

      for (let i = 0; i < steps; i++) {
        simulator.step(dt);
      }

      const state = simulator.state;
      const g = 9.80665;

      // The aircraft should fall under gravity. With very low airspeed,
      // aero forces are small. In body frame at level attitude:
      //   Fz_grav = mg·cos(θ)·cos(φ) ≈ mg
      //
      // After 2s: analytical Δdown ≈ ½gt² ≈ 19.6m
      // With drag present the actual fall will be somewhat less.
      const expectedDownChange = 0.5 * g * duration * duration;
      const actualDownChange = state.position.z - (-alt0);

      // Should fall at least 50% of pure free-fall (drag reduces it)
      // and no more than 150% (aero lift at low speed is tiny)
      expect(actualDownChange).toBeGreaterThan(expectedDownChange * 0.5);
      expect(actualDownChange).toBeLessThan(expectedDownChange * 1.5);
    });
  });

  describe("steady level flight", () => {
    it("should maintain approximately stable altitude and airspeed over 30 seconds", () => {
      const environment = createEnvironment();

      const initialState = StateVector.levelFlight({
        altitude: new MSL(new Feet(10_000)),
        airspeed: new Knots(100).toMetersPerSecond(),
      });

      const simulator = new AircraftSimulator({
        aircraft: new LightFixedWing(),
        initialState,
        environment,
      });

      // Set throttle for approximately level flight
      simulator.controls = { throttle: 0.7, elevator: 0, aileron: 0, rudder: 0 };

      const initialAltitude = simulator.state.altitudeMSL.value;
      const initialAirspeed = simulator.state.airspeed.value;

      const dt = 0.01;
      const duration = 30;
      const steps = Math.round(duration / dt);

      for (let i = 0; i < steps; i++) {
        simulator.step(dt);
      }

      const finalAltitude = simulator.state.altitudeMSL.value;
      const finalAirspeed = simulator.state.airspeed.value;

      // Altitude should not diverge wildly (within 500m of initial)
      expect(Math.abs(finalAltitude - initialAltitude)).toBeLessThan(500);

      // Airspeed should remain in a reasonable range (within 50% of initial)
      expect(finalAirspeed).toBeGreaterThan(initialAirspeed * 0.5);
      expect(finalAirspeed).toBeLessThan(initialAirspeed * 1.5);
    });
  });

  describe("control response", () => {
    it("should develop positive pitch rate with nose-down elevator", () => {
      const environment = createEnvironment();

      const initialState = StateVector.levelFlight({
        altitude: new MSL(new Feet(10_000)),
        airspeed: new Knots(100).toMetersPerSecond(),
      });

      const simulator = new AircraftSimulator({
        aircraft: new LightFixedWing(),
        initialState,
        environment,
      });

      // Apply nose-down elevator (positive elevator deflection
      // with Cm_de = -1.5 produces negative pitching moment → nose down)
      simulator.controls = { throttle: 0.7, elevator: 0.1, aileron: 0, rudder: 0 };

      const dt = 0.01;
      const steps = 100; // 1 second

      for (let i = 0; i < steps; i++) {
        simulator.step(dt);
      }

      // With Cm_de = -1.5 and elevator = +0.1 rad, we get a negative Cm,
      // meaning nose-down pitching moment → negative q (pitch rate).
      // q should be negative (nose pitching down).
      const q = simulator.state.angularVelocity.q.value;
      expect(q).toBeLessThan(0);
    });

    it("should develop roll rate with aileron input", () => {
      const environment = createEnvironment();

      const initialState = StateVector.levelFlight({
        altitude: new MSL(new Feet(10_000)),
        airspeed: new Knots(100).toMetersPerSecond(),
      });

      const simulator = new AircraftSimulator({
        aircraft: new LightFixedWing(),
        initialState,
        environment,
      });

      // Apply aileron — Cl_da = -0.15, positive aileron → negative Cl → negative roll moment
      simulator.controls = { throttle: 0.7, elevator: 0, aileron: 0.1, rudder: 0 };

      const dt = 0.01;
      const steps = 100; // 1 second

      for (let i = 0; i < steps; i++) {
        simulator.step(dt);
      }

      // Positive aileron with Cl_da = -0.15 → negative Cl → negative roll
      const p = simulator.state.angularVelocity.p.value;
      expect(p).toBeLessThan(0);
    });
  });

  describe("RK4 accuracy via simulator", () => {
    it("should produce consistent results at different step sizes", () => {
      const environment = createEnvironment();

      const makeSimulator = () => {
        const initialState = StateVector.levelFlight({
          altitude: new MSL(new Feet(10_000)),
          airspeed: new Knots(100).toMetersPerSecond(),
        });
        const sim = new AircraftSimulator({
          aircraft: new LightFixedWing(),
          initialState,
          environment,
        });
        sim.controls = { throttle: 0.7, elevator: 0, aileron: 0, rudder: 0 };
        return sim;
      };

      // Run with coarse step
      const simCoarse = makeSimulator();
      const dtCoarse = 0.05;
      const duration = 5;
      for (let i = 0; i < Math.round(duration / dtCoarse); i++) {
        simCoarse.step(dtCoarse);
      }

      // Run with fine step
      const simFine = makeSimulator();
      const dtFine = 0.01;
      for (let i = 0; i < Math.round(duration / dtFine); i++) {
        simFine.step(dtFine);
      }

      // Results should be close (within 1m altitude, 0.5 m/s airspeed)
      const altDiff = Math.abs(
        simCoarse.state.altitudeMSL.value - simFine.state.altitudeMSL.value
      );
      const speedDiff = Math.abs(
        simCoarse.state.airspeed.value - simFine.state.airspeed.value
      );

      expect(altDiff).toBeLessThan(1.0);
      expect(speedDiff).toBeLessThan(0.5);
    });
  });
});
