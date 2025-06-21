import Knots from "./Knots";
import MetersPerSecond from "./MetersPerSecond";
import Velocity from "./Velocity";

class FeetPerSecond extends Velocity {
  getStringUnits(): string {
    return "ft/s";
  }

  toMetersPerSecond(): MetersPerSecond {
    return new MetersPerSecond(this.value * 0.3048);
  }

  toFeetPerSecond(): FeetPerSecond {
    return this;
  }

  toKnots(): Knots {
    return new Knots(this.value * 0.592484);
  }
}

export default FeetPerSecond;
