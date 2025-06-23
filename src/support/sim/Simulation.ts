import type Integrator from "../numerical/Integrator";
import type StateVector from "../numerical/StateVector";
import Seconds from "../time/Seconds";

class Simulation {
  private timeStep: Seconds;
  private totalTime: Seconds;
  private outputInterval: Seconds;
  private currentTime: number = 0;

  private currentState: StateVector | null = null;

  private integrator: Integrator;

  constructor({
    timeStep,
    totalTime,
    outputInterval,
    initialState,
    integrator,
  }: {
    timeStep: Seconds;
    totalTime: Seconds;
    outputInterval: Seconds;
    initialState: StateVector;
    integrator: Integrator;
  }) {
    this.timeStep = timeStep;
    this.totalTime = totalTime;
    this.outputInterval = outputInterval;
    this.currentState = initialState;
    this.integrator = integrator;
    this.currentTime = 0;
  }

  run() {
    this.printInitBanner();

    while (this.currentTime <= this.totalTime.value) {
      this.loop(this.currentTime);
      this.currentTime += this.timeStep.value;
    }

    this.printFinalBanner();
  }

  private loop(currentTime: number) {
    if (!this.shouldOutput(currentTime)) {
      return;
    }

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
    let q = ((this.currentState.rates.pitch_q.value * 180) / Math.PI).toFixed(
      1
    );
    let r = ((this.currentState.rates.yaw_r.value * 180) / Math.PI).toFixed(1);

    console.log("---");
    console.log(`Time: ${currentTime.toFixed(1)}s`);
    console.log(`Position: N=${north}m, E=${east}m, Alt=${alt}m`);
    console.log(`Velocity: u=${u}m/s, v=${v}m/s, w=${w}m/s`);
    console.log(`Attitude: φ=${phi}°, θ=${theta}°, ψ=${psi}°`);
    console.log(`Angular Rates: p=${p}°/s, q=${q}°/s, r=${r}°/s`);

    if (this.currentTime < this.totalTime.value) {
      this.currentState = this.integrator.integrate(
        this.currentState,
        this.currentTime,
        this.timeStep.value
      );
    }
  }

  private printInitBanner() {
    console.log("=== 6DOF Aircraft Simulation ===");
    console.log("");
  }

  private printFinalBanner() {
    console.log("Simulation complete!");
  }

  private shouldOutput(currentTime: number): boolean {
    // Check if current time is close to an output interval
    const remainder = currentTime % this.outputInterval.value;
    const tolerance = this.timeStep.value / 2; // Use half the time step as tolerance

    return (
      Math.abs(remainder) <= tolerance ||
      Math.abs(remainder - this.outputInterval.value) <= tolerance
    );
  }
}

export default Simulation;
