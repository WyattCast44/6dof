import type StateVector from "../numerical/StateVector";
import type Environment from "../environment/Environment";
import type AircraftProperties from "../aircraft/AircraftProperties";
import MSL from "../altitude/MSL";

/**
 * Computes the derivative of aircraft state (equations of motion).
 *
 * The DynamicsModel encapsulates the physics of aircraft flight:
 * - Aerodynamic forces and moments
 * - Gravitational forces
 * - Propulsion forces
 * - Kinematic relationships
 *
 * Given a current state and time, it computes the rate of change (derivative)
 * of each state variable, which the integrator uses to advance the simulation.
 *
 * ## State Derivative Components
 * - Position derivative: velocity (transformed to NED frame)
 * - Velocity derivative: acceleration from forces / mass
 * - Attitude derivative: angular rates (Euler kinematic equations)
 * - Angular rate derivative: angular acceleration from moments / inertia
 *
 * @example
 * ```typescript
 * const model = new DynamicsModel(aircraft, environment);
 * const derivative = model.computeDerivative(state, time);
 * // derivative contains [ẋ, ẏ, ż, u̇, v̇, ẇ, φ̇, θ̇, ψ̇, ṗ, q̇, ṙ]
 * ```
 */
class DynamicsModel {
  constructor(
    private readonly aircraft: AircraftProperties,
    private readonly environment: Environment
  ) {}

  /**
   * Compute the state derivative at a given state and time.
   *
   * This is the core function called by the integrator. It implements
   * the equations of motion: dx/dt = f(x, t)
   *
   * @param state - Current aircraft state (12 DOF)
   * @param time - Current simulation time
   * @returns State derivative (rate of change of each state variable)
   */
  computeDerivative(state: StateVector, time: number): StateVector {
    // Get environmental conditions at current position
    const altitude = state.altitudeMSL; // meters
    const atmosphere =
      this.environment.atmosphere.getConditionsAtAltitude(altitude); // AtmosphereConditions
    const gravity = this.environment.gravity.getGravityAtAltitude(altitude); // MetersPerSecondSquared
    const wind = this.environment.wind.getWindAtAltitude(altitude); // WindField

    // Extract state components
    const { position, velocity, attitude, angularVelocity } = state;
    const { phi, theta, psi } = attitude;
    const { u, v, w } = velocity;
    const { p, q, r } = angularVelocity;

    // Compute trigonometric values (used multiple times)
    const sinPhi = Math.sin(phi.value);
    const cosPhi = Math.cos(phi.value);
    const sinTheta = Math.sin(theta.value);
    const cosTheta = Math.cos(theta.value);
    const sinPsi = Math.sin(psi.value);
    const cosPsi = Math.cos(psi.value);
    const tanTheta = Math.tan(theta.value);

    // =====================================================
    // 1. Position derivatives (velocity in NED frame)
    // =====================================================
    // Transform body velocities to NED frame using rotation matrix
    // Ṅ (northDot)
    const northDot =
      u.value * cosTheta * cosPsi + // u·(cθ·cψ)
      v.value * (sinPhi * sinTheta * cosPsi - cosPhi * sinPsi) + // v·(sφ·sθ·cψ - cφ·sψ)
      w.value * (cosPhi * sinTheta * cosPsi + sinPhi * sinPsi); // w·(cφ·sθ·cψ + sφ·sψ)

    // Ė (eastDot)
    const eastDot =
      u.value * cosTheta * sinPsi + // u·(cθ·sψ)
      v.value * (sinPhi * sinTheta * sinPsi + cosPhi * cosPsi) + // v·(sφ·sθ·sψ + cφ·cψ)
      w.value * (cosPhi * sinTheta * sinPsi - sinPhi * cosPsi); // w·(cφ·sθ·sψ - sφ·cψ)

    // Ḋ (downDot)
    const downDot =
      -u.value * sinTheta + // u·(-sθ)
      v.value * sinPhi * cosTheta + // v·(sφ·cθ)
      w.value * cosPhi * cosTheta; // w·(cφ·cθ)

    // =====================================================
    // 2. Velocity derivatives (forces / mass)
    // =====================================================
    const forces = this.computeForces(state, atmosphere, gravity, wind);
    const mass = this.aircraft.mass.value;

    // Body-axis accelerations including Coriolis terms
    const uDot = forces.x / mass - q.value * w.value + r.value * v.value;
    const vDot = forces.y / mass - r.value * u.value + p.value * w.value;
    const wDot = forces.z / mass - p.value * v.value + q.value * u.value;

    // =====================================================
    // 3. Attitude derivatives (Euler kinematic equations)
    // =====================================================
    const phiDot =
      p.value + sinPhi * tanTheta * q.value + cosPhi * tanTheta * r.value;
    const thetaDot = cosPhi * q.value - sinPhi * r.value;
    const psiDot =
      (sinPhi / cosTheta) * q.value + (cosPhi / cosTheta) * r.value;

    // =====================================================
    // 4. Angular rate derivatives (moments / inertia)
    // =====================================================
    const moments = this.computeMoments(state, atmosphere, wind);
    const angularAccel = this.computeAngularAcceleration(
      angularVelocity,
      moments
    );

    // Build and return the state derivative
    return StateVector.create({
      position: { north: northDot, east: eastDot, down: downDot },
      velocity: { u: uDot, v: vDot, w: wDot },
      attitude: { roll: phiDot, pitch: thetaDot, yaw: psiDot },
      angularVelocity: {
        p: angularAccel.p,
        q: angularAccel.q,
        r: angularAccel.r,
      },
    });
  }

  /**
   * Compute total forces on the aircraft in body axes.
   */
  private computeForces(
    state: StateVector,
    atmosphere: {
      pressure: { value: number };
      density: { value: number };
      temperature: { value: number };
    },
    gravity: { value: number },
    wind: { speed: { value: number }; direction: { value: number } } | null
  ): { x: number; y: number; z: number } {
    const { attitude, velocity } = state;
    const { phi, theta } = attitude;

    // Gravitational force components in body axes
    const weight = this.aircraft.mass * gravity.value;
    const gravityX = -weight * Math.sin(theta.value);
    const gravityY = weight * Math.cos(theta.value) * Math.sin(phi.value);
    const gravityZ = weight * Math.cos(theta.value) * Math.cos(phi.value);

    // Aerodynamic forces (simplified model)
    const aeroForces = this.computeAerodynamicForces(state, atmosphere, wind);

    // Propulsion forces (simplified - assume thrust along body x-axis)
    const thrust = this.computeThrust(state, atmosphere);

    return {
      x: gravityX + aeroForces.x + thrust,
      y: gravityY + aeroForces.y,
      z: gravityZ + aeroForces.z,
    };
  }

  /**
   * Compute aerodynamic forces (lift, drag, side force).
   */
  private computeAerodynamicForces(
    state: StateVector,
    atmosphere: { density: { value: number } },
    wind: { speed: { value: number }; direction: { value: number } } | null
  ): { x: number; y: number; z: number } {
    const rho = atmosphere.density.value;
    const V = state.airspeed.value;
    const S = this.aircraft.wingArea;

    // Dynamic pressure
    const qBar = 0.5 * rho * V * V;

    // Angle of attack and sideslip
    const alpha = state.angleOfAttack;
    const beta = state.sideslipAngle;

    // Aerodynamic coefficients (simplified linear model)
    const { CL0, CLalpha, CD0, CDalpha, CYbeta } =
      this.aircraft.aeroCoefficients;

    const CL = CL0 + CLalpha * alpha;
    const CD = CD0 + CDalpha * alpha * alpha; // Parabolic drag polar
    const CY = CYbeta * beta;

    // Forces in stability axes
    const lift = qBar * S * CL;
    const drag = qBar * S * CD;
    const sideForce = qBar * S * CY;

    // Convert to body axes
    const cosAlpha = Math.cos(alpha);
    const sinAlpha = Math.sin(alpha);

    return {
      x: -drag * cosAlpha + lift * sinAlpha, // Body X (forward)
      y: sideForce, // Body Y (right)
      z: -drag * sinAlpha - lift * cosAlpha, // Body Z (down)
    };
  }

  /**
   * Compute propulsion thrust.
   */
  private computeThrust(
    state: StateVector,
    atmosphere: { density: { value: number } }
  ): number {
    // Simplified thrust model - constant thrust for now
    // In a full model, this would depend on throttle setting, airspeed, altitude
    return this.aircraft.maxThrust * 0.7; // 70% throttle
  }

  /**
   * Compute aerodynamic moments (roll, pitch, yaw).
   */
  private computeMoments(
    state: StateVector,
    atmosphere: { density: { value: number } },
    wind: { speed: { value: number }; direction: { value: number } } | null
  ): { l: number; m: number; n: number } {
    const rho = atmosphere.density.value;
    const V = state.airspeed.value;
    const S = this.aircraft.wingArea;
    const b = this.aircraft.wingspan;
    const c = this.aircraft.meanChord;

    // Dynamic pressure
    const qBar = 0.5 * rho * V * V;

    // State variables affecting moments
    const alpha = state.angleOfAttack;
    const beta = state.sideslipAngle;
    const { p, q, r } = state.angularVelocity;

    // Non-dimensional rates
    const pHat = (p.value * b) / (2 * V);
    const qHat = (q.value * c) / (2 * V);
    const rHat = (r.value * b) / (2 * V);

    // Moment coefficients (simplified linear model)
    const {
      Clbeta,
      Clp,
      Clr, // Roll moment
      Cm0,
      Cmalpha,
      Cmq, // Pitch moment
      Cnbeta,
      Cnp,
      Cnr, // Yaw moment
    } = this.aircraft.aeroCoefficients;

    const Cl = Clbeta * beta + Clp * pHat + Clr * rHat;
    const Cm = Cm0 + Cmalpha * alpha + Cmq * qHat;
    const Cn = Cnbeta * beta + Cnp * pHat + Cnr * rHat;

    return {
      l: qBar * S * b * Cl, // Rolling moment
      m: qBar * S * c * Cm, // Pitching moment
      n: qBar * S * b * Cn, // Yawing moment
    };
  }

  /**
   * Compute angular accelerations from moments and inertia.
   */
  private computeAngularAcceleration(
    angularVelocity: {
      p: { value: number };
      q: { value: number };
      r: { value: number };
    },
    moments: { l: number; m: number; n: number }
  ): { p: number; q: number; r: number } {
    const { p, q, r } = angularVelocity;
    const { l, m, n } = moments;
    const { Ixx, Iyy, Izz, Ixz } = this.aircraft.inertia;

    // Euler's equations for rigid body rotation
    // Simplified assuming Ixy = Iyz = 0
    const gamma = Ixx * Izz - Ixz * Ixz;

    const pDot =
      (Izz * l +
        Ixz * n -
        (Izz * (Izz - Iyy) + Ixz * Ixz) * q.value * r.value +
        (Izz * Ixz + Ixz * (Ixx - Iyy)) * p.value * q.value) /
      gamma;

    const qDot =
      (m -
        (Ixx - Izz) * p.value * r.value -
        Ixz * (p.value * p.value - r.value * r.value)) /
      Iyy;

    const rDot =
      (Ixz * l +
        Ixx * n +
        (Ixx * (Ixx - Iyy) + Ixz * Ixz) * p.value * q.value -
        (Ixx * Ixz + Ixz * (Izz - Iyy)) * q.value * r.value) /
      gamma;

    return { p: pDot, q: qDot, r: rDot };
  }
}

export default DynamicsModel;
