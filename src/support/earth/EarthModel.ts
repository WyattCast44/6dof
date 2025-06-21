import type AircraftProperties from "../aircraft/AircraftProperties";
import type GravityModel from "../gravity/GravityModel";
import StateVector from "../numerical/StateVector";

class EarthModel {
  public readonly derivativeStateVector: StateVector;

  constructor(
    public readonly time: any, // seconds, scalar
    public readonly gravityModel: GravityModel,
    public readonly aircraftStateVector: StateVector,
    public readonly aircraftProperties: AircraftProperties
  ) {
    this.derivativeStateVector = new StateVector();

    // the z-direction gravity
    let gz_n_mps2 = this.gravityModel.getGravityAtSeaLevel().value;

    /**
     * Resolving gravity in the body-coordinate system
     */
    let gx_b_mps2 = -Math.sin(this.aircraftStateVector.theta_rad) * gz_n_mps2;
    let gy_b_mps2 =
      Math.sin(this.aircraftStateVector.phi_rad) *
      Math.cos(this.aircraftStateVector.theta_rad) *
      gz_n_mps2;
    let gz_b_mps2 =
      Math.cos(this.aircraftStateVector.phi_rad) *
      Math.cos(this.aircraftStateVector.theta_rad) *
      gz_n_mps2;

    /**
     * Stage the external forces variables
     */
    let fx_b_kgmps2 = 0;
    let fy_b_kgmps2 = 0;
    let fz_b_kgmps2 = 0;

    /**
     * Stage the external moments variables
     */
    let l_b_kgm = 0; // roll moment
    let m_b_kgm = 0; // pitch moment
    let n_b_kgm = 0; // yaw moment

    /**
     * Pre-calculate the denominator of the roll and yaw rate equations
     */
    let rollAndYawRateEquationsDenominator =
      this.aircraftProperties.jxx_b_kgm2 * this.aircraftProperties.jzz_b_kgm2 -
      Math.pow(this.aircraftProperties.jxz_b_kgm2, 2);

    /**
     * X-axis (roll axis) velocity equation
     */
    this.derivativeStateVector.u_b_mps = 1 / this.aircraftProperties.mass_kg * (
      fx_b_kgmps2 +
      gy_b_mps2 * this.aircraftStateVector.w_b_mps -
      gz_b_mps2 * this.aircraftStateVector.v_b_mps
    );
  }
}

export default EarthModel;
