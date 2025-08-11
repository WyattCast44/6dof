import Altitude from "./Altitude";
import AltitudeType from "./AltitudeType";
import Meters from "../length/Meters";
import Feet from "../length/Feet";

class AGL extends Altitude {
    constructor(value: Meters|Feet) {
        super(value instanceof Feet ? value.toMeters() : value, AltitudeType.AGL);
    }
}

export default AGL;