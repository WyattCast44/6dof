class StateVector {
  /**
   * Velocity components
   */
  // axial velocity components
  public u_b_mps: number = 0;
  // lateral velocity components
  public v_b_mps: number = 0;
  // vertical velocity components
  public w_b_mps: number = 0;

  /**
   * Angular velocity components
   */
  // roll angular velocity
  public p_b_radps: number = 0;
  // pitch angular velocity
  public q_b_radps: number = 0;
  // yaw angular velocity
  public r_b_radps: number = 0;

  /**
   * Euler angles
   */
  // roll angle
  public phi_rad: number = 0;
  // pitch angle
  public theta_rad: number = 0;
  // yaw angle
  public psi_rad: number = 0;

  /**
   * Position components
   */
  // x-axis position
  public x_n_m: number = 0;
  // y-axis position
  public y_n_m: number = 0;
  // z-axis position
  public z_n_m: number = 0;

  constructor() //
  {
    //
  }
}

export default StateVector;