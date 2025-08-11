import FeetPerSecond from "./FeetPerSecond";
import Knots from "./Knots";
import Velocity from "./Velocity";

class MetersPerSecond extends Velocity {
  getStringUnits(): string {
    return "m/s";
  }

  toFeetPerSecond(): FeetPerSecond {
    return new FeetPerSecond(this.value * 3.28084);
  }

  toMetersPerSecond(): MetersPerSecond {
    return this;
  }

  toKnots(): Knots {
    return new Knots(this.value * 1.94384);
  }
}

export default MetersPerSecond;
