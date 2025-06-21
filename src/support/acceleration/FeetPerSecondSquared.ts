import Acceleration from "./Acceleration";
import MetersPerSecondSquared from "./MetersPerSecondSquared";

class FeetPerSecondSquared extends Acceleration {
  getStringUnits(): string {
    return "ft/s^2";
  }

  toMetersPerSecondSquared(): MetersPerSecondSquared {
    return new MetersPerSecondSquared(this.value * 0.3048);
  }

  toFeetPerSecondSquared(): FeetPerSecondSquared {
    return this;
  }
}

export default FeetPerSecondSquared;
