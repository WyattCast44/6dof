import type MSL from "../altitude/MSL";
import EulerAngles from "../attitude/EulerAngles";
import RotationalVelocities from "../attitude/RotationalVelocities";
import Meters from "../length/Meters";
import PositionVector from "../vectors/PositionVector";
import VelocityVector from "../vectors/VelocityVector";
import MetersPerSecond from "../velocity/MetersPerSecond";

/**
 * The state vector holds the current state of the aircraft
 *
 * It stores the position, velocity, attitude, and rotational velocities of the aircraft
 *
 * It is used in the integration process to calculate the next state of the aircraft
 * based on the forces and moments acting on the aircraft and the environment.
 *
 * It does not perform any calculations. It is simply a container for the current state of the aircraft.
 */
class StateVector {
  // Position: 3 x degrees of freedom
  // x = position in the x direction
  // y = position in the y direction
  // z = position in the z direction
  public position: PositionVector;

  // Velocity: 3 x degrees of freedom
  // u = translation velocity in the x direction
  // v = translation velocity in the y direction
  // w = translation velocity in the z direction
  public velocity: VelocityVector;

  // Euler angles: 3 x degrees of freedom
  // roll_phi = roll angle
  // pitch_theta = pitch angle
  // yaw_psi = yaw angle
  public angles: EulerAngles;

  // Rotational velocities: 3 x degrees of freedom
  // roll_p = roll angular velocity, aka roll rate
  // pitch_q = pitch angular velocity, aka pitch rate
  // yaw_r = yaw angular velocity, aka yaw rate
  public rates: RotationalVelocities;

  constructor(
    position: PositionVector = new PositionVector(
      new Meters(0),
      new Meters(0),
      new Meters(0)
    ),
    velocity: VelocityVector = new VelocityVector(
      new MetersPerSecond(0),
      new MetersPerSecond(0),
      new MetersPerSecond(0)
    ),
    angles: EulerAngles = new EulerAngles(0, 0, 0),
    rates: RotationalVelocities = new RotationalVelocities(0, 0, 0)
  ) {
    this.position = position;
    this.velocity = velocity;
    this.angles = angles;
    this.rates = rates;
  }

  static wingsLevelFlight({
    altitude,
    forwardSpeed,
  }: {
    altitude: MSL;
    forwardSpeed: MetersPerSecond;
  }) {
    let position = new PositionVector(
      new Meters(0),
      new Meters(0),
      new Meters(-altitude.value.value) // height above sea level is negative, so we subtract it
    );
    let velocity = new VelocityVector(
      forwardSpeed,
      new MetersPerSecond(0),
      new MetersPerSecond(0)
    );
    let angles = new EulerAngles(0, 0, 0);
    let rates = new RotationalVelocities(0, 0, 0);
    return new StateVector(position, velocity, angles, rates);
  }
}

export default StateVector;
