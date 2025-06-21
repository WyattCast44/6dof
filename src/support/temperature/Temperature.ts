import Celsius from "./Celsius";
import Fahrenheit from "./Fahrenheit";

abstract class Temperature {
  public readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

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
