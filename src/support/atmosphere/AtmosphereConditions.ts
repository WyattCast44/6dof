import type KilogramsPerMeterCubed from "../density/KilogramsPerMeterCubed";
import type Meters from "../length/Meters";
import type NewtonsPerMetersSquared from "../pressure/NewtonsPerMetersSquared";
import type Kelvin from "../temperature/Kelvin";

class AtmosphereConditions {
  constructor(
    public readonly altitude: Meters,
    public readonly temperature: Kelvin,
    public readonly pressure: NewtonsPerMetersSquared,
    public readonly density: KilogramsPerMeterCubed
  ) {}
}

export default AtmosphereConditions;