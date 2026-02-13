import type StateVector from "../numerical/StateVector";
import type Environment from "../environment/Environment";
import type AircraftProperties from "../aircraft/AircraftProperties";
import type { ControlInput } from "../aircraft/ControlInput";
import { neutralControls } from "../aircraft/ControlInput";
import DynamicsModel from "../flight/DynamicsModel";
import Integrator from "../numerical/Integrator";

/**
 * Callback for state change events.
 */
export type StateChangeCallback = (
  time: number,
  state: StateVector,
  previousState: StateVector
) => void;

/**
 * Configuration for AircraftSimulator.
 */
export interface AircraftSimulatorConfig {
  /** Aircraft physical properties (mass, inertia, aero coefficients) */
  aircraft: AircraftProperties;
  /** Initial state of the aircraft */
  initialState: StateVector;
  /** Environment (gravity, atmosphere, wind) */
  environment: Environment;
  /** Whether to record state history (default: false) */
  recordHistory?: boolean;
  /** Maximum history length (eg: 10,000 states) */
  maxHistoryLength?: number;
}

/**
 * A snapshot of aircraft state at a point in time.
 */
export interface StateSnapshot {
  time: number;
  state: StateVector;
}

/**
 * Simulates aircraft flight dynamics over time.
 *
 * AircraftSimulator is the central class for running aircraft simulations.
 * It owns the aircraft state, integrates the equations of motion, and
 * provides hooks for monitoring and recording the simulation.
 *
 * ## Responsibilities
 * - Owns and manages the current aircraft state
 * - Integrates equations of motion using the configured integrator
 * - Optionally records state history for analysis
 * - Emits state change events for external monitoring
 *
 * ## Usage with FixedTimeSimulation
 * ```typescript
 * const simulator = new AircraftSimulator({
 *   aircraft: new LightFixedWing(),
 *   initialState: StateVector.levelFlight({ altitude, airspeed }),
 *   environment,
 * });
 *
 * const simulation = new FixedTimeSimulation({
 *   timeStep: new Seconds(0.01),
 *   totalTime: new Seconds(60),
 *   outputInterval: new Seconds(1),
 * });
 *
 * // Connect simulator to simulation
 * simulation.registerCallback('update', (time, dt) => simulator.step(dt));
 * simulation.registerCallback('afterOutput', (time) => {
 *   console.log(simulator.getFlightSummary());
 * });
 *
 * simulation.run();
 * ```
 *
 * ## Standalone Usage
 * ```typescript
 * const simulator = new AircraftSimulator({ ... });
 *
 * // Manual stepping
 * for (let t = 0; t < 10; t += 0.01) {
 *   simulator.step(0.01);
 * }
 *
 * console.log(simulator.state);
 * ```
 */
class AircraftSimulator {
  private _currentState: StateVector;
  private _time: number = 0;
  private _stepCount: number = 0;
  private _controls: ControlInput = neutralControls();

  private readonly aircraft: AircraftProperties;
  private readonly environment: Environment;
  private readonly dynamicsModel: DynamicsModel;
  private readonly integrator: Integrator;

  private readonly recordHistory: boolean;
  private readonly maxHistoryLength: number;
  private readonly history: StateSnapshot[] = [];

  private readonly stateChangeCallbacks: StateChangeCallback[] = [];

  constructor(config: AircraftSimulatorConfig) {
    this.aircraft = config.aircraft;
    this.environment = config.environment;
    this._currentState = config.initialState;

    this.recordHistory = config.recordHistory ?? false;
    this.maxHistoryLength = config.maxHistoryLength ?? 1_000;

    // Create dynamics model for this aircraft/environment combination
    this.dynamicsModel = new DynamicsModel(this.aircraft, this.environment);

    // Stateless RK4 integrator — no constructor dependencies
    this.integrator = new Integrator();

    // Record initial state if history is enabled
    if (this.recordHistory) {
      this.recordState();
    }
  }

  /**
   * Current aircraft state.
   */
  get state(): StateVector {
    return this._currentState;
  }

  /**
   * Current simulation time in seconds.
   */
  get time(): number {
    return this._time;
  }

  /**
   * Number of integration steps taken.
   */
  get stepCount(): number {
    return this._stepCount;
  }

  /**
   * Current control inputs.
   */
  get controls(): ControlInput {
    return this._controls;
  }

  set controls(value: ControlInput) {
    this._controls = value;
  }

  /**
   * Recorded state history (if recordHistory is enabled).
   */
  getHistory(): readonly StateSnapshot[] {
    return this.history;
  }

  /**
   * Advance the simulation by one time step.
   *
   * @param dt - Time step in seconds
   * @returns The new state after integration
   */
  step(dt: number): StateVector {
    const previousState = this._currentState;

    // Build derivative closure that captures current controls
    const deriv = (s: StateVector, t: number) =>
      this.dynamicsModel.computeDerivative(s, t, this._controls);

    // Integrate equations of motion
    this._currentState = this.integrator.step(this._currentState, this._time, dt, deriv);
    this._time += dt;
    this._stepCount++;

    // Record history if enabled
    if (this.recordHistory) {
      this.recordState();
    }

    // Notify listeners
    this.notifyStateChange(previousState);

    return this._currentState;
  }

  /**
   * Advance the simulation by multiple steps to reach a target time.
   *
   * @param targetTime - Target simulation time
   * @param dt - Time step for each integration step
   * @returns The final state
   */
  advanceTo(targetTime: number, dt: number): StateVector {
    while (this._time < targetTime) {
      const remainingTime = targetTime - this._time;
      const stepSize = Math.min(dt, remainingTime);
      this.step(stepSize);
    }
    return this._currentState;
  }

  /**
   * Run the simulation for a specified duration.
   *
   * @param duration - Total time to simulate in seconds
   * @param dt - Time step for each integration step
   * @returns The final state
   */
  run(duration: number, dt: number): StateVector {
    const targetTime = this._time + duration;
    return this.advanceTo(targetTime, dt);
  }

  /**
   * Reset the simulation to a new state.
   *
   * @param state - New initial state (defaults to original initial state)
   * @param clearHistory - Whether to clear recorded history (default: true)
   */
  reset(state?: StateVector, clearHistory: boolean = true): void {
    this._currentState = state ?? this._currentState;
    this._time = 0;
    this._stepCount = 0;

    if (clearHistory) {
      this.history.length = 0;
    }

    if (this.recordHistory) {
      this.recordState();
    }
  }

  /**
   * Register a callback for state changes.
   */
  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback);
  }

  /**
   * Remove a state change callback.
   */
  offStateChange(callback: StateChangeCallback): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Get a summary of the current flight state.
   */
  getFlightSummary(): string {
    return (
      `t=${this._time.toFixed(2)}s | ` +
      this._currentState.toFlightSummary()
    );
  }

  /**
   * Record current state to history.
   */
  private recordState(): void {
    this.history.push({
      time: this._time,
      state: this._currentState.clone(),
    });

    // Trim history if it exceeds max length
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  /**
   * Notify all state change listeners.
   */
  private notifyStateChange(previousState: StateVector): void {
    for (const callback of this.stateChangeCallbacks) {
      try {
        callback(this._time, this._currentState, previousState);
      } catch (error) {
        console.error("Error in state change callback:", error);
      }
    }
  }
}

export default AircraftSimulator;
