import AircraftDynamicsModel from "../aircraft/AircraftDynamicsModel";
import StateVector from "./StateVector";

/**
 * Simple numerical integrator for aircraft state propagation
 * 
 * This class provides methods to integrate the aircraft state forward in time
 * using the equations of motion from AircraftDynamicsModel.
 * 
 * Currently implements Euler integration method. Future enhancements will
 * include Runge-Kutta 4th order and other advanced integration schemes.
 */
class Integrator {
  constructor(private dynamicsModel: AircraftDynamicsModel) {}

  /**
   * Integrate the aircraft state forward by one time step using Euler method
   * 
   * @param currentState - Current aircraft state
   * @param time - Current simulation time in seconds
   * @param timeStep - Integration time step in seconds
   * @returns New aircraft state after integration
   */
  integrate(
    currentState: StateVector,
    time: number,
    timeStep: number
  ): StateVector {
    // Calculate derivatives at current state
    const derivatives = this.dynamicsModel.calculateStateDerivatives(currentState, time);
    
    // Create new state vector for the next time step
    const newState = new StateVector();
    
    // Integrate translational velocities (Euler method)
    newState.u_b_mps = currentState.u_b_mps + derivatives.u_b_mps * timeStep;
    newState.v_b_mps = currentState.v_b_mps + derivatives.v_b_mps * timeStep;
    newState.w_b_mps = currentState.w_b_mps + derivatives.w_b_mps * timeStep;
    
    // Integrate angular velocities
    newState.p_b_radps = currentState.p_b_radps + derivatives.p_b_radps * timeStep;
    newState.q_b_radps = currentState.q_b_radps + derivatives.q_b_radps * timeStep;
    newState.r_b_radps = currentState.r_b_radps + derivatives.r_b_radps * timeStep;
    
    // Integrate position
    newState.x_n_m = currentState.x_n_m + derivatives.x_n_m * timeStep;
    newState.y_n_m = currentState.y_n_m + derivatives.y_n_m * timeStep;
    newState.z_n_m = currentState.z_n_m + derivatives.z_n_m * timeStep;
    
    // Integrate attitude (Euler angles)
    newState.phi_rad = currentState.phi_rad + derivatives.phi_rad * timeStep;
    newState.theta_rad = currentState.theta_rad + derivatives.theta_rad * timeStep;
    newState.psi_rad = currentState.psi_rad + derivatives.psi_rad * timeStep;
    
    return newState;
  }

  /**
   * Integrate the aircraft state for multiple time steps
   * 
   * @param initialState - Starting aircraft state
   * @param startTime - Starting simulation time
   * @param endTime - Ending simulation time
   * @param timeStep - Integration time step
   * @returns Array of states at each time step
   */
  integrateOverTime(
    initialState: StateVector,
    startTime: number,
    endTime: number,
    timeStep: number
  ): Array<{ time: number; state: StateVector }> {
    const results: Array<{ time: number; state: StateVector }> = [];
    let currentState = initialState;
    let currentTime = startTime;
    
    while (currentTime <= endTime) {
      results.push({ time: currentTime, state: currentState });
      
      if (currentTime < endTime) {
        currentState = this.integrate(currentState, currentTime, timeStep);
      }
      
      currentTime += timeStep;
    }
    
    return results;
  }
}

export default Integrator; 