import Meters from "../length/Meters";
import AltitudeType from "./AltitudeType";

class Altitude {
  constructor(public readonly value: Meters, public readonly type: AltitudeType) {
    this.value = value;
    this.type = type;
  }
}

export default Altitude;
