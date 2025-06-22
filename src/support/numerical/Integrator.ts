import AircraftDynamicsModel from "../aircraft/AircraftDynamicsModel";
import Radians from "../angles/Radians";
import EulerAngles from "../attitude/EulerAngles";
import Meters from "../length/Meters";
import RadiansPerSecond from "../rates/RadiansPerSecond";
import MetersPerSecond from "../velocity/MetersPerSecond";
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
    newState.u_b_mps = new MetersPerSecond(currentState.u_b_mps.value + derivatives.u_b_mps.value * timeStep);
    newState.v_b_mps = new MetersPerSecond(currentState.v_b_mps.value + derivatives.v_b_mps.value * timeStep);
    newState.w_b_mps = new MetersPerSecond(currentState.w_b_mps.value + derivatives.w_b_mps.value * timeStep);
    
    // Integrate angular velocities
    newState.rates.roll_p = new RadiansPerSecond(currentState.rates.roll_p.value + derivatives.rates.roll_p.value * timeStep);
    newState.rates.pitch_q = new RadiansPerSecond(currentState.rates.pitch_q.value + derivatives.rates.pitch_q.value * timeStep);
    newState.rates.yaw_r = new RadiansPerSecond(currentState.rates.yaw_r.value + derivatives.rates.yaw_r.value * timeStep);
    
    // Integrate position
    newState.x_n_m = new Meters(currentState.x_n_m.value + derivatives.x_n_m.value * timeStep);
    newState.y_n_m = new Meters(currentState.y_n_m.value + derivatives.y_n_m.value * timeStep);
    newState.z_n_m = new Meters(currentState.z_n_m.value + derivatives.z_n_m.value * timeStep);
    
    // Integrate attitude (Euler angles)
    newState.angles = new EulerAngles(
      new Radians(currentState.angles.bank_phi.value + derivatives.angles.bank_phi.value * timeStep),
      new Radians(currentState.angles.elevation_theta.value + derivatives.angles.elevation_theta.value * timeStep),
      new Radians(currentState.angles.azimuth_psi.value + derivatives.angles.azimuth_psi.value * timeStep)
    );
    
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