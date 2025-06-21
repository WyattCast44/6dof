import Length from "./Length";
import Feet from "./Feet";
import NauticalMiles from "./NauticalMiles";
import Kilometers from "./Kilometers";

class Meters extends Length {
  getStringUnits(): string {
    return "m";
  }

  toMeters(): Meters {
    return this;
  }

  toFeet(): Feet {
    return new Feet(this.value * 3.28084);
  }

  toNauticalMiles(): NauticalMiles {
    return new NauticalMiles(this.value * 0.0005399568);
  }

  toKilometers(): Kilometers {
    return new Kilometers(this.value * 0.001);
  }
}

export default Meters;
