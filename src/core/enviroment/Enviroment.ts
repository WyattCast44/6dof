import type AtmosphereModel from "../atmosphere/AtmosphereModel";
import type GravityModel from "../gravity/GravityModel";
import WindModel from "../wind/WindModel";

class Environment {
  constructor(
    public readonly gravityModel: GravityModel,
    public readonly atmosphereModel: AtmosphereModel,
    public readonly windModel: WindModel
  ) {}
}

export default Environment;
