import type AtmosphereModel from "../atmosphere/AtmosphereModel";
import type GravityModel from "../gravity/GravityModel";
import WindModel from "../wind/WindModel";

class Environment {
  constructor(
    public readonly gravity: GravityModel,
    public readonly atmosphere: AtmosphereModel,
    public readonly wind: WindModel
  ) {}
}

export default Environment;
