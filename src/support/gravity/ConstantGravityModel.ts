import MetersPerSecondSquared from "../acceleration/MetersPerSecondSquared";
import type Feet from "../length/Feet";
import type Meters from "../length/Meters";
import GravityModel from "./GravityModel";

class ConstantGravityModel extends GravityModel {
    getGravityAtAltitude(_: Feet | Meters): MetersPerSecondSquared {
        return new MetersPerSecondSquared(9.80665);
    }

    getGravityAtSeaLevel(): MetersPerSecondSquared {
        return new MetersPerSecondSquared(9.80665);
    }
}

export default ConstantGravityModel;