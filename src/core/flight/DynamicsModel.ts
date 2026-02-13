import StateVector from "../numerical/StateVector";
import type Environment from "../environment/Environment";
import type AircraftProperties from "../aircraft/AircraftProperties";
import type WindField from "../wind/WindField";
import type { ControlInput } from "../aircraft/ControlInput";
import { neutralControls } from "../aircraft/ControlInput";

/**
 * Computes the derivative of aircraft state (equations of motion).
 *
 * ## Frame Conventions
 * - **NED (North-East-Down)** inertial frame for position.
 * - **Body-fixed (forward-right-down)** frame for velocity and angular rates.
 * - Euler angles (φ, θ, ψ) rotate from NED to body via 3-2-1 sequence.
 *
 * ## References
 * - Stevens, Lewis & Johnson, *Aircraft Control and Simulation*, 3rd ed.
 *   - Section 1.3: Coordinate frames and Euler angles
 *   - Section 1.4: Equations of motion (translational + rotational)
 *   - Eq. 1.4-4: NED velocity kinematic equations
 *   - Eq. 1.4-5: Force equations in body frame
 *   - Eq. 1.4-6: Euler kinematic equations
 *   - Eq. 1.4-7: Moment equations (Euler's rotational EOM)
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
  computeDerivative(state: StateVector, time: number, controls: ControlInput = neutralControls()): StateVector {
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
    //    Stevens & Lewis 3rd ed., Eq. 1.4-4
    // =====================================================
    // Transform body velocities to NED frame using the 3-2-1
    // direction cosine matrix (DCM) Cbn = Rz(ψ)·Ry(θ)·Rx(φ)
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
    //    Stevens & Lewis 3rd ed., Eq. 1.4-5
    // =====================================================
    const forces = this.computeForces(state, atmosphere, gravity, wind, controls);
    const mass = this.aircraft.mass.value;

    // Body-axis accelerations including Coriolis terms.
    // Cross-coupling from rotating body frame: ω × v
    // The -(ω×v) terms arise because we express F = m·a in
    // the non-inertial body frame; expanding dv/dt|inertial
    // gives dv/dt|body + ω × v.
    const uDot = forces.x / mass - q.value * w.value + r.value * v.value;
    const vDot = forces.y / mass - r.value * u.value + p.value * w.value;
    const wDot = forces.z / mass - p.value * v.value + q.value * u.value;

    // =====================================================
    // 3. Attitude derivatives (Euler kinematic equations)
    //    Stevens & Lewis 3rd ed., Eq. 1.4-6
    // =====================================================
    // NOTE: Gimbal lock occurs at θ = ±90° (cosθ → 0), causing
    // the tan(θ) and 1/cos(θ) terms to diverge. For aerobatic or
    // high-AoA simulation, replace Euler angles with quaternions
    // (Stevens & Lewis §1.3-18 through §1.3-20).
    const phiDot =
      p.value + sinPhi * tanTheta * q.value + cosPhi * tanTheta * r.value;
    const thetaDot = cosPhi * q.value - sinPhi * r.value;
    const psiDot =
      (sinPhi / cosTheta) * q.value + (cosPhi / cosTheta) * r.value;

    // =====================================================
    // 4. Angular rate derivatives (moments / inertia)
    //    Stevens & Lewis 3rd ed., Eq. 1.4-7
    // =====================================================
    const moments = this.computeMoments(state, atmosphere, wind, controls);
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
    wind: WindField,
    controls: ControlInput
  ): { x: number; y: number; z: number } {
    const { attitude, velocity } = state;
    const { phi, theta } = attitude;

    // Gravitational force resolved into body axes via DCM.
    // Gravity acts purely in NED-down (g_ned = [0, 0, mg]),
    // so body components are just the third column of Cbn:
    //   Fx_grav = -mg·sin(θ)
    //   Fy_grav =  mg·cos(θ)·sin(φ)
    //   Fz_grav =  mg·cos(θ)·cos(φ)
    const weight = this.aircraft.mass.value * gravity.value;
    const gravityX = -weight * Math.sin(theta.value);
    const gravityY = weight * Math.cos(theta.value) * Math.sin(phi.value);
    const gravityZ = weight * Math.cos(theta.value) * Math.cos(phi.value);

    // Aerodynamic forces (simplified model)
    const aeroForces = this.computeAerodynamicForces(state, atmosphere, wind);

    // Propulsion forces (simplified - assume thrust along body x-axis)
    const thrust = this.computeThrust(state, atmosphere, controls);

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
    _wind: WindField
  ): { x: number; y: number; z: number } {
    const rho = atmosphere.density.value;
    const V = state.airspeed.value;
    const S = this.aircraft.wingAreaValue;

    // Dynamic pressure
    const qBar = 0.5 * rho * V * V;

    // Angle of attack and sideslip.
    // Uses atan2(w, u) for α and atan2(v, u) for β — valid for
    // small angles (|α| < ~15°, |β| < ~10°). For large angles,
    // use the full wind-axis formulas with total airspeed V.
    const alpha = state.angleOfAttack;
    const beta = state.sideslipAngle;

    // Linear aero model valid for |α| < ~15° (pre-stall regime).
    // Beyond stall, CL rolls off and CD increases sharply —
    // a lookup table or nonlinear model is needed.
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
    atmosphere: { density: { value: number } },
    controls: ControlInput
  ): number {
    // Simplified thrust model — proportional to throttle setting
    return this.aircraft.maxThrustValue * controls.throttle;
  }

  /**
   * Compute aerodynamic moments (roll, pitch, yaw).
   */
  private computeMoments(
    state: StateVector,
    atmosphere: { density: { value: number } },
    _wind: WindField,
    controls: ControlInput
  ): { l: number; m: number; n: number } {
    const rho = atmosphere.density.value;
    const V = state.airspeed.value;
    const S = this.aircraft.wingAreaValue;
    const b = this.aircraft.wingspan;
    const c = this.aircraft.meanChordValue;

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

    // Control surface effectiveness derivatives
    const Cm_de = -1.5;   // Elevator → pitching moment
    const Cl_da = -0.15;  // Aileron → rolling moment
    const Cn_dr = -0.08;  // Rudder → yawing moment

    const Cl = Clbeta * beta + Clp * pHat + Clr * rHat + Cl_da * controls.aileron;
    const Cm = Cm0 + Cmalpha * alpha + Cmq * qHat + Cm_de * controls.elevator;
    const Cn = Cnbeta * beta + Cnp * pHat + Cnr * rHat + Cn_dr * controls.rudder;

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
