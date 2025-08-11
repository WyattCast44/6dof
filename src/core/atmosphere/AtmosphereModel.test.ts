import { describe, it, expect, beforeEach } from "vitest";
import StandardAtmosphere1976 from "./StandardAtmosphere1976";
import ConstantGravityModel from "../gravity/ConstantGravityModel";
import Feet from "../length/Feet";
import Meters from "../length/Meters";
import { round } from "../helpers/math";

describe("StandardAtmosphere1976", () => {
  let atmosphere: StandardAtmosphere1976;
  let gravityModel: ConstantGravityModel;

  beforeEach(() => {
    gravityModel = new ConstantGravityModel();
    atmosphere = new StandardAtmosphere1976(gravityModel);
  });

  describe("constructor", () => {
    it("should create a StandardAtmosphere1976 instance with gravity model", () => {
      expect(atmosphere).toBeInstanceOf(StandardAtmosphere1976);
      expect(atmosphere.gravityModel).toBe(gravityModel);
    });

    it("should have the correct specific gas constant", () => {
      expect(atmosphere.getSpecificGasConstant()).toBe(287);
    });
  });

  describe("Region 0: Troposphere (0-11,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return 15°C at sea level (0m)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(new Meters(0));
        expect(temperature.value).toBeCloseTo(15, 1);
      });

      it("should return 15°C at sea level (0ft)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(new Feet(0));
        expect(temperature.value).toBeCloseTo(15, 1);
      });

      it("should calculate temperature at 5000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(5000)
        );
        // T = 288.15 + (-0.0065) * 5000 = 288.15 - 32.5 = 255.65K = -17.5°C
        expect(temperature.value).toBeCloseTo(-17.5, 1);
      });

      it("should calculate temperature at 10000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(10000)
        );
        // T = 288.15 + (-0.0065) * 10000 = 288.15 - 65 = 223.15K = -50°C
        expect(temperature.value).toBeCloseTo(-50, 1);
      });

      it("should calculate temperature at 10999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(10999)
        );
        // T = 288.15 + (-0.0065) * 10999 = 288.15 - 71.49 = 216.66K = -56.49°C
        expect(temperature.value).toBeCloseTo(-56.49, 1);
      });
    });

    describe("getPressureAtAltitude", () => {
      it("should return 101325 Pa at sea level", () => {
        const pressure = atmosphere.getPressureAtAltitude(new Meters(0));
        expect(pressure.value).toBeCloseTo(101325, 0);
      });

      it("should calculate pressure at 5000m correctly", () => {
        const pressure = atmosphere.getPressureAtAltitude(new Meters(5000));
        let expected = 54020;
        let actual = round(pressure.value, 0);
        let diff = Math.abs(expected - actual);
        expect(diff).toBeLessThan(10);
      });

      it("should calculate pressure at 10000m correctly", () => {
        const pressure = atmosphere.getPressureAtAltitude(new Meters(10_000));
        let expected = 26436;
        let actual = round(pressure.value, 0);
        let diff = Math.abs(expected - actual);
        expect(diff).toBeLessThan(10);
      });
    });

    describe("getDensityAtAltitude", () => {
      it("should return 1.225 kg/m³ at sea level", () => {
        const density = atmosphere.getDensityAtAltitude(new Meters(0));
        expect(density.value).toBeCloseTo(1.225, 3);
      });

      it("should calculate density at 5000m correctly", () => {
        const density = atmosphere.getDensityAtAltitude(new Meters(5000));
        expect(density.value).toBeCloseTo(0.736, 3);
      });

      it("should calculate density at 10000m correctly", () => {
        const density = atmosphere.getDensityAtAltitude(new Meters(10000));
        expect(density.value).toBeCloseTo(0.414);
      });
    });
  });

  describe("Region 1: Lower Stratosphere (11,000-20,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -56.5°C at 11000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(11000)
        );
        expect(temperature.value).toBeCloseTo(-56.5, 1);
      });

      it("should return -56.5°C at 15000m (isothermal region)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(15000)
        );
        expect(temperature.value).toBeCloseTo(-56.5, 1);
      });

      it("should return -56.5°C at 19999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(19999)
        );
        expect(temperature.value).toBeCloseTo(-56.5, 1);
      });
    });

    describe("getPressureAtAltitude", () => {
      it("should calculate pressure at 15000m correctly", () => {
        const pressure = atmosphere.getPressureAtAltitude(new Meters(15000));
        let expected = 12044;
        let actual = round(pressure.value, 0);
        let diff = Math.abs(expected - actual);
        expect(diff).toBeLessThan(2);
      });
    });

    describe("getDensityAtAltitude", () => {
      it("should calculate density at 15000m correctly", () => {
        const density = atmosphere.getDensityAtAltitude(new Meters(15000));
        expect(density.value).toBeCloseTo(0.194, 3);
      });
    });
  });

  describe("Region 2: Upper Stratosphere (20,000-32,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -56.5°C at 20000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(20000)
        );
        expect(temperature.value).toBeCloseTo(-56.5, 1);
      });

      it("should calculate temperature at 25000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(25000)
        );
        // T = 216.65 + 0.001 * 5000 = 216.65 + 5 = 221.65K = -51.5°C
        expect(temperature.value).toBeCloseTo(-51.5, 1);
      });

      it("should calculate temperature at 31999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(31999)
        );
        // T = 216.65 + 0.001 * 11999 = 216.65 + 12 = 228.65K = -44.5°C
        expect(temperature.value).toBeCloseTo(-44.5, 1);
      });
    });
  });

  describe("Region 3: Lower Mesosphere (32,000-47,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -44.5°C at 32000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(32000)
        );
        expect(temperature.value).toBeCloseTo(-44.5, 1);
      });

      it("should calculate temperature at 40000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(40000)
        );
        // T = 228.65 + 0.0028 * 8000 = 228.65 + 22.4 = 251.05K = -22.1°C
        expect(temperature.value).toBeCloseTo(-22.1, 1);
      });

      it("should calculate temperature at 46999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(46999)
        );
        // T = 228.65 + 0.0028 * 14999 = 228.65 + 42 = 270.65K = -2.5°C
        expect(temperature.value).toBeCloseTo(-2.5, 1);
      });
    });
  });

  describe("Region 4: Upper Mesosphere (47,000-51,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -2.5°C at 47000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(47000)
        );
        expect(temperature.value).toBeCloseTo(-2.5, 1);
      });

      it("should return -2.5°C at 49000m (isothermal region)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(49000)
        );
        expect(temperature.value).toBeCloseTo(-2.5, 1);
      });

      it("should return -2.5°C at 50999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(50999)
        );
        expect(temperature.value).toBeCloseTo(-2.5, 1);
      });
    });
  });

  describe("Region 5: Lower Thermosphere (51,000-71,000m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -2.5°C at 51000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(51000)
        );
        expect(temperature.value).toBeCloseTo(-2.5, 1);
      });

      it("should calculate temperature at 60000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(60000)
        );
        // T = 270.65 + (-0.0028) * 9000 = 270.65 - 25.2 = 245.45K = -27.7°C
        expect(temperature.value).toBeCloseTo(-27.7, 1);
      });

      it("should calculate temperature at 70999m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(70999)
        );
        // T = 270.65 + (-0.0028) * 19999 = 270.65 - 56 = 214.65K = -58.5°C
        expect(temperature.value).toBeCloseTo(-58.5, 1);
      });
    });
  });

  describe("Region 6: Upper Thermosphere (71,000-84,852m)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -58.5°C at 71000m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(71000)
        );
        expect(temperature.value).toBeCloseTo(-58.5, 1);
      });

      it("should calculate temperature at 80000m correctly", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(80000)
        );
        // T = 214.65 + (-0.002) * 9000 = 214.65 - 18 = 196.65K = -76.5°C
        expect(temperature.value).toBeCloseTo(-76.5, 1);
      });

      it("should calculate temperature at 84851m (upper boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(84851)
        );
        // T = 214.65 + (-0.002) * 13851 = 214.65 - 27.7 = 186.95K = -86.2°C
        expect(temperature.value).toBeCloseTo(-86.2, 1);
      });
    });
  });

  describe("Region 7: Exosphere (84,852m+)", () => {
    describe("getTemperatureAtAltitude", () => {
      it("should return -86.2°C at 84852m (lower boundary)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(84852)
        );
        expect(temperature.value).toBeCloseTo(-86.2, 1);
      });

      it("should return -86.2°C at 100000m (isothermal region)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(100000)
        );
        expect(temperature.value).toBeCloseTo(-86.2, 1);
      });

      it("should return -86.2°C at 200000m (high altitude)", () => {
        const temperature = atmosphere.getTemperatureAtAltitude(
          new Meters(200000)
        );
        expect(temperature.value).toBeCloseTo(-86.2, 1);
      });
    });
  });

  describe("Unit conversions", () => {
    it("should handle feet input correctly for temperature", () => {
      const temperatureMeters = atmosphere.getTemperatureAtAltitude(
        new Meters(10000)
      );
      const temperatureFeet = atmosphere.getTemperatureAtAltitude(
        new Feet(32808.4)
      ); // 10000m in feet
      expect(temperatureFeet.value).toBeCloseTo(temperatureMeters.value, 1);
    });

    it("should handle feet input correctly for pressure", () => {
      const pressureMeters = atmosphere.getPressureAtAltitude(new Meters(5000));
      const pressureFeet = atmosphere.getPressureAtAltitude(new Feet(16404.2)); // 5000m in feet
      expect(pressureFeet.value).toBeCloseTo(pressureMeters.value, 0);
    });

    it("should handle feet input correctly for density", () => {
      const densityMeters = atmosphere.getDensityAtAltitude(new Meters(15000));
      const densityFeet = atmosphere.getDensityAtAltitude(new Feet(49212.6)); // 15000m in feet
      expect(densityFeet.value).toBeCloseTo(densityMeters.value, 3);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should throw error for altitudes outside standard atmosphere range", () => {
      expect(() => {
        atmosphere.getTemperatureAtAltitude(new Meters(-1000));
      }).toThrow("Altitude is outside the range of the standard atmosphere");
    });

    it("should handle very high altitudes gracefully", () => {
      const temperature = atmosphere.getTemperatureAtAltitude(
        new Meters(1_000_000)
      );
      expect(temperature.value).toBeCloseTo(-86.2, 1);
    });

    it("should handle boundary conditions correctly", () => {
      // Test exact boundary values
      const temp1 = atmosphere.getTemperatureAtAltitude(new Meters(11000));
      const temp2 = atmosphere.getTemperatureAtAltitude(new Meters(10999));
      expect(temp1.value).toBeCloseTo(temp2.value, 1);
    });
  });

  describe("Physical consistency checks", () => {
    it("should maintain physical relationships between pressure, density, and temperature", () => {
      const altitude = new Meters(10000);
      const temperature = atmosphere.getTemperatureAtAltitude(altitude);
      const pressure = atmosphere.getPressureAtAltitude(altitude);
      const density = atmosphere.getDensityAtAltitude(altitude);

      // Check ideal gas law: P = ρRT
      const R = atmosphere.getSpecificGasConstant();
      const calculatedPressure =
        density.value * R * (temperature.value + 273.15);
      expect(pressure.value).toBeCloseTo(calculatedPressure, -2); // Allow for some tolerance
    });

    it("should show decreasing pressure with altitude", () => {
      const pressure1 = atmosphere.getPressureAtAltitude(new Meters(0));
      const pressure2 = atmosphere.getPressureAtAltitude(new Meters(10000));
      const pressure3 = atmosphere.getPressureAtAltitude(new Meters(20000));

      expect(pressure1.value).toBeGreaterThan(pressure2.value);
      expect(pressure2.value).toBeGreaterThan(pressure3.value);
    });

    it("should show decreasing density with altitude", () => {
      const density1 = atmosphere.getDensityAtAltitude(new Meters(0));
      const density2 = atmosphere.getDensityAtAltitude(new Meters(10000));
      const density3 = atmosphere.getDensityAtAltitude(new Meters(20000));

      expect(density1.value).toBeGreaterThan(density2.value);
      expect(density2.value).toBeGreaterThan(density3.value);
    });
  });

  describe("Known reference values", () => {
    it("should match standard atmosphere reference values at sea level", () => {
      const temperature = atmosphere.getTemperatureAtAltitude(new Meters(0));
      const pressure = atmosphere.getPressureAtAltitude(new Meters(0));
      const density = atmosphere.getDensityAtAltitude(new Meters(0));

      expect(temperature.value).toBeCloseTo(15, 1); // 15°C
      expect(pressure.value).toBeCloseTo(101325, 0); // 101325 Pa
      expect(density.value).toBeCloseTo(1.225, 3); // 1.225 kg/m³
    });

    it("should match standard atmosphere reference values at 11km", () => {
      const temperature = atmosphere.getTemperatureAtAltitude(
        new Meters(11000)
      );
      const pressure = atmosphere.getPressureAtAltitude(new Meters(11000));
      const density = atmosphere.getDensityAtAltitude(new Meters(11000));

      expect(temperature.value).toBeCloseTo(-56.5, 1); // -56.5°C
      expect(pressure.value).toBeCloseTo(22632, 0); // 22632 Pa
      expect(density.value).toBeCloseTo(0.364, 3); // 0.364 kg/m³
    });
  });
});
