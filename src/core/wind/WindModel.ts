import type MSL from "../altitude/MSL";
import WindField from "./WindField";
import DecayModel from "./DecayModel";

abstract class WindModel {
  constructor(protected decayModel: DecayModel) {}

  abstract getWindAtAltitude(altitude: MSL): WindField;
}

export default WindModel;
