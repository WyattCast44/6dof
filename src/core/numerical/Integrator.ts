import type StateVector from "./StateVector";

/**
 * Fourth-order Runge-Kutta (RK4) numerical integrator.
 *
 * Advances a StateVector forward in time by evaluating the derivative
 * function four times per step and combining with standard RK4 weights.
 *
 * The integrator is stateless — the derivative callback is provided by
 * the caller, making it composable. Swap in Euler by providing a simpler
 * step function externally; this class always uses classical RK4.
 */
class Integrator {
  /**
   * Advance `state` by one time step using classical RK4.
   *
   * @param state      - Current state vector
   * @param time       - Current simulation time (seconds)
   * @param dt         - Time step (seconds)
   * @param derivative - Function that computes dState/dt given (state, time)
   * @returns New state vector at time + dt
   */
  step(
    state: StateVector,
    time: number,
    dt: number,
    derivative: (state: StateVector, time: number) => StateVector
  ): StateVector {
    const k1 = derivative(state, time);
    const k2 = derivative(state.add(k1.scale(dt / 2)), time + dt / 2);
    const k3 = derivative(state.add(k2.scale(dt / 2)), time + dt / 2);
    const k4 = derivative(state.add(k3.scale(dt)), time + dt);

    return state.add(
      k1.add(k2.scale(2)).add(k3.scale(2)).add(k4).scale(dt / 6)
    );
  }
}

export default Integrator;
