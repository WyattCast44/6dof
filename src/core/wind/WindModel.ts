import MSL from "../altitude/MSL";
import WindField from "./WindField";
import DecayModel from "./DecayModel";
import type Meters from "../length/Meters";
import AtmosphereModel from "../atmosphere/AtmosphereModel";
import LinearDecayModel from "./LinearDecayModel";
import type Feet from "../length/Feet";

export type WindModelProps = {
  decayModel: DecayModel;
  atmosphereModel: AtmosphereModel;
};

abstract class WindModel {
  /**
   * The decay model to use for the wind model.
   * 
   * Will be used to decay the wind speed with altitude. For
   * example, a linear decay model will decay the wind speed
   * linearly with altitude.
   */
  protected readonly decayModel: DecayModel;

  /**
   * The atmosphere model to use for the wind model.
   * 
   * Will be used to get the atmosphere conditions at a given altitude.
   */
  protected readonly atmosphereModel: AtmosphereModel;

  /**
   * Constructor for the wind model.
   * 
   * @remarks
   * The wind model is a base class for all wind models.
   * It is used to get the wind at a given altitude. It is abstract
   * and must be implemented by the concrete wind models.
   * 
   * @param props - The properties to use for the wind model.
   */
  constructor(props: WindModelProps) {
    this.decayModel = props.decayModel;
    this.atmosphereModel = props.atmosphereModel;
  }

  /**
   * Get the wind at a given altitude.
   *
   * @param altitude - The altitude to get the wind at.
   * @returns The wind at the altitude.
   */
  abstract getWindAtAltitude(altitude: MSL | Feet | Meters): WindField;

  /**
   * Check if there is any wind data available.
   *
   * @returns True if there is any wind data available, false otherwise.
   */
  abstract hasWindData(): boolean;

  /**
   * Get the minimum altitude of the wind data.
   *
   * @returns The minimum altitude of the wind data.
   */
  abstract getMinAltitude(): Meters;

  /**
   * Get the maximum altitude of the wind data.
   *
   * @returns The maximum altitude of the wind data.
   */
  abstract getMaxAltitude(): Meters;
}

export default WindModel;
