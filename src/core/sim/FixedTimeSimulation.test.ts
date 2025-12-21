import { describe, it, expect, beforeEach, vi } from "vitest";
import FixedTimeSimulation, {
  type SimulationConfig,
  type SimulationEvent,
  type CallbackType,
} from "./FixedTimeSimulation";
import Seconds from "../time/Seconds";

describe("FixedTimeSimulation", () => {
  let defaultConfig: SimulationConfig;

  beforeEach(() => {
    defaultConfig = {
      timeStep: new Seconds(1),
      totalTime: new Seconds(10),
      outputInterval: new Seconds(2),
    };
    // mock the console.log function: todo: remove this once we have a proper logging system
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("constructor", () => {
    it("should create simulation with valid config", () => {
      const sim = new FixedTimeSimulation(defaultConfig);
      expect(sim).toBeInstanceOf(FixedTimeSimulation);
      expect(sim.getTimeStep().value).toBe(1);
      expect(sim.getTotalTime().value).toBe(10);
    });

    it("should throw RangeError for non-positive timeStep", () => {
      expect(() => {
        new FixedTimeSimulation({
          ...defaultConfig,
          timeStep: new Seconds(0),
        });
      }).toThrow(RangeError);
      expect(() => {
        new FixedTimeSimulation({
          ...defaultConfig,
          timeStep: new Seconds(-1),
        });
      }).toThrow(/timeStep must be positive/);
    });

    it("should throw RangeError for non-positive totalTime", () => {
      expect(() => {
        new FixedTimeSimulation({
          ...defaultConfig,
          totalTime: new Seconds(0),
        });
      }).toThrow(RangeError);
      expect(() => {
        new FixedTimeSimulation({
          ...defaultConfig,
          totalTime: new Seconds(-5),
        });
      }).toThrow(/totalTime must be positive/);
    });

    it("should throw RangeError for non-positive outputInterval", () => {
      expect(() => {
        new FixedTimeSimulation({
          ...defaultConfig,
          outputInterval: new Seconds(0),
        });
      }).toThrow(RangeError);
    });

    it("should throw RangeError if outputInterval < timeStep", () => {
      expect(() => {
        new FixedTimeSimulation({
          timeStep: new Seconds(1),
          totalTime: new Seconds(10),
          outputInterval: new Seconds(0.5),
        });
      }).toThrow(/outputInterval.*must be >= timeStep/);
    });

    it("should warn if outputInterval is not a multiple of timeStep", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      new FixedTimeSimulation({
        timeStep: new Seconds(0.3),
        totalTime: new Seconds(10),
        outputInterval: new Seconds(1),
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("not an exact multiple")
      );

      warnSpy.mockRestore();
    });
  });

  describe("callback registration", () => {
    it("should register and call update callbacks", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      const callback = vi.fn();
      sim.registerCallback("update", callback);
      sim.run();

      // 3 steps: t=0, t=1, t=2 (t=3 is not executed due to < comparison)
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith(0, 1);
      expect(callback).toHaveBeenCalledWith(1, 1);
      expect(callback).toHaveBeenCalledWith(2, 1);
    });

    it("should register and call beforeOutput callbacks", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(4),
        outputInterval: new Seconds(2),
      });

      const callback = vi.fn();
      sim.registerCallback("beforeOutput", callback);
      sim.run();

      // Output at t=0, t=2 (t=4 not reached)
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(0);
      expect(callback).toHaveBeenCalledWith(2);
    });

    it("should register and call afterOutput callbacks", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(4),
        outputInterval: new Seconds(2),
      });

      const callback = vi.fn();
      sim.registerCallback("afterOutput", callback);
      sim.run();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(0);
      expect(callback).toHaveBeenCalledWith(2);
    });

    it("should unregister callbacks", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      const callback = vi.fn();
      sim.registerCallback("update", callback);
      sim.unregisterCallback("update", callback);
      sim.run();

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle unregistering non-existent callback gracefully", () => {
      const sim = new FixedTimeSimulation(defaultConfig);
      const callback = vi.fn();

      expect(() => {
        sim.unregisterCallback("update", callback);
      }).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("should call error handlers when callback throws", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      const error = new Error("Test error");
      const errorHandler = vi.fn();

      sim.registerCallback("update", () => {
        throw error;
      });
      sim.onError(errorHandler);
      sim.run();

      expect(errorHandler).toHaveBeenCalledWith(
        error,
        "update",
        expect.any(Number)
      );
    });

    it("should continue simulation by default when callback throws", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      const errorHandler = vi.fn();
      const successCallback = vi.fn();

      sim.registerCallback("update", () => {
        throw new Error("Test error");
      });
      sim.registerCallback("update", successCallback);
      sim.onError(errorHandler);
      sim.run();

      // Should continue to call subsequent callbacks
      expect(successCallback).toHaveBeenCalledTimes(3);
    });

    it("should stop simulation when stopOnError is true", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(5),
        outputInterval: new Seconds(1),
        stopOnError: true,
      });

      let callCount = 0;
      sim.registerCallback("update", () => {
        callCount++;
        if (callCount === 2) {
          throw new Error("Stop here");
        }
      });

      sim.run();

      expect(callCount).toBe(2);
    });

    it("should remove error handlers with offError", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const errorHandler = vi.fn();
      sim.registerCallback("update", () => {
        throw new Error("Test");
      });
      sim.onError(errorHandler);
      sim.offError(errorHandler);
      sim.run();

      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe("simulation events", () => {
    it("should emit init event at start", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const events: SimulationEvent[] = [];
      sim.onEvent((event) => events.push(event));
      sim.run();

      expect(events[0]).toEqual({
        type: "init",
        currentTime: 0,
        data: { totalSteps: 2 },
      });
    });

    it("should emit complete event at end", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const events: SimulationEvent[] = [];
      sim.onEvent((event) => events.push(event));
      sim.run();

      const completeEvent = events.find((e) => e.type === "complete");
      expect(completeEvent).toBeDefined();
      expect(completeEvent?.type).toBe("complete");
    });

    it("should emit step events for each time step", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(3),
      });

      const stepEvents: SimulationEvent[] = [];
      sim.onEvent((event) => {
        if (event.type === "step") stepEvents.push(event);
      });
      sim.run();

      expect(stepEvents.length).toBe(3);
      expect(stepEvents[0].currentTime).toBe(0);
      expect(stepEvents[1].currentTime).toBe(1);
      expect(stepEvents[2].currentTime).toBe(2);
    });

    it("should emit output events at output intervals", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(5),
        outputInterval: new Seconds(2),
      });

      const outputEvents: SimulationEvent[] = [];
      sim.onEvent((event) => {
        if (event.type === "output") outputEvents.push(event);
      });
      sim.run();

      expect(outputEvents.length).toBe(3); // t=0, t=2, t=4
      expect(outputEvents[0].currentTime).toBe(0);
      expect(outputEvents[1].currentTime).toBe(2);
      expect(outputEvents[2].currentTime).toBe(4);
    });

    it("should emit error events when callbacks throw", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const error = new Error("Test error");
      const errorEvents: SimulationEvent[] = [];

      sim.registerCallback("update", () => {
        throw error;
      });
      sim.onEvent((event) => {
        if (event.type === "error") errorEvents.push(event);
      });
      sim.run();

      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].data?.error).toBe(error);
      expect(errorEvents[0].data?.callbackType).toBe("update");
    });

    it("should remove event handlers with offEvent", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const handler = vi.fn();
      sim.onEvent(handler);
      sim.offEvent(handler);
      sim.run();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("timing correctness", () => {
    it("should execute correct number of steps", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(0.1),
        totalTime: new Seconds(1),
        outputInterval: new Seconds(0.5),
      });

      let stepCount = 0;
      sim.registerCallback("update", () => stepCount++);
      sim.run();

      expect(stepCount).toBe(10); // 0.0, 0.1, 0.2, ..., 0.9
    });

    it("should avoid floating-point accumulation errors", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(0.1),
        totalTime: new Seconds(1),
        outputInterval: new Seconds(0.5),
      });

      const times: number[] = [];
      sim.registerCallback("update", (time) => times.push(time));
      sim.run();

      // Check that times are exact multiples of 0.1
      times.forEach((time, i) => {
        const expected = i * 0.1;
        expect(time).toBeCloseTo(expected, 10);
      });
    });

    it("should report correct elapsed time", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(5),
        outputInterval: new Seconds(1),
      });

      sim.run();

      // After running, elapsed time should be exactly 4 (steps 0-4 executed)
      // Actually stepCount is 5 after loop, so currentTime = 5 * 1 = 5
      // But we did < totalSteps, so stepCount ends at 5, meaning currentTime = 5
      expect(sim.getElapsedTime().value).toBe(5);
    });
  });

  describe("state management", () => {
    it("should report isComplete correctly", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      expect(sim.isComplete()).toBe(false);
      sim.run();
      expect(sim.isComplete()).toBe(true);
    });

    it("should reset simulation state", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(3),
        outputInterval: new Seconds(1),
      });

      sim.run();
      expect(sim.isComplete()).toBe(true);

      sim.reset();
      expect(sim.isComplete()).toBe(false);
      expect(sim.currentTime).toBe(0);
    });

    it("should allow running simulation again after reset", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const callback = vi.fn();
      sim.registerCallback("update", callback);

      sim.run();
      expect(callback).toHaveBeenCalledTimes(2);

      sim.reset();
      sim.run();
      expect(callback).toHaveBeenCalledTimes(4);
    });
  });

  describe("output interval behavior", () => {
    it("should call output callbacks at correct intervals", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(0.5),
        totalTime: new Seconds(5),
        outputInterval: new Seconds(1),
      });

      const outputTimes: number[] = [];
      sim.registerCallback("afterOutput", (time) => outputTimes.push(time));
      sim.run();

      // Output at t=0, 1, 2, 3, 4
      expect(outputTimes).toEqual([0, 1, 2, 3, 4]);
    });

    it("should call beforeOutput before update and afterOutput after", () => {
      const sim = new FixedTimeSimulation({
        timeStep: new Seconds(1),
        totalTime: new Seconds(2),
        outputInterval: new Seconds(1),
      });

      const order: string[] = [];

      sim.registerCallback("beforeOutput", () => order.push("before"));
      sim.registerCallback("update", () => order.push("update"));
      sim.registerCallback("afterOutput", () => order.push("after"));

      sim.run();

      // For each output step: before, update, after
      expect(order).toEqual([
        "before",
        "update",
        "after", // t=0
        "before",
        "update",
        "after", // t=1
      ]);
    });
  });
});
