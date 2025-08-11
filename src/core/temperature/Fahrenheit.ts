import Celsius from "./Celsius";
import Kelvin from "./Kelvin";
import Temperature from "./Temperature";

class Fahrenheit extends Temperature {
    toFahrenheit(): Fahrenheit {
        return this;
    }

    toCelsius(): Celsius {
        return new Celsius((this.value - 32) * 5 / 9);
    }

    toKelvin(): Kelvin {
        return new Kelvin(this.value + 459.67);
    }
}

export default Fahrenheit;