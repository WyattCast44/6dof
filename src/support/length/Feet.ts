import Length from "./Length";
import Meters from "./Meters";
import NauticalMiles from "./NauticalMiles";
import Kilometers from "./Kilometers";

class Feet extends Length {
  getStringUnits(): string {
    return "ft";
  }

  toMeters(): Meters {
    return new Meters(this.value * 0.3048);
  }

  toFeet(): Feet {
    return this;
  }

  toNauticalMiles(): NauticalMiles {
    return new NauticalMiles(this.value * 0.0001645788);
  }

  toKilometers(): Kilometers {
    return new Kilometers(this.value * 0.0003048);
  }
}

export default Feet;
