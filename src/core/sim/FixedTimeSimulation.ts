import Seconds from "../time/Seconds";

export type TimeUpdateCallback = (currentTime: number, timeStep: number) => void;
export type OutputCallback = (currentTime: number) => void;
export type ErrorCallback = (error: Error, callbackType: CallbackType, currentTime: number) => void;
export type SimulationEventCallback = (event: SimulationEvent) => void;

export type CallbackType = "update" | "beforeOutput" | "afterOutput";

export interface SimulationEvent {
  type: "init" | "complete" | "step" | "output" | "error";
  currentTime: number;
  data?: Record<string, unknown>;
}

export interface SimulationConfig {
  timeStep: Seconds;
  totalTime: Seconds;
  outputInterval: Seconds;
  /** If true, stop simulation when a callback throws. Default: false */
  stopOnError?: boolean;
}

/**
 * A fixed time simulation that runs at a fixed time step.
 *
 * @example
 * ```typescript
 * const sim = new FixedTimeSimulation({
 *   timeStep: new Seconds(0.01),
 *   totalTime: new Seconds(10),
 *   outputInterval: new Seconds(1),
 * });
 *
 * sim.registerCallback("update", (time, dt) => {
 *   // Update physics, aircraft state, etc.
 * });
 *
 * sim.registerCallback("afterOutput", (time) => {
 *   // Log state, update UI, etc.
 * });
 *
 * sim.onError((error, type, time) => {
 *   console.error(`Error in ${type} callback at t=${time}:`, error);
 * });
 *
 * sim.run();
 * ```
 */
class FixedTimeSimulation {
  private readonly timeStepValue: number;
  private readonly totalTimeValue: number;
  private readonly outputIntervalValue: number;
  private readonly stopOnError: boolean;

  private stepCount: number = 0;
  private totalSteps: number;
  private startTime: number = 0;

  private readonly callbacks: Record<CallbackType, Function[]> = {
    update: [],
    beforeOutput: [],
    afterOutput: [],
  };

  private errorCallbacks: ErrorCallback[] = [];
  private eventCallbacks: SimulationEventCallback[] = [];

  constructor(config: SimulationConfig) {
    this.validateConfig(config);

    this.timeStepValue = config.timeStep.value;
    this.totalTimeValue = config.totalTime.value;
    this.outputIntervalValue = config.outputInterval.value;
    this.stopOnError = config.stopOnError ?? false;

    this.totalSteps = Math.floor(this.totalTimeValue / this.timeStepValue);
  }

  /**
   * Get the current simulation time.
   * Computed from step count to avoid floating-point accumulation errors.
   */
  get currentTime(): number {
    return this.stepCount * this.timeStepValue;
  }

  /**
   * Register a callback for the specified event type.
   *
   * @param type - "update" for each time step, "beforeOutput" or "afterOutput" for output intervals
   * @param callback - Function to call. Update callbacks receive (currentTime, timeStep),
   *                   output callbacks receive (currentTime)
   */
  registerCallback(type: "update", callback: TimeUpdateCallback): void;
  registerCallback(type: "beforeOutput" | "afterOutput", callback: OutputCallback): void;
  registerCallback(type: CallbackType, callback: Function): void {
    this.callbacks[type].push(callback);
  }

  /**
   * Remove a previously registered callback.
   */
  unregisterCallback(type: CallbackType, callback: Function): void {
    const callbacks = this.callbacks[type];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Register an error handler for callback errors.
   * If no error handlers are registered and stopOnError is false,
   * errors are silently ignored.
   */
  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove an error handler.
   */
  offError(callback: ErrorCallback): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  /**
   * Register a simulation event listener.
   * Events: "init", "complete", "step", "output", "error"
   */
  onEvent(callback: SimulationEventCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Remove a simulation event listener.
   */
  offEvent(callback: SimulationEventCallback): void {
    const index = this.eventCallbacks.indexOf(callback);
    if (index > -1) {
      this.eventCallbacks.splice(index, 1);
    }
  }

  /**
   * Run the simulation from start to finish.
   */
  run(): void {
    this.startTime = performance.now();
    this.printInitBanner();
    this.emitEvent({ type: "init", currentTime: 0, data: { totalSteps: this.totalSteps } });

    // Use < instead of <= to fix off-by-one error
    // stepCount is incremented at end of loop, so we process steps 0 through totalSteps-1
    for (this.stepCount = 0; this.stepCount < this.totalSteps; this.stepCount++) {
      const shouldStop = this.executeStep();
      if (shouldStop) {
        break;
      }
    }

    this.printFinalBanner();
    this.emitEvent({ type: "complete", currentTime: this.currentTime });
  }

  /**
   * Execute a single time step. Returns true if simulation should stop.
   */
  private executeStep(): boolean {
    const time = this.currentTime;
    const shouldOutput = this.shouldOutput(time);

    // Before-output callbacks
    if (shouldOutput) {
      const shouldStop = this.executeCallbacks("beforeOutput", time);
      if (shouldStop) return true;
    }

    // Update callbacks
    const shouldStop = this.executeUpdateCallbacks(time);
    if (shouldStop) return true;

    // After-output callbacks
    if (shouldOutput) {
      const shouldStopAfter = this.executeCallbacks("afterOutput", time);
      if (shouldStopAfter) return true;

      this.emitEvent({ type: "output", currentTime: time });
    }

    this.emitEvent({ type: "step", currentTime: time });
    return false;
  }

  /**
   * Execute update callbacks. Returns true if simulation should stop.
   */
  private executeUpdateCallbacks(time: number): boolean {
    const callbacks = this.callbacks.update as TimeUpdateCallback[];

    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i](time, this.timeStepValue);
      } catch (error) {
        const shouldStop = this.handleCallbackError(error as Error, "update", time);
        if (shouldStop) return true;
      }
    }

    return false;
  }

  /**
   * Execute output callbacks. Returns true if simulation should stop.
   */
  private executeCallbacks(type: "beforeOutput" | "afterOutput", time: number): boolean {
    const callbacks = this.callbacks[type] as OutputCallback[];

    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i](time);
      } catch (error) {
        const shouldStop = this.handleCallbackError(error as Error, type, time);
        if (shouldStop) return true;
      }
    }

    return false;
  }

  /**
   * Handle a callback error. Returns true if simulation should stop.
   */
  private handleCallbackError(error: Error, type: CallbackType, time: number): boolean {
    // Emit error event
    this.emitEvent({
      type: "error",
      currentTime: time,
      data: { error, callbackType: type },
    });

    // Call error handlers
    for (const handler of this.errorCallbacks) {
      try {
        handler(error, type, time);
      } catch {
        // Ignore errors in error handlers to prevent infinite loops
      }
    }

    return this.stopOnError;
  }

  /**
   * Emit a simulation event to all registered listeners.
   */
  private emitEvent(event: SimulationEvent): void {
    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch {
        // Ignore errors in event handlers
      }
    }
  }

  /**
   * Get the time step.
   */
  getTimeStep(): Seconds {
    return new Seconds(this.timeStepValue);
  }

  /**
   * Get the total simulation time.
   */
  getTotalTime(): Seconds {
    return new Seconds(this.totalTimeValue);
  }

  /**
   * Get the elapsed time.
   */
  getElapsedTime(): Seconds {
    return new Seconds(this.currentTime);
  }

  /**
   * Check if the simulation has completed.
   */
  isComplete(): boolean {
    return this.stepCount >= this.totalSteps;
  }

  /**
   * Reset the simulation to initial state.
   */
  reset(): void {
    this.stepCount = 0;
  }

  /**
   * Validate simulation configuration.
   */
  private validateConfig(config: SimulationConfig): void {
    if (config.timeStep.value <= 0) {
      throw new RangeError("timeStep must be positive");
    }

    if (config.totalTime.value <= 0) {
      throw new RangeError("totalTime must be positive");
    }

    if (config.outputInterval.value <= 0) {
      throw new RangeError("outputInterval must be positive");
    }

    if (config.outputInterval.value < config.timeStep.value) {
      throw new RangeError(
        `outputInterval (${config.outputInterval.value}s) must be >= timeStep (${config.timeStep.value}s)`
      );
    }

    // Warn if outputInterval is not a multiple of timeStep (can cause inconsistent output timing)
    const ratio = config.outputInterval.value / config.timeStep.value;
    if (Math.abs(ratio - Math.round(ratio)) > 1e-9) {
      console.warn(
        `Warning: outputInterval (${config.outputInterval.value}s) is not an exact multiple of ` +
          `timeStep (${config.timeStep.value}s). Output timing may be inconsistent.`
      );
    }
  }

  private printInitBanner(): void {
    console.log("");
    console.log("=== Fixed Time Simulation Config ===");
    console.log(`Time Step: ${this.timeStepValue}s`);
    console.log(`Total Time: ${this.totalTimeValue}s`);
    console.log(`Output Interval: ${this.outputIntervalValue}s`);
    console.log(`Total Steps: ${this.totalSteps}`);
    console.log("");
    console.log("=== Fixed Time Simulation Output ===");
    console.log("");
  }

  private printFinalBanner(): void {
    const endTime = performance.now();
    const actualDuration = (endTime - this.startTime) / 1000; // Convert from milliseconds to seconds

    console.log("");
    console.log("=== Fixed Time Simulation complete! ===");
    console.log(`Elapsed Time: ${this.currentTime}s`);
    console.log(`Steps Executed: ${this.stepCount}`);
    console.log(`Actual Duration: ${actualDuration.toFixed(4)}s`);
    console.log("");
  }

  /**
   * Check if output should be generated at the given time.
   * Uses step-based calculation to avoid floating-point errors.
   */
  private shouldOutput(currentTime: number): boolean {
    // Calculate which output interval we're in
    const stepsPerOutput = Math.round(this.outputIntervalValue / this.timeStepValue);

    // Output when step count is a multiple of steps per output interval
    return this.stepCount % stepsPerOutput === 0;
  }
}

export default FixedTimeSimulation;