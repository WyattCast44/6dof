import Altitude from "./Altitude";
import AltitudeType from "./AltitudeType";
import Meters from "../length/Meters";
import Feet from "../length/Feet";

class MSL extends Altitude {
    constructor(value: Meters|Feet) {
        super(value instanceof Feet ? value.toMeters() : value, AltitudeType.MSL);
    }
}

export default MSL;