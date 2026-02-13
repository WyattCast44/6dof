import { describe, it, expect } from "vitest";
import Integrator from "./Integrator";
import StateVector from "./StateVector";

describe("Integrator (RK4)", () => {
  const integrator = new Integrator();

  describe("exponential decay: dy/dt = -y", () => {
    // Analytical solution: y(t) = y0 · e^(-t)
    // We encode scalar ODE in the u-component of velocity.
    const makeState = (val: number) =>
      StateVector.create({ velocity: { u: val, v: 0, w: 0 } });

    const derivative = (s: StateVector, _t: number) =>
      StateVector.create({ velocity: { u: -s.velocity.u.value, v: 0, w: 0 } });

    it("should match analytical solution after one step", () => {
      const y0 = 1.0;
      const dt = 0.1;
      const result = integrator.step(makeState(y0), 0, dt, derivative);
      const expected = y0 * Math.exp(-dt);
      expect(result.velocity.u.value).toBeCloseTo(expected, 6);
    });

    it("should match analytical solution after many steps", () => {
      const y0 = 2.0;
      const dt = 0.01;
      const steps = 100; // integrate to t = 1.0
      let state = makeState(y0);
      let t = 0;
      for (let i = 0; i < steps; i++) {
        state = integrator.step(state, t, dt, derivative);
        t += dt;
      }
      const expected = y0 * Math.exp(-1.0);
      expect(state.velocity.u.value).toBeCloseTo(expected, 6);
    });
  });

  describe("harmonic oscillator: y'' = -y", () => {
    // Encode as system: u = y, v = y'
    // du/dt = v, dv/dt = -u
    // Solution: y(t) = cos(t), y'(t) = -sin(t) for y(0)=1, y'(0)=0
    const makeState = (y: number, yDot: number) =>
      StateVector.create({ velocity: { u: y, v: yDot, w: 0 } });

    const derivative = (s: StateVector, _t: number) =>
      StateVector.create({
        velocity: { u: s.velocity.v.value, v: -s.velocity.u.value, w: 0 },
      });

    it("should track cos/sin over one full period", () => {
      const dt = 0.01;
      const steps = Math.round((2 * Math.PI) / dt);
      let state = makeState(1.0, 0.0);
      let t = 0;
      for (let i = 0; i < steps; i++) {
        state = integrator.step(state, t, dt, derivative);
        t += dt;
      }
      // After one full period, should return close to (1, 0).
      // RK4 with dt=0.01 over 2π steps accumulates small drift.
      expect(state.velocity.u.value).toBeCloseTo(1.0, 2);
      expect(state.velocity.v.value).toBeCloseTo(0.0, 2);
    });
  });

  describe("convergence order", () => {
    // RK4 should be O(h^4). Halving step size should reduce error by ~16x.
    const makeState = (val: number) =>
      StateVector.create({ velocity: { u: val, v: 0, w: 0 } });

    const derivative = (s: StateVector, _t: number) =>
      StateVector.create({ velocity: { u: -s.velocity.u.value, v: 0, w: 0 } });

    it("should demonstrate O(h^4) convergence", () => {
      const y0 = 1.0;
      const T = 1.0;
      const exact = y0 * Math.exp(-T);

      const errorForStepSize = (dt: number): number => {
        const steps = Math.round(T / dt);
        let state = makeState(y0);
        let t = 0;
        for (let i = 0; i < steps; i++) {
          state = integrator.step(state, t, dt, derivative);
          t += dt;
        }
        return Math.abs(state.velocity.u.value - exact);
      };

      const e1 = errorForStepSize(0.1);
      const e2 = errorForStepSize(0.05);

      // Ratio should be ~16 for 4th-order method (2^4 = 16)
      const ratio = e1 / e2;
      expect(ratio).toBeGreaterThan(12);
      expect(ratio).toBeLessThan(20);
    });
  });
});
