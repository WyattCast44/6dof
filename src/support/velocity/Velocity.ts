import FeetPerSecond from "./FeetPerSecond";
import Knots from "./Knots";
import MetersPerSecond from "./MetersPerSecond";

abstract class Velocity {
    public readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    abstract getStringUnits(): string;
    
    abstract toKnots(): Knots;
    abstract toFeetPerSecond(): FeetPerSecond;
    abstract toMetersPerSecond(): MetersPerSecond;
}

export default Velocity;