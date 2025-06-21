import Feet from "./Feet";
import Length from "./Length";
import Meters from "./Meters";
import Kilometers from "./Kilometers";

class NauticalMiles extends Length {
  getStringUnits(): string {
    return "nmi";
  }

  toFeet(): Feet {
    return new Feet(this.value * 6076.1154855643);
  }

  toMeters(): Meters {
    return new Meters(this.value * 1852);
  }

  toNauticalMiles(): NauticalMiles {
    return this;
  }

  toKilometers(): Kilometers {
    return new Kilometers(this.value * 1.852);
  }
}

export default NauticalMiles;
