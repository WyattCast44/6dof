import Meters from "../length/Meters";

/**
 * The position vector is a 3D vector that represents the position of the aircraft in 3D space.
 * 
 * Z is the altitude above ground level (AGL) and is positive in the down direction. So an aircraft
 * at 1000 m AGL would have a z value of -1000 m. 0 would be at sea level.
 * 
 * X is the easting and is positive in the east direction.
 * 
 * Y is the northing and is positive in the north direction.
 */
class PositionVector {
    constructor(
        public readonly x: Meters,
        public readonly y: Meters,
        public readonly z: Meters,
    ) {}

    /**
     * Todo - move toward this api for all vectors
     */
    public static from(vector: { x: Meters|number, y: Meters|number, z: Meters|number }): PositionVector {
        let x = vector.x instanceof Meters ? vector.x : new Meters(vector.x);
        let y = vector.y instanceof Meters ? vector.y : new Meters(vector.y);
        let z = vector.z instanceof Meters ? vector.z : new Meters(vector.z);

        return new PositionVector(x, y, z);
    }
}

export default PositionVector;