import MetersPerSecond from "../velocity/MetersPerSecond";

/**
 * The velocity vector is a 3D vector that represents the velocity of the aircraft in 3D space.
 * 
 * U is the velocity in the longitudinal direction (forward) - positive is forward
 * 
 * V is the velocity in the lateral direction (right) - positive is right
 * 
 * W is the velocity in the vertical direction (up) - positive is up
 */
class VelocityVector {
    constructor(
        public readonly u: MetersPerSecond,
        public readonly v: MetersPerSecond,
        public readonly w: MetersPerSecond,
    ) {}
}

export default VelocityVector;