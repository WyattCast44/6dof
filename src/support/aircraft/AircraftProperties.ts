import type MetersSquared from "../area/MetersSquared";
import type Meters from "../length/Meters";
import Kilograms from "../mass/Kilograms";
import type KilogramsMetersSquared from "../moments/KilogramsMetersSquared";

class AircraftProperties {
    public readonly mass: Kilograms;
    public readonly rollInertia: KilogramsMetersSquared;      // Jxx - roll moment of inertia
    public readonly pitchInertia: KilogramsMetersSquared;     // Jyy - pitch moment of inertia
    public readonly yawInertia: KilogramsMetersSquared;       // Jzz - yaw moment of inertia
    public readonly crossProductInertia: KilogramsMetersSquared; // Jxz - cross product of inertia
    public readonly wingSpan: Meters;
    public readonly wingArea: MetersSquared;

    constructor(
        mass: Kilograms,
        rollInertia: KilogramsMetersSquared,
        pitchInertia: KilogramsMetersSquared,
        yawInertia: KilogramsMetersSquared,
        crossProductInertia: KilogramsMetersSquared,
        wingSpan: Meters,
        wingArea: MetersSquared
    ) {
        this.mass = mass;
        this.rollInertia = rollInertia;
        this.pitchInertia = pitchInertia;
        this.yawInertia = yawInertia;
        this.crossProductInertia = crossProductInertia;
        this.wingSpan = wingSpan;
        this.wingArea = wingArea;
    }
}

export default AircraftProperties;