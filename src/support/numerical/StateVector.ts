import EulerAngles from "../attitude/EulerAngles";
import RotationalVelocities from "../attitude/RotationalVelocities";
import Meters from "../length/Meters";
import PositionVector from "../vectors/PositionVector";
import VelocityVector from "../vectors/VelocityVector";
import MetersPerSecond from "../velocity/MetersPerSecond";

class StateVector {
  // Position
  public position: PositionVector;

  // Velocity
  public velocity: VelocityVector;

  // Euler angles
  public angles: EulerAngles;

  // Rotational velocities
  public rates: RotationalVelocities;

  constructor(
    position: PositionVector = new PositionVector(new Meters(0), new Meters(0), new Meters(0)),
    velocity: VelocityVector = new VelocityVector(new MetersPerSecond(0), new MetersPerSecond(0), new MetersPerSecond(0)),
    angles: EulerAngles = new EulerAngles(0, 0, 0),
    rates: RotationalVelocities = new RotationalVelocities(0, 0, 0)
  ) {
    this.position = position;
    this.velocity = velocity;
    this.angles = angles;
    this.rates = rates;
  }
}

export default StateVector;
