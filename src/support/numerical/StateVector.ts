import EulerAngles from "../attitude/EulerAngles";
import RotationalVelocities from "../attitude/RotationalVelocities";
import Meters from "../length/Meters";
import MetersPerSecond from "../velocity/MetersPerSecond";

class StateVector {
  // Position
  public x_n_m: Meters;
  public y_n_m: Meters;
  public z_n_m: Meters;

  // Velocity
  public u_b_mps: MetersPerSecond;
  public v_b_mps: MetersPerSecond;
  public w_b_mps: MetersPerSecond;

  // Euler angles
  public angles: EulerAngles;

  // Rotational velocities
  public rates: RotationalVelocities;

  constructor(
    x_n_m: Meters = new Meters(0),
    y_n_m: Meters = new Meters(0),
    z_n_m: Meters = new Meters(0),
    u_b_mps: MetersPerSecond = new MetersPerSecond(0),
    v_b_mps: MetersPerSecond = new MetersPerSecond(0),
    w_b_mps: MetersPerSecond = new MetersPerSecond(0),
    angles: EulerAngles = new EulerAngles(0, 0, 0),
    rates: RotationalVelocities = new RotationalVelocities(0, 0, 0)
  ) {
    this.x_n_m = x_n_m;
    this.y_n_m = y_n_m;
    this.z_n_m = z_n_m;
    this.u_b_mps = u_b_mps;
    this.v_b_mps = v_b_mps;
    this.w_b_mps = w_b_mps;
    this.angles = angles;
    this.rates = rates;
  }
}

export default StateVector;
