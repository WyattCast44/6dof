import type KilogramsPerMeterCubed from "../density/KilogramsPerMeterCubed";
import type GravityModel from "../gravity/GravityModel";
import type Feet from "../length/Feet";
import type Meters from "../length/Meters";
import type NewtonsPerMetersSquared from "../pressure/NewtonsPerMetersSquared";
import type Celsius from "../temperature/Celsius";

abstract class AtmosphereModel {
  constructor(public gravityModel: GravityModel) {}

  abstract getTemperatureAtAltitude(altitude: Feet | Meters): Celsius;
  abstract getPressureAtAltitude(
    altitude: Feet | Meters
  ): NewtonsPerMetersSquared;
  abstract getDensityAtAltitude(
    altitude: Feet | Meters
  ): KilogramsPerMeterCubed;

  getSpecificGasConstant(): number {
    return 287; // J/(kg·K)
  }
}

export default AtmosphereModel;
