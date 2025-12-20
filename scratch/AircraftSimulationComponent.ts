import type Integrator from "../numerical/Integrator";
import type StateVector from "../numerical/StateVector";
import FixedTimeSimulation from "./FixedTimeSimulation";

class AircraftSimulationComponent {
  private currentState: StateVector;
  private integrator: Integrator;
  private simulation: FixedTimeSimulation;

  constructor({
    initialState,
    integrator,
    simulation,
  }: {
    initialState: StateVector;
    integrator: Integrator;
    simulation: FixedTimeSimulation;
  }) {
    this.currentState = initialState;
    this.integrator = integrator;
    this.simulation = simulation;

    // Register this component with the simulation
    this.simulation.registerUpdateCallback(this.update.bind(this));
    this.simulation.registerAfterUpdateOutputCallback(this.output.bind(this));
  }

  /**
   * Update callback - called on each time step
   */
  private update(currentTime: number, timeStep: number): void {
    // Integrate the aircraft state
    this.currentState = this.integrator.integrate(
      this.currentState,
      currentTime,
      timeStep
    );
  }

  /**
   * Output callback - called when output should be generated
   */
  private output(currentTime: number): void {
    if (!this.currentState) {
      return;
    }

    // Position
    let north = this.currentState.position.x.value.toFixed(0);
    let east = this.currentState.position.y.value.toFixed(0);
    let alt = (-this.currentState.position.z.value).toFixed(0);

    // Velocity
    let u = this.currentState?.velocity.u.value.toFixed(1);
    let v = this.currentState?.velocity.v.value.toFixed(1);
    let w = this.currentState?.velocity.w.value.toFixed(1);

    // Attitude
    let phi = (
      (this.currentState.angles.bank_phi.value * 180) /
      Math.PI
    ).toFixed(1);
    let theta = (
      (this.currentState.angles.elevation_theta.value * 180) /
      Math.PI
    ).toFixed(1);
    let psi = (
      (this.currentState.angles.azimuth_psi.value * 180) /
      Math.PI
    ).toFixed(1);

    // Angular Rates
    let p = ((this.currentState.rates.roll_p.value * 180) / Math.PI).toFixed(1);
    let q = ((this.currentState.rates.pitch_q.value * 180) / Math.PI).toFixed(1);
    let r = ((this.currentState.rates.yaw_r.value * 180) / Math.PI).toFixed(1);

    console.log("---");
    console.log(`Time: ${currentTime.toFixed(1)}s`);
    console.log(`Position: N=${north}m, E=${east}m, Alt=${alt}m`);
    console.log(`Velocity: u=${u}m/s, v=${v}m/s, w=${w}m/s`);
    console.log(`Attitude: φ=${phi}°, θ=${theta}°, ψ=${psi}°`);
    console.log(`Angular Rates: p=${p}°/s, q=${q}°/s, r=${r}°/s`);
  }

  /**
   * Get the current state
   */
  getCurrentState(): StateVector {
    return this.currentState;
  }

  /**
   * Clean up by unregistering callbacks
   */
  destroy(): void {
    this.simulation.unregisterUpdateCallback(this.update.bind(this));
    this.simulation.unregisterAfterUpdateOutputCallback(this.output.bind(this));
  }
}

export default AircraftSimulationComponent; 