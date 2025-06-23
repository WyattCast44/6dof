import AircraftProperties from "./AircraftProperties";
import Environment from "../enviroment/Enviroment";
import StateVector from "../numerical/StateVector";
import Meters from "../length/Meters";
import MetersPerSecond from "../velocity/MetersPerSecond";
import RadiansPerSecond from "../rates/RadiansPerSecond";
import EulerAngles from "../attitude/EulerAngles";
import BodyNedDCM from "../transforms/BodyNedDCM";
import NedVector from "../vectors/NedVector";
import BodyVector from "../vectors/BodyVector";
import VelocityVector from "../vectors/VelocityVector";
import PositionVector from "../vectors/PositionVector";

/**
 * AircraftDynamicsModel - 6-Degrees of Freedom Aircraft Dynamics Model
 * 
 * This class implements the 6-DOF equations of motion for aircraft flight dynamics.
 * It calculates the time derivatives of the aircraft's state vector based on the
 * current state, aircraft properties, and environmental conditions.
 * 
 * The model currently implements:
 * - Translational motion equations (force equations)
 * - Gravity resolution from navigation to body frame using DCMs
 * - Basic rotational motion framework (moments set to zero)
 * 
 * Future enhancements will include:
 * - Aerodynamic forces (lift, drag, side force)
 * - Control surface effects (elevator, aileron, rudder)
 * - Propulsion effects (thrust, torque)
 * - Atmospheric effects (density, wind)
 */
class AircraftDynamicsModel {
    constructor(
        public readonly aircraftProperties: AircraftProperties,
        public readonly environment: Environment
    ) {}

    /**
     * Calculate the time derivatives of the aircraft state vector
     * 
     * @param currentState - Current aircraft state (position, velocity, attitude)
     * @param time - Current simulation time in seconds
     * @returns StateVector containing the time derivatives
     */
    calculateStateDerivatives(
        currentState: StateVector,
        time: number
    ): StateVector {
        const derivatives = new StateVector();

        console.debug("Calculating state derivatives at time", time);

        // 1. Resolve gravity in body frame using DCM
        const gravityBody = this.resolveGravityInBodyFrame(currentState);

        // 2. Calculate translational accelerations (force equations)
        derivatives.velocity = new VelocityVector(
            new MetersPerSecond(this.calculateAxialAcceleration(currentState, gravityBody)),
            new MetersPerSecond(this.calculateLateralAcceleration(currentState, gravityBody)),
            new MetersPerSecond(this.calculateNormalAcceleration(currentState, gravityBody))
        );

        // 3. Calculate angular accelerations (moment equations) - currently zero
        derivatives.rates.roll_p = new RadiansPerSecond(0); // Roll acceleration
        derivatives.rates.pitch_q = new RadiansPerSecond(0); // Pitch acceleration  
        derivatives.rates.yaw_r = new RadiansPerSecond(0); // Yaw acceleration

        // 4. Calculate position rates (kinematic equations) using DCM
        const velocityNed = this.calculateVelocityInNedFrame(currentState);
        derivatives.position = new PositionVector(
            new Meters(velocityNed.north), // North velocity
            new Meters(velocityNed.east), // East velocity
            new Meters(velocityNed.down) // Down velocity
        );

        // 5. Calculate attitude rates (kinematic equations)
        // The attitude rates are the angular velocities (p, q, r)
        derivatives.angles = new EulerAngles(
            currentState.rates.roll_p.value,   // Roll rate (p)
            currentState.rates.pitch_q.value,  // Pitch rate (q)
            currentState.rates.yaw_r.value     // Yaw rate (r)
        );

        return derivatives;
    }

    /**
     * Resolve gravity from navigation frame to body frame using DCM
     */
    private resolveGravityInBodyFrame(state: StateVector): {
        x: number;
        y: number;
        z: number;
    } {
        // Get gravity at current altitude
        const altitude = new Meters(-state.position.z.value); // Convert to positive altitude
        const gravityMagnitude = this.environment.gravityModel.getGravityAtAltitude(altitude).value;

        // Use DCM to transform gravity from NED to body frame
        const nedToBodyDCM = new BodyNedDCM(state.angles);
        const gravityBody = nedToBodyDCM.transformToBody(new NedVector(0, 0, gravityMagnitude));

        return { 
            x: gravityBody.x, 
            y: gravityBody.y, 
            z: gravityBody.z 
        };
    }

    /**
     * Calculate velocity in NED frame using DCM
     */
    private calculateVelocityInNedFrame(state: StateVector): NedVector {
        const bodyToNedDCM = new BodyNedDCM(state.angles);

        return bodyToNedDCM.transformFromBody(new BodyVector(state.velocity.u.value, state.velocity.v.value, state.velocity.w.value));
    }

    /**
     * Calculate axial acceleration (X-axis force equation)
     * du/dt = (Fx/m) + gx + r*v - q*w
     */
    private calculateAxialAcceleration(
        state: StateVector,
        gravityBody: { x: number; y: number; z: number }
    ): number {
        const mass = this.aircraftProperties.mass.value;
        const fx = 0; // External force in X direction (aerodynamic + thrust) - currently zero
        
        return (fx / mass) + 
               gravityBody.x + 
               state.rates.yaw_r.value * state.velocity.v.value - 
               state.rates.pitch_q.value * state.velocity.w.value;
    }

    /**
     * Calculate lateral acceleration (Y-axis force equation)
     * dv/dt = (Fy/m) + gy + p*w - r*u
     */
    private calculateLateralAcceleration(
        state: StateVector,
        gravityBody: { x: number; y: number; z: number }
    ): number {
        const mass = this.aircraftProperties.mass.value;
        const fy = 0; // External force in Y direction (side force) - currently zero
        
        return (fy / mass) + 
               gravityBody.y + 
               state.rates.roll_p.value * state.velocity.w.value - 
               state.rates.yaw_r.value * state.velocity.u.value;
    }

    /**
     * Calculate normal acceleration (Z-axis force equation)
     * dw/dt = (Fz/m) + gz + q*u - p*v
     */
    private calculateNormalAcceleration(
        state: StateVector,
        gravityBody: { x: number; y: number; z: number }
    ): number {
        const mass = this.aircraftProperties.mass.value;
        const fz = 0; // External force in Z direction (lift) - currently zero
        
        return (fz / mass) + 
               gravityBody.z + 
               state.rates.pitch_q.value * state.velocity.u.value - 
               state.rates.roll_p.value * state.velocity.v.value;
    }
}

export default AircraftDynamicsModel;