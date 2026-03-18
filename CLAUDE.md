# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # tsc + production build
npm run test         # Run all tests in watch mode
npm run coverage     # Test coverage report
```

Run a single test file:
```bash
npx vitest run src/core/atmosphere/AtmosphereModel.test.ts
```

Run tests matching a pattern:
```bash
npx vitest run --reporter=verbose atmosphere
```

## Architecture

### Simulation loop

`FixedTimeSimulation` (`src/core/sim/`) is a fixed-timestep loop driven by callbacks. Callers register `"update"` callbacks (called every step with `(time, dt)`) and `"beforeOutput"` / `"afterOutput"` callbacks (called at the output interval). The loop uses step-count arithmetic instead of floating-point time accumulation to avoid drift.

`AircraftSimulator` (`src/core/sim/AircraftSimulator.ts`) wires the dynamics model and integrator into the sim loop.

### Physics core

`StateVector` (`src/core/numerical/StateVector.ts`) is the central data structure — 12 state variables (position NED, velocity body-frame, Euler angles, angular rates). All instances are **immutable**; operations (`add`, `scale`, etc.) return new instances. The flat `toArray()` / `fromArray()` interface is used by integrators.

`AircraftDynamicsModel` (`src/core/aircraft/AircraftDynamicsModel.ts`) computes `dState/dt` from a current `StateVector`, an `AircraftProperties` config, and an `Environment`. Currently implements gravity resolution and translational force equations; aerodynamic forces (lift/drag) and moments are stubbed to zero.

`Environment` (`src/core/environment/Environment.ts`) composes three models: `GravityModel`, `AtmosphereModel`, and `WindModel`.

Integrators (`src/core/numerical/`) implement `Integrator` — `Euler` is complete; `RK4` is a stub.

### Coordinate frames

- **NED** (North-East-Down): inertial frame used for position
- **Body** (forward-right-down): frame used for velocity and angular rates
- `BodyNedDCM` (`src/core/transforms/`) handles DCM rotation between frames using Euler angles (φ roll, θ pitch, ψ yaw)

### Physical units

Every physical quantity has its own type class (e.g., `Meters`, `MetersPerSecond`, `Kilograms`, `Newtons`, `Radians`). These are not full-blown unit conversion libraries — they wrap a `.value` number and provide a common interface. Use the most specific type the context calls for; don't pass raw numbers where a unit type is expected.

### Aircraft configuration

`AircraftProperties` holds mass, geometry (wing area, span, chord), moments of inertia (Ixx, Iyy, Izz, Ixz), and stability/control derivatives (CL0, CLα, CD0, CDα, Cm0, Cmα, etc.). See `src/core/aircraft/AircraftPropertiesReference.md` for the full parameter guide. `LightFixedWing.ts` is a sample aircraft definition.

### Test layout

Test files (`*.test.ts`) are co-located with the source they test. Current coverage: `StateVector`, `AtmosphereModel`, `SimpleWindModel`, `DCM`, `FixedTimeSimulation`, `AccelerationTests`.
