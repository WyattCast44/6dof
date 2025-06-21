import Acceleration from "./Acceleration";
import FeetPerSecondSquared from "./FeetPerSecondSquared";

class MetersPerSecondSquared extends Acceleration {
  getStringUnits(): string {
    return "m/s^2";
  }

  toFeetPerSecondSquared(): FeetPerSecondSquared {
    return new FeetPerSecondSquared(this.value * 3.28084);
  }

  toMetersPerSecondSquared(): MetersPerSecondSquared {
    return this;
  }
}

export default MetersPerSecondSquared;
