import { describe, it, expect } from "vitest";
import PositionVector from "../vectors/PositionVector";
import VelocityVector from "../vectors/VelocityVector";
import EulerAngles from "../attitude/EulerAngles";
import AngularVelocity from "../attitude/AngularVelocity";
import StateVector from "./StateVector";
import Meters from "../length/Meters";
import MetersPerSecond from "../velocity/MetersPerSecond";
import Radians from "../angles/Radians";
import RadiansPerSecond from "../rates/RadiansPerSecond";
import MSL from "../altitude/MSL";

describe("PositionVector", () => {
  describe("construction", () => {
    it("should create from Meters objects", () => {
      const pos = new PositionVector(
        new Meters(100),
        new Meters(200),
        new Meters(-1000)
      );
      expect(pos.north.value).toBe(100);
      expect(pos.east.value).toBe(200);
      expect(pos.down.value).toBe(-1000);
    });

    it("should create from raw meter values", () => {
      const pos = PositionVector.fromMeters(100, 200, -1000);
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
      expect(pos.z).toBe(-1000);
    });

    it("should create from mixed object", () => {
      const pos = PositionVector.from({
        north: 100,
        east: new Meters(200),
        down: -1000,
      });
      expect(pos.north.value).toBe(100);
      expect(pos.east.value).toBe(200);
      expect(pos.down.value).toBe(-1000);
    });

    it("should create at altitude", () => {
      const pos = PositionVector.atAltitude(1000, 500, 200);
      expect(pos.north.value).toBe(500);
      expect(pos.east.value).toBe(200);
      expect(pos.down.value).toBe(-1000); // Altitude inverted to NED down
    });

    it("should throw on non-finite values", () => {
      expect(() => PositionVector.fromMeters(NaN, 0, 0)).toThrow(RangeError);
      expect(() => PositionVector.fromMeters(0, Infinity, 0)).toThrow(
        RangeError
      );
    });
  });

  describe("NED coordinate convention", () => {
    it("should use positive down for below sea level", () => {
      const belowSea = PositionVector.fromMeters(0, 0, 100);
      expect(belowSea.altitudeMSL.value).toBe(-100);
    });

    it("should use negative down for above sea level", () => {
      const aboveSea = PositionVector.atAltitude(5000);
      expect(aboveSea.down.value).toBe(-5000);
      expect(aboveSea.altitudeMSL.value).toBe(5000);
    });
  });

  describe("operations", () => {
    it("should add vectors", () => {
      const a = PositionVector.fromMeters(100, 200, 300);
      const b = PositionVector.fromMeters(10, 20, 30);
      const result = a.add(b);
      expect(result.x).toBe(110);
      expect(result.y).toBe(220);
      expect(result.z).toBe(330);
    });

    it("should subtract vectors", () => {
      const a = PositionVector.fromMeters(100, 200, 300);
      const b = PositionVector.fromMeters(10, 20, 30);
      const result = a.subtract(b);
      expect(result.x).toBe(90);
      expect(result.y).toBe(180);
      expect(result.z).toBe(270);
    });

    it("should scale vectors", () => {
      const pos = PositionVector.fromMeters(100, 200, 300);
      const result = pos.scale(2);
      expect(result.x).toBe(200);
      expect(result.y).toBe(400);
      expect(result.z).toBe(600);
    });

    it("should calculate distance", () => {
      const a = PositionVector.fromMeters(0, 0, 0);
      const b = PositionVector.fromMeters(3, 4, 0);
      expect(a.distanceTo(b).value).toBe(5);
    });

    it("should clone correctly", () => {
      const original = PositionVector.fromMeters(100, 200, 300);
      const cloned = original.clone();
      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original);
    });
  });
});

describe("VelocityVector", () => {
  describe("construction", () => {
    it("should create from MetersPerSecond objects", () => {
      const vel = new VelocityVector(
        new MetersPerSecond(50),
        new MetersPerSecond(0),
        new MetersPerSecond(2)
      );
      expect(vel.u.value).toBe(50);
      expect(vel.v.value).toBe(0);
      expect(vel.w.value).toBe(2);
    });

    it("should create from components", () => {
      const vel = VelocityVector.fromComponents(50, 5, 2);
      expect(vel.x).toBe(50);
      expect(vel.y).toBe(5);
      expect(vel.z).toBe(2);
    });

    it("should create forward velocity", () => {
      const vel = VelocityVector.forward(100);
      expect(vel.u.value).toBe(100);
      expect(vel.v.value).toBe(0);
      expect(vel.w.value).toBe(0);
    });
  });

  describe("body-frame convention", () => {
    it("should have u as forward velocity", () => {
      const vel = VelocityVector.fromComponents(50, 0, 0);
      expect(vel.forward.value).toBe(50);
    });

    it("should have v as right/lateral velocity", () => {
      const vel = VelocityVector.fromComponents(0, 10, 0);
      expect(vel.right.value).toBe(10);
    });

    it("should have w as down velocity", () => {
      const vel = VelocityVector.fromComponents(0, 0, 5);
      expect(vel.down.value).toBe(5);
    });
  });

  describe("aerodynamic angles", () => {
    it("should calculate angle of attack", () => {
      const vel = VelocityVector.fromComponents(100, 0, 10);
      const alpha = vel.angleOfAttack;
      expect(alpha).toBeCloseTo(Math.atan2(10, 100), 10);
    });

    it("should calculate sideslip angle", () => {
      const vel = VelocityVector.fromComponents(100, 5, 0);
      const beta = vel.sideslipAngle;
      expect(beta).toBeCloseTo(Math.atan2(5, 100), 10);
    });

    it("should calculate airspeed magnitude", () => {
      const vel = VelocityVector.fromComponents(30, 40, 0);
      expect(vel.airspeed.value).toBe(50);
    });
  });

  describe("operations", () => {
    it("should add velocities", () => {
      const a = VelocityVector.fromComponents(50, 10, 5);
      const b = VelocityVector.fromComponents(10, 5, 2);
      const result = a.add(b);
      expect(result.x).toBe(60);
      expect(result.y).toBe(15);
      expect(result.z).toBe(7);
    });

    it("should scale velocities", () => {
      const vel = VelocityVector.fromComponents(50, 10, 5);
      const result = vel.scale(0.5);
      expect(result.x).toBe(25);
      expect(result.y).toBe(5);
      expect(result.z).toBe(2.5);
    });
  });
});

describe("EulerAngles", () => {
  describe("construction", () => {
    it("should create from Radians objects", () => {
      const angles = new EulerAngles(
        new Radians(0.1),
        new Radians(0.2),
        new Radians(0.3)
      );
      expect(angles.phi.value).toBe(0.1);
      expect(angles.theta.value).toBe(0.2);
      expect(angles.psi.value).toBe(0.3);
    });

    it("should create from numbers (radians)", () => {
      const angles = new EulerAngles(0.1, 0.2, 0.3);
      expect(angles.phi.value).toBe(0.1);
      expect(angles.theta.value).toBe(0.2);
      expect(angles.psi.value).toBe(0.3);
    });

    it("should create zero angles", () => {
      const angles = EulerAngles.zero();
      expect(angles.phi.value).toBe(0);
      expect(angles.theta.value).toBe(0);
      expect(angles.psi.value).toBe(0);
    });

    it("should create from degrees", () => {
      const angles = EulerAngles.fromDegrees(30, 10, 90);
      expect(angles.rollDegrees).toBeCloseTo(30, 5);
      expect(angles.pitchDegrees).toBeCloseTo(10, 5);
      expect(angles.yawDegrees).toBeCloseTo(90, 5);
    });

    it("should throw on non-finite values", () => {
      expect(() => new EulerAngles(NaN, 0, 0)).toThrow(RangeError);
    });
  });

  describe("standard aerospace convention", () => {
    it("should have roll as first parameter (phi)", () => {
      const angles = EulerAngles.fromDegrees(30, 0, 0);
      expect(angles.roll.value).toBeCloseTo((30 * Math.PI) / 180, 10);
    });

    it("should have pitch as second parameter (theta)", () => {
      const angles = EulerAngles.fromDegrees(0, 15, 0);
      expect(angles.pitch.value).toBeCloseTo((15 * Math.PI) / 180, 10);
    });

    it("should have yaw as third parameter (psi)", () => {
      const angles = EulerAngles.fromDegrees(0, 0, 90);
      expect(angles.yaw.value).toBeCloseTo((90 * Math.PI) / 180, 10);
    });

    it("should provide heading alias for yaw", () => {
      const angles = EulerAngles.fromDegrees(0, 0, 45);
      expect(angles.heading.value).toBe(angles.yaw.value);
    });
  });

  describe("operations", () => {
    it("should add angles", () => {
      const a = new EulerAngles(0.1, 0.2, 0.3);
      const b = new EulerAngles(0.01, 0.02, 0.03);
      const result = a.add(b);
      expect(result.phi.value).toBeCloseTo(0.11, 10);
      expect(result.theta.value).toBeCloseTo(0.22, 10);
      expect(result.psi.value).toBeCloseTo(0.33, 10);
    });

    it("should scale angles", () => {
      const angles = new EulerAngles(0.1, 0.2, 0.3);
      const result = angles.scale(2);
      expect(result.phi.value).toBeCloseTo(0.2, 10);
      expect(result.theta.value).toBeCloseTo(0.4, 10);
      expect(result.psi.value).toBeCloseTo(0.6, 10);
    });

    it("should normalize angles to standard ranges", () => {
      const angles = new EulerAngles(4, 0.1, -4); // Outside [-π, π]
      const normalized = angles.normalize();
      expect(normalized.phi.value).toBeGreaterThanOrEqual(-Math.PI);
      expect(normalized.phi.value).toBeLessThanOrEqual(Math.PI);
      expect(normalized.psi.value).toBeGreaterThanOrEqual(-Math.PI);
      expect(normalized.psi.value).toBeLessThanOrEqual(Math.PI);
    });

    it("should convert to array", () => {
      const angles = new EulerAngles(0.1, 0.2, 0.3);
      const arr = angles.toArray();
      expect(arr).toEqual([0.1, 0.2, 0.3]);
    });
  });
});

describe("AngularVelocity", () => {
  describe("construction", () => {
    it("should create from RadiansPerSecond objects", () => {
      const rates = new AngularVelocity(
        new RadiansPerSecond(0.1),
        new RadiansPerSecond(0.2),
        new RadiansPerSecond(0.3)
      );
      expect(rates.p.value).toBe(0.1);
      expect(rates.q.value).toBe(0.2);
      expect(rates.r.value).toBe(0.3);
    });

    it("should create from components", () => {
      const rates = AngularVelocity.fromComponents(0.1, 0.2, 0.3);
      expect(rates.p.value).toBe(0.1);
      expect(rates.q.value).toBe(0.2);
      expect(rates.r.value).toBe(0.3);
    });

    it("should create zero rates", () => {
      const rates = AngularVelocity.zero();
      expect(rates.p.value).toBe(0);
      expect(rates.q.value).toBe(0);
      expect(rates.r.value).toBe(0);
    });

    it("should create from degrees per second", () => {
      const rates = AngularVelocity.fromDegreesPerSecond(10, 5, 3);
      expect(rates.rollRateDegrees).toBeCloseTo(10, 5);
      expect(rates.pitchRateDegrees).toBeCloseTo(5, 5);
      expect(rates.yawRateDegrees).toBeCloseTo(3, 5);
    });
  });

  describe("body-frame convention", () => {
    it("should have p as roll rate", () => {
      const rates = AngularVelocity.fromComponents(0.5, 0, 0);
      expect(rates.rollRate.value).toBe(0.5);
    });

    it("should have q as pitch rate", () => {
      const rates = AngularVelocity.fromComponents(0, 0.3, 0);
      expect(rates.pitchRate.value).toBe(0.3);
    });

    it("should have r as yaw rate", () => {
      const rates = AngularVelocity.fromComponents(0, 0, 0.2);
      expect(rates.yawRate.value).toBe(0.2);
    });
  });

  describe("operations", () => {
    it("should calculate magnitude", () => {
      const rates = AngularVelocity.fromComponents(3, 4, 0);
      expect(rates.magnitude).toBe(5);
    });

    it("should add rates", () => {
      const a = AngularVelocity.fromComponents(0.1, 0.2, 0.3);
      const b = AngularVelocity.fromComponents(0.01, 0.02, 0.03);
      const result = a.add(b);
      expect(result.p.value).toBeCloseTo(0.11, 10);
    });

    it("should scale rates", () => {
      const rates = AngularVelocity.fromComponents(0.1, 0.2, 0.3);
      const result = rates.scale(10);
      expect(result.p.value).toBeCloseTo(1.0, 10);
    });
  });
});

describe("StateVector", () => {
  describe("construction", () => {
    it("should create zero state", () => {
      const state = StateVector.zero();
      expect(state.position.x).toBe(0);
      expect(state.velocity.x).toBe(0);
      expect(state.attitude.phi.value).toBe(0);
      expect(state.angularVelocity.p.value).toBe(0);
    });

    it("should create level flight state", () => {
      const state = StateVector.levelFlight({
        altitude: new MSL(new Meters(1000)),
        airspeed: 50,
        heading: Math.PI / 2,
      });

      expect(state.altitudeMSL.value).toBe(1000);
      expect(state.velocity.u.value).toBe(50);
      expect(state.attitude.yaw.value).toBe(Math.PI / 2);
      expect(state.angularVelocity.p.value).toBe(0);
    });

    it("should create from component objects", () => {
      const state = StateVector.create({
        position: { north: 100, east: 200, down: -1000 },
        velocity: { u: 50, v: 0, w: 0 },
        attitude: { roll: 0.1, pitch: 0.05, yaw: 1.57 },
        angularVelocity: { p: 0.01, q: 0, r: 0.005 },
      });

      expect(state.position.north.value).toBe(100);
      expect(state.velocity.u.value).toBe(50);
      expect(state.attitude.phi.value).toBe(0.1);
      expect(state.angularVelocity.p.value).toBe(0.01);
    });
  });

  describe("array serialization", () => {
    it("should convert to array with correct order", () => {
      const state = StateVector.create({
        position: { north: 1, east: 2, down: 3 },
        velocity: { u: 4, v: 5, w: 6 },
        attitude: { roll: 0.7, pitch: 0.8, yaw: 0.9 },
        angularVelocity: { p: 1.0, q: 1.1, r: 1.2 },
      });

      const arr = state.toArray();

      expect(arr[0]).toBe(1); // north
      expect(arr[1]).toBe(2); // east
      expect(arr[2]).toBe(3); // down
      expect(arr[3]).toBe(4); // u
      expect(arr[4]).toBe(5); // v
      expect(arr[5]).toBe(6); // w
      expect(arr[6]).toBe(0.7); // roll
      expect(arr[7]).toBe(0.8); // pitch
      expect(arr[8]).toBe(0.9); // yaw
      expect(arr[9]).toBe(1.0); // p
      expect(arr[10]).toBe(1.1); // q
      expect(arr[11]).toBe(1.2); // r
    });

    it("should create from array", () => {
      const arr = [1, 2, 3, 4, 5, 6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];
      const state = StateVector.fromArray(arr);

      expect(state.position.x).toBe(1);
      expect(state.velocity.x).toBe(4);
      expect(state.attitude.phi.value).toBe(0.7);
      expect(state.angularVelocity.p.value).toBe(1.0);
    });

    it("should throw on wrong array size", () => {
      expect(() => StateVector.fromArray([1, 2, 3])).toThrow(RangeError);
    });

    it("should round-trip through array", () => {
      const original = StateVector.create({
        position: { north: 100, east: 200, down: -1000 },
        velocity: { u: 50, v: 2, w: 1 },
        attitude: { roll: 0.1, pitch: 0.05, yaw: 1.57 },
        angularVelocity: { p: 0.01, q: 0.005, r: 0.002 },
      });

      const arr = original.toArray();
      const restored = StateVector.fromArray(arr);

      expect(restored.equals(original)).toBe(true);
    });
  });

  describe("operations for integration", () => {
    it("should add state vectors", () => {
      const state = StateVector.create({
        position: { north: 100, east: 0, down: -1000 },
        velocity: { u: 50, v: 0, w: 0 },
      });

      const delta = StateVector.create({
        position: { north: 10, east: 5, down: -2 },
        velocity: { u: 1, v: 0.5, w: 0.1 },
      });

      const result = state.add(delta);

      expect(result.position.north.value).toBe(110);
      expect(result.position.east.value).toBe(5);
      expect(result.velocity.u.value).toBe(51);
    });

    it("should scale state vectors", () => {
      const derivative = StateVector.create({
        position: { north: 50, east: 10, down: -5 },
        velocity: { u: 2, v: 0.5, w: 0.1 },
        attitude: { roll: 0.01, pitch: 0.005, yaw: 0.002 },
        angularVelocity: { p: 0.001, q: 0.0005, r: 0.0002 },
      });

      const dt = 0.01;
      const delta = derivative.scale(dt);

      expect(delta.position.north.value).toBeCloseTo(0.5, 10);
      expect(delta.velocity.u.value).toBeCloseTo(0.02, 10);
    });

    it("should support integration pattern: y_new = y + h * dydt", () => {
      const y = StateVector.levelFlight({
        altitude: new MSL(new Meters(1000)),
        airspeed: 50,
      });

      // Simulated derivative (aircraft moving forward, slight descent)
      const dydt = StateVector.create({
        position: { north: 50, east: 0, down: 1 }, // Moving north, descending
        velocity: { u: 0, v: 0, w: 0 },
        attitude: { roll: 0, pitch: 0, yaw: 0 },
        angularVelocity: { p: 0, q: 0, r: 0 },
      });

      const dt = 0.1;
      const y_new = y.add(dydt.scale(dt));

      expect(y_new.position.north.value).toBeCloseTo(5, 10); // 50 * 0.1
      expect(y_new.position.down.value).toBeCloseTo(-1000 + 0.1, 10); // slight descent
    });
  });

  describe("flight state accessors", () => {
    it("should provide altitude MSL", () => {
      const state = StateVector.create({
        position: { north: 0, east: 0, down: -5000 },
      });
      expect(state.altitudeMSL.value).toBe(5000);
    });

    it("should provide airspeed", () => {
      const state = StateVector.create({
        velocity: { u: 30, v: 40, w: 0 },
      });
      expect(state.airspeed.value).toBe(50);
    });

    it("should provide angle of attack", () => {
      const state = StateVector.create({
        velocity: { u: 100, v: 0, w: 10 },
      });
      expect(state.angleOfAttack).toBeCloseTo(Math.atan2(10, 100), 10);
    });

    it("should provide sideslip angle", () => {
      const state = StateVector.create({
        velocity: { u: 100, v: 5, w: 0 },
      });
      expect(state.sideslipAngle).toBeCloseTo(Math.atan2(5, 100), 10);
    });
  });

  describe("immutability", () => {
    it("should return new instances from operations", () => {
      const original = StateVector.zero();
      const delta = StateVector.create({
        position: { north: 10, east: 0, down: 0 },
      });

      const result = original.add(delta);

      expect(result).not.toBe(original);
      expect(original.position.north.value).toBe(0); // Original unchanged
      expect(result.position.north.value).toBe(10);
    });

    it("should clone correctly", () => {
      const original = StateVector.levelFlight({
        altitude: new MSL(new Meters(1000)),
        airspeed: 50,
      });

      const cloned = original.clone();

      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original);
      expect(cloned.position).not.toBe(original.position);
    });
  });
});
