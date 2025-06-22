import AircraftProperties from "./AircraftProperties";
import Environment from "../enviroment/Enviroment";
import StateVector from "../numerical/StateVector";
import Meters from "../length/Meters";

/**
 * AircraftDynamicsModel - 6-Degrees of Freedom Aircraft Dynamics Model
 * 
 * This class implements the 6-DOF equations of motion for aircraft flight dynamics.
 * It calculates the time derivatives of the aircraft's state vector based on the
 * current state, aircraft properties, and environmental conditions.
 * 
 * The model currently implements:
 * - Translational motion equations (force equations)
 * - Gravity resolution from navigation to body frame
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

        // 1. Resolve gravity in body frame
        const gravityBody = this.resolveGravityInBodyFrame(currentState);

        // 2. Calculate translational accelerations (force equations)
        derivatives.u_b_mps = this.calculateAxialAcceleration(currentState, gravityBody);
        derivatives.v_b_mps = this.calculateLateralAcceleration(currentState, gravityBody);
        derivatives.w_b_mps = this.calculateNormalAcceleration(currentState, gravityBody);

        // 3. Calculate angular accelerations (moment equations) - currently zero
        derivatives.p_b_radps = 0; // Roll acceleration
        derivatives.q_b_radps = 0; // Pitch acceleration  
        derivatives.r_b_radps = 0; // Yaw acceleration

        // 4. Calculate position rates (kinematic equations)
        derivatives.x_n_m = this.calculateNorthVelocity(currentState);
        derivatives.y_n_m = this.calculateEastVelocity(currentState);
        derivatives.z_n_m = this.calculateDownVelocity(currentState);

        // 5. Calculate attitude rates (kinematic equations)
        derivatives.phi_rad = currentState.p_b_radps;   // Roll rate
        derivatives.theta_rad = currentState.q_b_radps; // Pitch rate
        derivatives.psi_rad = currentState.r_b_radps;   // Yaw rate

        return derivatives;
    }

    /**
     * Resolve gravity from navigation frame to body frame
     */
    private resolveGravityInBodyFrame(state: StateVector): {
        x: number;
        y: number;
        z: number;
    } {
        // Get gravity at current altitude
        const altitude = new Meters(-state.z_n_m); // Convert to positive altitude
        const gravityMagnitude = this.environment.gravityModel.getGravityAtAltitude(altitude).value;

        // Transform gravity from navigation frame (downward) to body frame
        const gx_b = -Math.sin(state.theta_rad) * gravityMagnitude;
        const gy_b = Math.sin(state.phi_rad) * Math.cos(state.theta_rad) * gravityMagnitude;
        const gz_b = Math.cos(state.phi_rad) * Math.cos(state.theta_rad) * gravityMagnitude;

        return { x: gx_b, y: gy_b, z: gz_b };
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
               state.r_b_radps * state.v_b_mps - 
               state.q_b_radps * state.w_b_mps;
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
               state.p_b_radps * state.w_b_mps - 
               state.r_b_radps * state.u_b_mps;
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
               state.q_b_radps * state.u_b_mps - 
               state.p_b_radps * state.v_b_mps;
    }

    /**
     * Calculate North velocity component in navigation frame
     */
    private calculateNorthVelocity(state: StateVector): number {
        // Transform body velocities to navigation frame
        const cosTheta = Math.cos(state.theta_rad);
        const sinTheta = Math.sin(state.theta_rad);
        const cosPsi = Math.cos(state.psi_rad);
        const sinPsi = Math.sin(state.psi_rad);
        const cosPhi = Math.cos(state.phi_rad);
        const sinPhi = Math.sin(state.phi_rad);

        return state.u_b_mps * (cosTheta * cosPsi) +
               state.v_b_mps * (sinPhi * sinTheta * cosPsi - cosPhi * sinPsi) +
               state.w_b_mps * (cosPhi * sinTheta * cosPsi + sinPhi * sinPsi);
    }

    /**
     * Calculate East velocity component in navigation frame
     */
    private calculateEastVelocity(state: StateVector): number {
        // Transform body velocities to navigation frame
        const cosTheta = Math.cos(state.theta_rad);
        const sinTheta = Math.sin(state.theta_rad);
        const cosPsi = Math.cos(state.psi_rad);
        const sinPsi = Math.sin(state.psi_rad);
        const cosPhi = Math.cos(state.phi_rad);
        const sinPhi = Math.sin(state.phi_rad);

        return state.u_b_mps * (cosTheta * sinPsi) +
               state.v_b_mps * (sinPhi * sinTheta * sinPsi + cosPhi * cosPsi) +
               state.w_b_mps * (cosPhi * sinTheta * sinPsi - sinPhi * cosPsi);
    }

    /**
     * Calculate Down velocity component in navigation frame
     */
    private calculateDownVelocity(state: StateVector): number {
        // Transform body velocities to navigation frame
        const cosTheta = Math.cos(state.theta_rad);
        const sinTheta = Math.sin(state.theta_rad);
        const cosPhi = Math.cos(state.phi_rad);
        const sinPhi = Math.sin(state.phi_rad);

        return state.u_b_mps * (-sinTheta) +
               state.v_b_mps * (sinPhi * cosTheta) +
               state.w_b_mps * (cosPhi * cosTheta);
    }
}

export default AircraftDynamicsModel;