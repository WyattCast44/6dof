import MSL from "../altitude/MSL";
import WindField from "./WindField";
import DecayModel from "./DecayModel";
import AtmosphereModel from "../atmosphere/AtmosphereModel";

export type WindModelProps = {
  atmosphereModel: AtmosphereModel;
  decayModel: DecayModel;
}

abstract class WindModel {
  protected atmosphereModel: AtmosphereModel;
  protected decayModel: DecayModel;

  constructor(props: WindModelProps) {
    this.atmosphereModel = props.atmosphereModel;
    this.decayModel = props.decayModel;
  }

  abstract getWindAtAltitude(altitude: MSL): WindField;
}

export default WindModel;
