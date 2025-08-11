import FeetPerSecond from "./FeetPerSecond";
import MetersPerSecond from "./MetersPerSecond";
import Velocity from "./Velocity";

class Knots extends Velocity {
    getStringUnits(): string {
        return "kn";
    }

    toMetersPerSecond(): MetersPerSecond {
        return new MetersPerSecond(this.value * 0.514444);
    }

    toFeetPerSecond(): FeetPerSecond {
        return new FeetPerSecond(this.value * 1.68781);
    }

    toKnots(): Knots {
        return this;
    }
}

export default Knots;