import Meters from "../length/Meters";

class PositionVector {
    constructor(
        public readonly x: Meters,
        public readonly y: Meters,
        public readonly z: Meters,
    ) {}

    /**
     * Todo - move toward this api for all vectors
     * 
     * @param vector 
     * @returns 
     */
    public static from(vector: { x: Meters|number, y: Meters|number, z: Meters|number }): PositionVector {
        let x = vector.x instanceof Meters ? vector.x : new Meters(vector.x);
        let y = vector.y instanceof Meters ? vector.y : new Meters(vector.y);
        let z = vector.z instanceof Meters ? vector.z : new Meters(vector.z);

        return new PositionVector(x, y, z);
    }
}

export default PositionVector;