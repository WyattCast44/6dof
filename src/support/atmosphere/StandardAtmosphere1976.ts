import AtmosphereModel from "./AtmosphereModel";
import Feet from "../length/Feet";
import Meters from "../length/Meters";
import Celsius from "../temperature/Celsius";
import NewtonsPerMetersSquared from "../pressure/NewtonsPerMetersSquared";
import KilogramsPerMeterCubed from "../density/KilogramsPerMeterCubed";
import Kelvin from "../temperature/Kelvin";

type Region = {
  start: number; // m
  end: number; // m
  staticPressure: number; // Pa
  staticTemperature: number; // K
  staticDensity: number; // kg/m^3
  temperatureGradient: number; // K/m
  isIsothermic: boolean;
};

/**
 * @source https://en.wikipedia.org/wiki/U.S._Standard_Atmosphere
 * @source https://www.digitaldutch.com/atmoscalc/table.htm
 */
const regions: Record<number, Region> = {
  0: {
    start: 0, // m
    end: 10999, // m
    staticPressure: 101325, // Pa
    staticTemperature: 288.15, // K
    staticDensity: 1.225,
    temperatureGradient: -0.0065, // K/m
    isIsothermic: false,
  },
  1: {
    start: 11000, // m
    end: 19999, // m
    staticPressure: 22632.1, // Pa
    staticTemperature: 216.65, // K
    staticDensity: 0.363918,
    temperatureGradient: 0, // K/m
    isIsothermic: true,
  },
  2: {
    start: 20000, // m
    end: 31999, // m
    staticPressure: 5474.89, // Pa
    staticTemperature: 216.65, // K
    staticDensity: 0.0880349,
    temperatureGradient: 0.001, // K/m
    isIsothermic: false,
  },
  3: {
    start: 32000, // m
    end: 46999, // m
    staticPressure: 868.019, // Pa
    staticTemperature: 228.65, // K
    staticDensity: 0.013225,
    temperatureGradient: 0.0028, // K/m
    isIsothermic: false,
  },
  4: {
    start: 47000, // m
    end: 50999, // m
    staticPressure: 110.906, // Pa
    staticTemperature: 270.65, // K
    staticDensity: 0.00142753,
    temperatureGradient: 0, // K/m
    isIsothermic: true,
  },
  5: {
    start: 51000, // m
    end: 70999, // m
    staticPressure: 66.9389, // Pa
    staticTemperature: 270.65, // K
    staticDensity: 0.000861606,
    temperatureGradient: -0.0028, // K/m
    isIsothermic: false,
  },
  6: {
    start: 71000, // m
    end: 84851, // m
    staticPressure: 3.95642, // Pa
    staticTemperature: 214.65, // K
    staticDensity: 0.000064211,
    temperatureGradient: -0.002, // K/m
    isIsothermic: false,
  },
  7: {
    start: 84852, // m
    end: Infinity, // m
    staticPressure: 0.435981, // Pa
    staticTemperature: 186.946, // K
    staticDensity: 0.00000805098,
    temperatureGradient: 0, // K/m
    isIsothermic: true,
  },
};

class StandardAtmosphere1976 extends AtmosphereModel {
  getTemperatureAtAltitude(altitude: Feet | Meters): Celsius {
    altitude = altitude instanceof Feet ? altitude.toMeters() : altitude;
    const region = this.getRegion(altitude);
    const temperature = this.calculateTemperatureAtAltitude(altitude, region);
    return temperature.toCelsius();
  }

  getPressureAtAltitude(altitude: Feet | Meters): NewtonsPerMetersSquared {
    altitude = altitude instanceof Feet ? altitude.toMeters() : altitude;
    const region = this.getRegion(altitude);
    const temperature = this.calculateTemperatureAtAltitude(altitude, region);
    return this.calculatePressureAtAltitude(altitude, region, temperature);
  }

  getDensityAtAltitude(altitude: Feet | Meters): KilogramsPerMeterCubed {
    altitude = altitude instanceof Feet ? altitude.toMeters() : altitude;
    const region = this.getRegion(altitude);
    const temperature = this.calculateTemperatureAtAltitude(altitude, region);
    return this.calculateDensityAtAltitude(altitude, region, temperature);
  }

  private getRegion(altitude: Meters): Region {
    const altitudeValue = altitude.value;
    const regionKeys = Object.keys(regions)
      .map(Number)
      .sort((a, b) => a - b);
    let left = 0;
    let right = regionKeys.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const region = regions[regionKeys[mid]];

      if (altitudeValue >= region.start && altitudeValue <= region.end) {
        return region;
      } else if (altitudeValue < region.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // if we get here, the altitude is outside the range of the standard atmosphere
    throw new Error("Altitude is outside the range of the standard atmosphere");
  }

  private calculateTemperatureAtAltitude(
    altitude: Meters,
    region: Region
  ): Kelvin {
    // if the region is isothermic, return the static temperature
    if (region.isIsothermic) {
      return new Kelvin(region.staticTemperature);
    }

    // if it's not isothermic, we need to calculate the temperature
    // using the temperature gradient and the static temperature
    const temperatureGradient = region.temperatureGradient;
    const staticTemperature = region.staticTemperature;
    const temperature =
      staticTemperature + temperatureGradient * (altitude.value - region.start);
    return new Kelvin(temperature);
  }

  private calculatePressureAtAltitude(
    altitude: Meters,
    region: Region,
    temperature: Kelvin
  ): NewtonsPerMetersSquared {
    const specificGasConstant = this.getSpecificGasConstant();
    const gravity = this.gravityModel.getGravityAtAltitude(altitude).value; // m/s^2
    let pressure = 0;

    if (!region.isIsothermic) {
      // p = p0 * (T/T0)^-(g/(R*lapseRate))
      let lapseRate = region.temperatureGradient;
      let exponent = gravity / (specificGasConstant * lapseRate);
      let temperatureRatio = temperature.value / region.staticTemperature;
      pressure = region.staticPressure * Math.pow(temperatureRatio, -exponent);
    } else {
      // p = p0 * e^-(g/(R*lapseRate))*(altitude - startAltitude)
      let altitudeDifference = altitude.value - region.start;
      let exponent =
        (gravity / (specificGasConstant * temperature.value)) *
        altitudeDifference;
      pressure = region.staticPressure * Math.pow(Math.E, -exponent);
    }

    return new NewtonsPerMetersSquared(pressure);
  }

  private calculateDensityAtAltitude(
    altitude: Meters,
    region: Region,
    temperature: Kelvin
  ): KilogramsPerMeterCubed {
    const specificGasConstant = this.getSpecificGasConstant();
    const gravity = this.gravityModel.getGravityAtAltitude(altitude).value; // m/s^2
    let density = 0;

    if (!region.isIsothermic) {
      // rho = rho0 * (T/T0)^-((g/(R*lapseRate)) + 1)
      let lapseRate = region.temperatureGradient;
      let rho0 = region.staticDensity;
      let exponent = -(gravity / (specificGasConstant * lapseRate) + 1);
      let temperatureRatio = temperature.value / region.staticTemperature;
      density = rho0 * Math.pow(temperatureRatio, exponent);
    } else {
      // rho = rho0*e^-(g/(R*T))*(altitude - startAltitude)
      let altitudeDifference = altitude.value - region.start;
      let exponent =
        (gravity / (specificGasConstant * temperature.value)) *
        altitudeDifference;
      density = region.staticDensity * Math.pow(Math.E, -exponent);
    }

    return new KilogramsPerMeterCubed(density);
  }
}

export default StandardAtmosphere1976;
