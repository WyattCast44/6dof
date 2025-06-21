import type MetersPerSecondSquared from "../acceleration/MetersPerSecondSquared";
import Feet from "../length/Feet";
import Meters from "../length/Meters";

abstract class GravityModel {
    abstract getGravityAtAltitude(altitude: Feet | Meters): MetersPerSecondSquared;
    abstract getGravityAtSeaLevel(): MetersPerSecondSquared;
}

export default GravityModel;