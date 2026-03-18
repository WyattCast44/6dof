# 6-DOF Flight Simulation

## Features

- **Physics engine** — forces, moments, and full state propagation
- **Numerical integration** — Euler and Runge-Kutta 4th order (RK4)
- **Atmosphere model** — temperature and pressure vs. altitude (Standard Atmosphere 1976)
- **Wind models** — simple wind field and linear altitude decay model
- **Direction Cosine Matrix (DCM)** — body-to-NED frame 3D rotation transforms
- **Type-safe physical units** — dedicated types for velocity, force, mass, angle, time, etc.
- **React + TypeScript + Tailwind** — UI scaffold for visualization

Reference diagrams for the governing equations are in [`public/`](./public/).

---

## Prerequisites

- Node.js v18 or later
- npm or yarn

---

## Setup

```bash
git clone https://github.com/wyattcast44/6dof
cd 6dof
npm install   # or: yarn
```

---

## Development

```bash
npm run dev # or yarn dev
```

Opens a Vite dev server with hot reload at http://localhost:5173.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run coverage` | Generate test coverage report |

---

## Project Structure

```
src/
  core/                   # Physics simulation engine
    aircraft/             # Aircraft model and aerodynamic properties
    atmosphere/           # Standard Atmosphere 1976 model
    numerical/            # State vector, Euler integrator, RK4
    sim/                  # Simulation loop (FixedTimeSimulation)
    transforms/           # DCM body/NED rotation transforms
    wind/                 # Wind field and decay models
    gravity/              # Gravity model
    environment/          # Combined environment (atmosphere + gravity + wind)
    flight/               # Flight dynamics interfaces
    vectors/              # Body/NED/position/velocity vector types
    <units>/              # Type-safe unit types (velocity, force, mass, angle, …)
  ui/                     # React UI layer
    App.tsx
    main.tsx
public/                   # Reference diagrams and sample data
  eqs.png                 # Core equations
  translational-eqs.png
  rotational-eqs.png
  components.png
  f16.json                # F-16 sample aerodynamic data
```

---

## Architecture Overview

```
StateVector
  └─> AircraftDynamicsModel   (forces + moments → accelerations)
        └─> Integrator        (Euler or RK4)
              └─> FixedTimeSimulation loop
```

**Environment** provides the aircraft model with:
- Atmospheric conditions (density, pressure, temperature) at current altitude
- Gravitational acceleration
- Wind vector at current position

**Aircraft** is configured via `AircraftProperties` — mass, wing area, moment of inertia, and stability/control derivatives. See [`src/core/aircraft/AircraftPropertiesReference.md`](./src/core/aircraft/AircraftPropertiesReference.md) for a detailed guide to all aerodynamic parameters.

---

## Testing

```bash
npm run test       # watch mode
npm run coverage   # coverage report
```

Test files cover: state vectors, atmosphere model, wind models, DCM transforms, and the simulation loop.
