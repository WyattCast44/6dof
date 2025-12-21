import Angle from "./Angle";
import Degrees from "./Degrees";

class Radians extends Angle {
  getStringUnits(): string {
    return "rad";
  }

  toDegrees(): Degrees {
    return new Degrees(this.value * 180 / Math.PI);
  }

  toRadians(): Radians {
    return this;
  }

  toString(): string {
    return `${this.value.toFixed(2)} rad`;
  }
}

export default Radians;