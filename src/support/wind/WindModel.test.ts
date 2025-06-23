import { describe, it, expect, beforeEach } from 'vitest';
import WindModel from './WindModel';
import Wind from './Wind';
import Knots from '../velocity/Knots';
import CardinalDegree from '../angles/CardinalDegree';
import Meters from '../length/Meters';
import { round } from '../helpers/math';
import MSL from '../altitude/MSL';

describe('WindModel', () => {
  let windModel: WindModel;

  beforeEach(() => {
    windModel = new WindModel();
  });

  describe('addAltitude', () => {
    it('should add wind data at specified altitude', () => {
      const wind = new Wind({ speed: new Knots(10), direction: new CardinalDegree(270) });
      let altitude = new MSL(new Meters(1000));
      windModel.addAltitude(altitude, wind);
      
      expect(windModel.hasWindData()).toBe(true);
      expect(windModel.getMinAltitude().value).toBe(altitude.value.value); // 1000 feet in meters
      expect(windModel.getMaxAltitude().value).toBe(altitude.value.value);
    });

    it('should handle multiple altitudes and sort them', () => {
      const wind1 = new Wind({ speed: new Knots(5), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(270) });
      let altitude1 = new MSL(new Meters(1000));
      let altitude2 = new MSL(new Meters(2000));
      
      windModel.addAltitude(altitude1, wind1);
      windModel.addAltitude(altitude2, wind2);
      
      expect(windModel.getMinAltitude().value).toBe(altitude1.value.value); // 1000 feet
      expect(windModel.getMaxAltitude().value).toBe(altitude2.value.value); // 2000 feet
    });

    it('should convert feet to meters internally', () => {
      const wind = new Wind({ speed: new Knots(15), direction: new CardinalDegree(180) });
      let altitude = new MSL(new Meters(5000));
      windModel.addAltitude(altitude, wind);
      
      expect(windModel.getMinAltitude().value).toBe(altitude.value.value); // 5000 feet in meters
    });

    it('should handle meters directly', () => {
      const wind = new Wind({ speed: new Knots(20), direction: new CardinalDegree(90) });
      let altitude = new MSL(new Meters(1000));
      windModel.addAltitude(altitude, wind);
      
      expect(windModel.getMinAltitude().value).toBe(altitude.value.value);
    });
  });

  describe('getWindAtAltitude - No Data', () => {
    it('should return zero wind when no data is available', () => {
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(1000)));
      
      expect(wind.speed.value).toBe(0);
      expect(wind.direction.value).toBe(360);
    });
  });

  describe('getWindAtAltitude - Single Altitude Point', () => {
    it('should return decayed wind for single altitude point', () => {
      const originalWind = new Wind({ speed: new Knots(20), direction: new CardinalDegree(270) });
      windModel.addAltitude(new MSL(new Meters(5000)), originalWind);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(1000)));
      
      // Linear decay from 5000 feet (20 knots) to surface (2 knots)
      // At 1000 feet: 2 + ((20-2)/1524) * 304.8 = 2 + 3.6 = 5.6 knots
      expect(wind.speed.value).toBe(5.6);
      expect(wind.direction.value).toBe(270); // Direction should remain the same
    });

    it('should return proper decayed wind at intermediate altitude', () => {
      const originalWind = new Wind({ speed: new Knots(20), direction: new CardinalDegree(270) });
      windModel.addAltitude(new MSL(new Meters(5000)), originalWind);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(2500)));
      
      // Linear decay from 5000 feet (20 knots) to surface (2 knots)
      // At 2500 feet: 2 + ((20-2)/1524) * 762 = 2 + 9 = 11 knots
      expect(wind.speed.value).toBe(11);
      expect(wind.direction.value).toBe(270);
    });
  });

  describe('getWindAtAltitude - Above Highest Altitude', () => {
    it('should return highest wind when altitude is above highest known', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(15), direction: new CardinalDegree(270) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(5000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(10000)));
      
      expect(wind.speed.value).toBe(15);
      expect(wind.direction.value).toBe(270);
    });

    it('should return highest wind when altitude equals highest known', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(15), direction: new CardinalDegree(270) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(5000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(5000)));
      
      expect(wind.speed.value).toBe(15);
      expect(wind.direction.value).toBe(270);
    });
  });

  describe('getWindAtAltitude - Below Lowest Altitude', () => {
    it('should return decayed wind when altitude is below lowest known', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(15), direction: new CardinalDegree(270) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(5000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(500)));
      
      // Should decay from lowest registered wind (10 knots at 1000 feet)
      // Surface speed = 10 * 0.1 = 1 knot
      // At 500 feet: 1 + ((10-1)/304.8) * 152.4 = 1 + 4.5 = 5.5 knots
      expect(round(wind.speed.value, 1)).toBe(5.5);
      expect(wind.direction.value).toBe(260); // Direction from lowest wind
    });
  });

  describe('getWindAtAltitude - Interpolation', () => {
    it('should interpolate wind between two altitude points', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(20), direction: new CardinalDegree(280) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(3000)), wind2);
      
      // Test at midpoint (2000 feet)
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(2000)));
      
      // Speed should be interpolated: 10 + (20-10) * 0.5 = 15
      expect(wind.speed.value).toBe(15);
      // Direction should be interpolated: 260 + (280-260) * 0.5 = 270
      expect(wind.direction.value).toBe(270);
    });

    it('should handle direction interpolation across 0 degrees', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(350) });
      const wind2 = new Wind({ speed: new Knots(20), direction: new CardinalDegree(10) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(3000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(2000)));
      
      // Should interpolate through 0 degrees, not 180
      expect(wind.speed.value).toBe(15);
      expect(round(wind.direction.value)).toBe(360); // 350 + (10-350) * 0.5 = 0
    });

    it('should handle direction interpolation across 360 degrees', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(10) });
      const wind2 = new Wind({ speed: new Knots(20), direction: new CardinalDegree(350) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(3000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(2000)));
      
      // Should interpolate through 360 degrees
      expect(wind.speed.value).toBe(15);
      expect(round(wind.direction.value)).toBe(360); // 10 + (350-10) * 0.5 = 0
    });
  });

  describe('getWindAtAltitude - Multiple Altitude Points', () => {
    it('should interpolate between correct altitude ranges', () => {
      const wind1 = new Wind({ speed: new Knots(5), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(270) });
      const wind3 = new Wind({ speed: new Knots(15), direction: new CardinalDegree(280) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(3000)), wind2);
      windModel.addAltitude(new MSL(new Meters(5000)), wind3);
      
      // Test between first and second points
      const wind12 = windModel.getWindAtAltitude(new MSL(new Meters(2000)));
      expect(wind12.speed.value).toBe(7.5); // 5 + (10-5) * 0.5
      expect(wind12.direction.value).toBe(265); // 260 + (270-260) * 0.5
      
      // Test between second and third points
      const wind23 = windModel.getWindAtAltitude(new MSL(new Meters(4000)));
      expect(wind23.speed.value).toBe(12.5); // 10 + (15-10) * 0.5
      expect(wind23.direction.value).toBe(275); // 270 + (280-270) * 0.5
    });
  });

  describe('Utility Methods', () => {
    it('should return correct min and max altitudes', () => {
      expect(windModel.getMinAltitude().value).toBe(0);
      expect(windModel.getMaxAltitude().value).toBe(0);
      
      windModel.addAltitude(new MSL(new Meters(1000)), new Wind({ speed: new Knots(10), direction: new CardinalDegree(270) }));
      windModel.addAltitude(new MSL(new Meters(5000)), new Wind({ speed: new Knots(20), direction: new CardinalDegree(280) }));
      
      expect(windModel.getMinAltitude().value).toBe(1000); 
      expect(windModel.getMaxAltitude().value).toBe(5000); 
    });

    it('should correctly report wind data availability', () => {
      expect(windModel.hasWindData()).toBe(false);
      
      windModel.addAltitude(new MSL(new Meters(1000)), new Wind({ speed: new Knots(10), direction: new CardinalDegree(270) }));
      
      expect(windModel.hasWindData()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small altitude differences', () => {
      const wind1 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(260) });
      const wind2 = new Wind({ speed: new Knots(11), direction: new CardinalDegree(261) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(1001)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(1000.5)));
      
      expect(wind.speed.value).toBe(10.5);
      expect(round(wind.direction.value, 1)).toBe(260.5);
    });

    it('should handle zero wind speed', () => {
      const wind1 = new Wind({ speed: new Knots(0), direction: new CardinalDegree(270) });
      const wind2 = new Wind({ speed: new Knots(10), direction: new CardinalDegree(280) });
      
      windModel.addAltitude(new MSL(new Meters(1000)), wind1);
      windModel.addAltitude(new MSL(new Meters(3000)), wind2);
      
      const wind = windModel.getWindAtAltitude(new MSL(new Meters(2000)));
      
      expect(round(wind.speed.value)).toBe(5); // 0 + (10-0) * 0.5
      expect(wind.direction.value).toBe(275); // 270 + (280-270) * 0.5
    });

    it('should handle negative altitude input gracefully', () => {
      const wind = new Wind({ speed: new Knots(20), direction: new CardinalDegree(270) });
      windModel.addAltitude(new MSL(new Meters(1000)), wind);
      
      const result = windModel.getWindAtAltitude(new MSL(new Meters(-100)));
      
      // Should return decayed wind from lowest wind (20 knots at 1000 feet)
      // Surface speed = 20 * 0.1 = 2 knots
      // At 0 altitude (after clamping): 2 knots
      expect(round(result.speed.value, 2)).toBe(2);
      expect(result.direction.value).toBe(270);
    });
  });
});
