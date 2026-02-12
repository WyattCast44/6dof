# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

6-DOF (Six Degrees of Freedom) flight simulation environment in TypeScript. Models rigid-body aircraft dynamics including translational and rotational motion in a realistic atmosphere. Currently a work-in-progress — aerodynamic forces, control surfaces, and propulsion are stubbed.

## Commands

```bash
yarn dev          # Start Vite dev server
yarn build        # TypeScript check + Vite production build
yarn test         # Run all tests with Vitest (watch mode)
yarn test <path>  # Run a single test file
yarn coverage     # Generate test coverage report
```

## Architecture

### Simulation Engine (`src/core/`)

The core is a 12-DOF state vector integrated forward in time via RK4:

- **StateVector** (`numerical/StateVector.ts`) — Immutable 12-element state: position (NED), velocity (body), Euler angles, angular rates. Provides `toArray()`/`fromArray()` for integration, `add()`/`scale()` for RK4 arithmetic.
- **Integrator** (`numerical/Integrator.ts`) — RK4 numerical integrator operating on StateVector.
- **AircraftDynamicsModel** (`aircraft/AircraftDynamicsModel.ts`) — Computes state derivatives (forces → accelerations, moments → angular accelerations). This is where aerodynamic/propulsion models plug in.
- **FixedTimeSimulation** (`sim/FixedTimeSimulation.ts`) — Fixed-timestep simulation loop with configurable output interval and callbacks.
- **FlightDynamics** (`flight/FlightDynamics.ts`) — High-level flight dynamics controller connecting aircraft and environment.

### Environment Models (`src/core/`)

- **StandardAtmosphere1976** (`atmosphere/`) — Temperature, pressure, density as functions of altitude.
- **SimpleWindModel** (`wind/`) — Altitude-interpolated wind profiles with linear decay.
- **ConstantGravityModel** (`gravity/`) — Gravity acceleration model.
- **Environment** (`environment/`) — Composite of gravity, atmosphere, and wind models.

### Coordinate Systems & Transforms

- **NED frame** — North-East-Down inertial frame for position.
- **Body frame** — Aircraft-relative (forward-right-down) for velocity and angular rates.
- **DCM** (`transforms/DCM.ts`) — Direction Cosine Matrix for body ↔ NED transformations.

### Unit-Safe Type System

Physical quantities are wrapped in typed classes with conversion methods. Key types live in their own modules under `src/core/`:

- Velocity: `Knots`, `MetersPerSecond`, `FeetPerSecond`
- Length: `Feet`, `Meters`
- Altitude: `MSL`, `AGL`
- Angles: `Degrees`, `Radians`
- Acceleration, density, pressure, temperature, mass, force, moments, area, time

All unit types enforce correctness at the type level — use the appropriate type and its conversion methods rather than raw numbers.

### UI Layer (`src/ui/`)

React 19 + Tailwind CSS dashboard. Entry point is `src/ui/main.tsx` → `App.tsx`. Currently a placeholder that triggers `simulation.run()`.

### Entry Points

- `src/main.ts` — Wires up environment, aircraft, integrator, and simulation. Exports the simulation instance.
- `src/ui/main.tsx` — React DOM entry.
- `index.html` — Loads the UI and scratch script.

## Test Conventions

Tests use Vitest with `describe`/`it`/`expect` and live alongside source code as `*.test.ts` files (e.g., `src/core/atmosphere/AtmosphereModel.test.ts`). Tests focus on physical correctness: unit conversions, boundary conditions, round-trip accuracy, and consistency with reference data.
