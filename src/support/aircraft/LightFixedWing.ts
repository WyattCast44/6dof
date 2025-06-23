import MetersSquared from "../area/MetersSquared";
import Meters from "../length/Meters";
import Kilograms from "../mass/Kilograms";
import KilogramsMetersSquared from "../moments/KilogramsMetersSquared";
import AircraftProperties from "./AircraftProperties";

/**
 * Modeled after an F-16 from the source below:
 * 
 * @source AIRCRAFT CONTROL AND SIMULATION, by Stevens and Lewis, third edition, Appendix A
 */
class LightFixedWing extends AircraftProperties {
  constructor(
    mass: Kilograms = new Kilograms(9300),
    rollInertia: KilogramsMetersSquared = new KilogramsMetersSquared(12821),
    pitchInertia: KilogramsMetersSquared = new KilogramsMetersSquared(75674),
    yawInertia: KilogramsMetersSquared = new KilogramsMetersSquared(85552),
    crossProductInertia: KilogramsMetersSquared = new KilogramsMetersSquared(1331),
    wingSpan: Meters = new Meters(9.14),
    wingArea: MetersSquared = new MetersSquared(27.87)
  ) {
    super(mass, rollInertia, pitchInertia, yawInertia, crossProductInertia, wingSpan, wingArea);
  }
}

export default LightFixedWing;