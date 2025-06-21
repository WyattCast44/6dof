import Celsius from "./Celsius";
import Fahrenheit from "./Fahrenheit";
import Temperature from "./Temperature";

class Kelvin extends Temperature {
    toFahrenheit(): Fahrenheit {
        return new Fahrenheit(this.value * 1.8 - 459.67);
    }

    toCelsius(): Celsius {
        return new Celsius(this.value - 273.15);
    }

    toKelvin(): Kelvin {
        return this;
    }
}

export default Kelvin;