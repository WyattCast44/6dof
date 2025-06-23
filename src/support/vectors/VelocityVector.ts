import MetersPerSecond from "../velocity/MetersPerSecond";

class VelocityVector {
    constructor(
        public readonly u: MetersPerSecond,
        public readonly v: MetersPerSecond,
        public readonly w: MetersPerSecond,
    ) {}
}

export default VelocityVector;