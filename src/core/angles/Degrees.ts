import Radians from "./Radians";
import Angle from "./Angle";

class Degrees extends Angle {
  getStringUnits(): string {
    return "°";
  }

  toDegrees(): Degrees {
    return this;
  }

  toRadians(): Radians {
    return new Radians(this.value * Math.PI / 180);
  }

  toString(): string {
    return `${this.value.toFixed(2)}°`;
  }
}

export default Degrees;