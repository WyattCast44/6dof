import Celsius from "./Celsius";
import Fahrenheit from "./Fahrenheit";

abstract class Temperature {
  constructor(public readonly value: number) {}

  abstract toFahrenheit(): any;
  abstract toCelsius(): any;
  abstract toKelvin(): any;

  static standardSeaLevelFahrenheit(): any {
    return new Fahrenheit(68);
  }

  static standardSeaLevelCelsius(): any {
    return new Celsius(20);
  }
}

export default Temperature;
