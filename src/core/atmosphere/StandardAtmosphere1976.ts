import AtmosphereModel from "./AtmosphereModel";
import Feet from "../length/Feet";
import Meters from "../length/Meters";
import Celsius from "../temperature/Celsius";
import NewtonsPerMetersSquared from "../pressure/NewtonsPerMetersSquared";
import KilogramsPerMeterCubed from "../density/KilogramsPerMeterCubed";
import Kelvin from "../temperature/Kelvin";
import AtmosphereConditions from "./AtmosphereConditions";

/**
 * Defines a layer of the atmosphere with its base conditions and temperature behavior.
 */
interface AtmosphereLayer {
  /** Base altitude of this layer in meters */
  readonly baseAltitude: number;
  /** Static pressure at base altitude in Pascals */
  readonly basePressure: number;
  /** Static temperature at base altitude in Kelvin */
  readonly baseTemperature: number;
  /** Static density at base altitude in kg/m³ */
  readonly baseDensity: number;
  /** Temperature lapse rate in K/m (0 for isothermal layers) */
  readonly lapseRate: number;
}

/**
 * US Standard Atmosphere 1976 model.
 *
 * Valid altitude range: -610m to 86,000m (-2,000ft to 282,000ft)
 *
 * @see https://en.wikipedia.org/wiki/U.S._Standard_Atmosphere
 * @see https://ntrs.nasa.gov/citations/19770009539
 *
 * @example
 * ```typescript
 * const gravity = new ConstantGravityModel();
 * const atmosphere = new StandardAtmosphere1976(gravity);
 *
 * // Get all conditions at once (most efficient)
 * const conditions = atmosphere.getConditionsAtAltitude(new Meters(10000));
 *
 * // Or get individual properties
 * const temp = atmosphere.getTemperatureAtAltitude(new Feet(35000));
 * ```
 */
class StandardAtmosphere1976 extends AtmosphereModel {
  /** Minimum valid altitude in meters */
  private static readonly MIN_ALTITUDE_M = -610;

  /** Maximum valid altitude in meters */
  private static readonly MAX_ALTITUDE_M = 86000;

  /**
   * Atmosphere layers from the US Standard Atmosphere 1976.
   * Ordered by ascending base altitude for efficient lookup.
   *
   * Layer boundaries are at: 0, 11, 20, 32, 47, 51, 71, 84.852 km
   *
   * Note: The model is extended below sea level to -610m using the same
   * tropospheric lapse rate. This is handled by using 0m as the base
   * and allowing the formulas to extrapolate downward.
   */
  private static readonly LAYERS: readonly AtmosphereLayer[] = [
    {
      // Troposphere: sea level to 11 km
      // Extended below sea level to -610m using the same lapse rate
      baseAltitude: 0,
      basePressure: 101325, // Pa - exact sea level reference
      baseTemperature: 288.15, // K - exact sea level reference (15°C)
      baseDensity: 1.225, // kg/m³ - exact sea level reference
      lapseRate: -0.0065, // K/m
    },
    {
      // Tropopause / Lower Stratosphere (isothermal)
      baseAltitude: 11000,
      basePressure: 22632.1,
      baseTemperature: 216.65,
      baseDensity: 0.363918,
      lapseRate: 0,
    },
    {
      // Upper Stratosphere
      baseAltitude: 20000,
      basePressure: 5474.89,
      baseTemperature: 216.65,
      baseDensity: 0.0880349,
      lapseRate: 0.001,
    },
    {
      // Stratosphere / Stratopause transition
      baseAltitude: 32000,
      basePressure: 868.019,
      baseTemperature: 228.65,
      baseDensity: 0.013225,
      lapseRate: 0.0028,
    },
    {
      // Stratopause (isothermal)
      baseAltitude: 47000,
      basePressure: 110.906,
      baseTemperature: 270.65,
      baseDensity: 0.00142753,
      lapseRate: 0,
    },
    {
      // Mesosphere (lower)
      baseAltitude: 51000,
      basePressure: 66.9389,
      baseTemperature: 270.65,
      baseDensity: 0.000861606,
      lapseRate: -0.0028,
    },
    {
      // Mesosphere (upper)
      baseAltitude: 71000,
      basePressure: 3.95642,
      baseTemperature: 214.65,
      baseDensity: 0.000064211,
      lapseRate: -0.002,
    },
    {
      // Mesopause / Lower Thermosphere (isothermal for this model)
      // Note: Above 86 km, the real atmosphere requires molecular-scale
      // temperature models. This layer provides a simplified extension.
      baseAltitude: 84852,
      basePressure: 0.3734, // Pa - computed from layer 6 equations
      baseTemperature: 186.946, // K - official value
      baseDensity: 0.0000069578, // kg/m³ - derived from ideal gas law
      lapseRate: 0,
    },
  ];

  getTemperatureAtAltitude(altitude: Feet | Meters): Celsius {
    const altitudeM = this.normalizeAltitude(altitude);
    const layer = this.findLayer(altitudeM);
    return this.computeTemperature(altitudeM, layer).toCelsius();
  }

  getPressureAtAltitude(altitude: Feet | Meters): NewtonsPerMetersSquared {
    const altitudeM = this.normalizeAltitude(altitude);
    const layer = this.findLayer(altitudeM);
    const temperature = this.computeTemperature(altitudeM, layer);
    return this.computePressure(altitudeM, layer, temperature);
  }

  getDensityAtAltitude(altitude: Feet | Meters): KilogramsPerMeterCubed {
    const altitudeM = this.normalizeAltitude(altitude);
    const layer = this.findLayer(altitudeM);
    const temperature = this.computeTemperature(altitudeM, layer);
    return this.computeDensity(altitudeM, layer, temperature);
  }

  getConditionsAtAltitude(altitude: Feet | Meters): AtmosphereConditions {
    const altitudeM = this.normalizeAltitude(altitude);
    const layer = this.findLayer(altitudeM);

    const temperature = this.computeTemperature(altitudeM, layer);
    const pressure = this.computePressure(altitudeM, layer, temperature);
    const density = this.computeDensity(altitudeM, layer, temperature);

    return new AtmosphereConditions(altitudeM, temperature, pressure, density);
  }

  /**
   * Convert altitude to Meters and validate it's within range.
   */
  private normalizeAltitude(altitude: Feet | Meters): Meters {
    const altitudeM = altitude instanceof Feet ? altitude.toMeters() : altitude;

    if (
      altitudeM.value < StandardAtmosphere1976.MIN_ALTITUDE_M ||
      altitudeM.value > StandardAtmosphere1976.MAX_ALTITUDE_M
    ) {
      throw new RangeError(
        `Altitude ${altitudeM.value}m is outside the valid range for US Standard Atmosphere 1976. ` +
          `Valid range: ${StandardAtmosphere1976.MIN_ALTITUDE_M}m to ${StandardAtmosphere1976.MAX_ALTITUDE_M}m.`
      );
    }

    return altitudeM;
  }

  /**
   * Find the atmosphere layer containing the given altitude.
   * Uses a simple linear search since we only have 8 layers.
   *
   * For altitudes below sea level (down to -610m), the troposphere
   * layer is used with the same lapse rate, extrapolating downward.
   */
  private findLayer(altitude: Meters): AtmosphereLayer {
    const layers = StandardAtmosphere1976.LAYERS;

    // For negative altitudes, use the troposphere (first layer)
    // The formulas will extrapolate correctly using negative deltaAltitude
    if (altitude.value < 0) {
      return layers[0];
    }

    // Find the highest layer whose base altitude is <= our altitude
    for (let i = layers.length - 1; i >= 0; i--) {
      if (altitude.value >= layers[i].baseAltitude) {
        return layers[i];
      }
    }

    // Should never reach here if normalizeAltitude did its job
    return layers[0];
  }

  /**
   * Calculate temperature at altitude using the layer's lapse rate.
   */
  private computeTemperature(
    altitude: Meters,
    layer: AtmosphereLayer
  ): Kelvin {
    if (layer.lapseRate === 0) {
      // Isothermal layer
      return new Kelvin(layer.baseTemperature);
    }

    const deltaAltitude = altitude.value - layer.baseAltitude;
    const temperature = layer.baseTemperature + layer.lapseRate * deltaAltitude;
    return new Kelvin(temperature);
  }

  /**
   * Calculate pressure at altitude using the barometric formula.
   *
   * For isothermal layers:   P = P₀ · exp(-g·Δh / (R·T))
   * For gradient layers:     P = P₀ · (T/T₀)^(-g / (R·L))
   *
   * Where:
   *   P₀ = base pressure, T₀ = base temperature
   *   g = gravitational acceleration, R = specific gas constant
   *   L = lapse rate, Δh = altitude difference from base
   */
  private computePressure(
    altitude: Meters,
    layer: AtmosphereLayer,
    temperature: Kelvin
  ): NewtonsPerMetersSquared {
    const R = this.getSpecificGasConstant();
    const g = this.gravityModel.getGravityAtAltitude(altitude).value;
    const deltaAltitude = altitude.value - layer.baseAltitude;

    let pressure: number;

    if (layer.lapseRate === 0) {
      // Isothermal: P = P₀ · exp(-g·Δh / (R·T))
      const exponent = (g * deltaAltitude) / (R * temperature.value);
      pressure = layer.basePressure * Math.exp(-exponent);
    } else {
      // Gradient: P = P₀ · (T/T₀)^(-g / (R·L))
      const temperatureRatio = temperature.value / layer.baseTemperature;
      const exponent = g / (R * layer.lapseRate);
      pressure = layer.basePressure * Math.pow(temperatureRatio, -exponent);
    }

    return new NewtonsPerMetersSquared(pressure);
  }

  /**
   * Calculate density at altitude using the barometric formula.
   *
   * For isothermal layers:   ρ = ρ₀ · exp(-g·Δh / (R·T))
   * For gradient layers:     ρ = ρ₀ · (T/T₀)^(-(g/(R·L) + 1))
   */
  private computeDensity(
    altitude: Meters,
    layer: AtmosphereLayer,
    temperature: Kelvin
  ): KilogramsPerMeterCubed {
    const R = this.getSpecificGasConstant();
    const g = this.gravityModel.getGravityAtAltitude(altitude).value;
    const deltaAltitude = altitude.value - layer.baseAltitude;

    let density: number;

    if (layer.lapseRate === 0) {
      // Isothermal: ρ = ρ₀ · exp(-g·Δh / (R·T))
      const exponent = (g * deltaAltitude) / (R * temperature.value);
      density = layer.baseDensity * Math.exp(-exponent);
    } else {
      // Gradient: ρ = ρ₀ · (T/T₀)^(-(g/(R·L) + 1))
      const temperatureRatio = temperature.value / layer.baseTemperature;
      const exponent = g / (R * layer.lapseRate) + 1;
      density = layer.baseDensity * Math.pow(temperatureRatio, -exponent);
    }

    return new KilogramsPerMeterCubed(density);
  }
}

export default StandardAtmosphere1976;