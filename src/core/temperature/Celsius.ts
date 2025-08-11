import Fahrenheit from "./Fahrenheit";
import Kelvin from "./Kelvin";
import Temperature from "./Temperature";

class Celsius extends Temperature {
    toFahrenheit(): Fahrenheit {
        return new Fahrenheit(this.value * 9 / 5 + 32);
    }

    toCelsius(): Celsius {
        return this;
    }

    toKelvin(): Kelvin {
        return new Kelvin(this.value + 273.15);
    }
}

export default Celsius;