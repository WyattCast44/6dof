import Feet from "./Feet";
import Length from "./Length";
import Meters from "./Meters";
import NauticalMiles from "./NauticalMiles";

class Kilometers extends Length {
  getStringUnits(): string {
    return "km";
  }

  toFeet(): Feet {
    return new Feet(this.value * 3280.84);
  }

  toMeters(): Meters {
    return new Meters(this.value * 1000);
  }

  toNauticalMiles(): NauticalMiles {
    return new NauticalMiles(this.value * 0.5399568);
  }

  toKilometers(): Kilometers {
    return this;
  }
}

export default Kilometers;