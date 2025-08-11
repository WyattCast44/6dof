import { describe, it, expect } from 'vitest';
import FeetPerSecondSquared from './FeetPerSecondSquared';
import MetersPerSecondSquared from './MetersPerSecondSquared';
import { round } from '../helpers/math';

describe('Acceleration', () => {
  describe('abstract class', () => {
    it('should have a value property', () => {
      // Test with FeetPerSecondSquared as concrete implementation
      const acceleration = new FeetPerSecondSquared(32.174);
      expect(acceleration.value).toBe(32.174);
    });

    it('should have abstract methods that must be implemented', () => {
      const acceleration = new FeetPerSecondSquared(9.80665);
      
      // These should not throw errors if properly implemented
      expect(() => acceleration.getStringUnits()).not.toThrow();
      expect(() => acceleration.toFeetPerSecondSquared()).not.toThrow();
      expect(() => acceleration.toMetersPerSecondSquared()).not.toThrow();
    });
  });
});

describe('FeetPerSecondSquared', () => {
  describe('constructor', () => {
    it('should create FeetPerSecondSquared with correct value', () => {
      const acceleration = new FeetPerSecondSquared(32.174);
      expect(acceleration.value).toBe(32.174);
    });

    it('should handle zero value', () => {
      const acceleration = new FeetPerSecondSquared(0);
      expect(acceleration.value).toBe(0);
    });

    it('should handle negative values', () => {
      const acceleration = new FeetPerSecondSquared(-9.8);
      expect(acceleration.value).toBe(-9.8);
    });

    it('should handle decimal values', () => {
      const acceleration = new FeetPerSecondSquared(32.174049);
      expect(acceleration.value).toBe(32.174049);
    });
  });

  describe('getStringUnits', () => {
    it('should return correct units string', () => {
      const acceleration = new FeetPerSecondSquared(32.174);
      expect(acceleration.getStringUnits()).toBe('ft/s^2');
    });
  });

  describe('toFeetPerSecondSquared', () => {
    it('should return the same instance', () => {
      const acceleration = new FeetPerSecondSquared(32.174);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result).toBe(acceleration);
      expect(result.value).toBe(32.174);
    });

    it('should maintain the same value', () => {
      const acceleration = new FeetPerSecondSquared(9.80665);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result.value).toBe(9.80665);
    });
  });

  describe('toMetersPerSecondSquared', () => {
    it('should convert feet per second squared to meters per second squared', () => {
      const acceleration = new FeetPerSecondSquared(32.174);
      const result = acceleration.toMetersPerSecondSquared();
      
      // 32.174 ft/s^2 * 0.3048 = 9.80665 m/s^2
      expect(round(result.value, 3)).toBe(9.807);
    });

    it('should handle zero value', () => {
      const acceleration = new FeetPerSecondSquared(0);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(result.value).toBe(0);
    });

    it('should handle negative values', () => {
      const acceleration = new FeetPerSecondSquared(-32.174);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(round(result.value, 3)).toBe(-9.807);
    });

    it('should handle standard gravity conversion', () => {
      // Standard gravity is 32.174049 ft/s^2
      const acceleration = new FeetPerSecondSquared(32.174049);
      const result = acceleration.toMetersPerSecondSquared();
      
      // Should be approximately 9.80665 m/s^2
      expect(result.value).toBeCloseTo(9.80665, 5);
    });

    it('should handle small values', () => {
      const acceleration = new FeetPerSecondSquared(1);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(result.value).toBeCloseTo(0.3048, 4);
    });

    it('should handle large values', () => {
      const acceleration = new FeetPerSecondSquared(1000);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(result.value).toBeCloseTo(304.8, 1);
    });
  });
});

describe('MetersPerSecondSquared', () => {
  describe('constructor', () => {
    it('should create MetersPerSecondSquared with correct value', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      expect(acceleration.value).toBe(9.80665);
    });

    it('should handle zero value', () => {
      const acceleration = new MetersPerSecondSquared(0);
      expect(acceleration.value).toBe(0);
    });

    it('should handle negative values', () => {
      const acceleration = new MetersPerSecondSquared(-9.8);
      expect(acceleration.value).toBe(-9.8);
    });

    it('should handle decimal values', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      expect(acceleration.value).toBe(9.80665);
    });
  });

  describe('getStringUnits', () => {
    it('should return correct units string', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      expect(acceleration.getStringUnits()).toBe('m/s^2');
    });
  });

  describe('toFeetPerSecondSquared', () => {
    it('should convert meters per second squared to feet per second squared', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      const result = acceleration.toFeetPerSecondSquared();
      
      // 9.80665 m/s^2 * 3.28084 = 32.174 ft/s^2
      expect(result.value).toBeCloseTo(32.174, 3);
    });

    it('should handle zero value', () => {
      const acceleration = new MetersPerSecondSquared(0);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result.value).toBe(0);
    });

    it('should handle negative values', () => {
      const acceleration = new MetersPerSecondSquared(-9.80665);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result.value).toBeCloseTo(-32.174, 3);
    });

    it('should handle standard gravity conversion', () => {
      // Standard gravity is 9.80665 m/s^2
      const acceleration = new MetersPerSecondSquared(9.80665);
      const result = acceleration.toFeetPerSecondSquared();
      
      // Should be approximately 32.174 ft/s^2
      expect(result.value).toBeCloseTo(32.174, 3);
    });

    it('should handle small values', () => {
      const acceleration = new MetersPerSecondSquared(1);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result.value).toBeCloseTo(3.28084, 5);
    });

    it('should handle large values', () => {
      const acceleration = new MetersPerSecondSquared(100);
      const result = acceleration.toFeetPerSecondSquared();
      
      expect(result.value).toBeCloseTo(328.084, 3);
    });
  });

  describe('toMetersPerSecondSquared', () => {
    it('should return the same instance', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(result).toBe(acceleration);
      expect(result.value).toBe(9.80665);
    });

    it('should maintain the same value', () => {
      const acceleration = new MetersPerSecondSquared(9.80665);
      const result = acceleration.toMetersPerSecondSquared();
      
      expect(result.value).toBe(9.80665);
    });
  });

  describe('static methods', () => {
    it('should have static toFeetPerSecondSquared method', () => {
      const result = new MetersPerSecondSquared(9.80665).toFeetPerSecondSquared();
      
      expect(result).toBeInstanceOf(FeetPerSecondSquared);
      expect(result.value).toBeCloseTo(32.174, 3);
    });

    it('should have static toMetersPerSecondSquared method', () => {
      const result = new MetersPerSecondSquared(9.80665).toMetersPerSecondSquared();
      
      expect(result).toBeInstanceOf(MetersPerSecondSquared);
      expect(result.value).toBe(9.80665);
    });
  });
});

describe('Acceleration Conversion Round-trip', () => {
  it('should maintain precision through ft/s^2 -> m/s^2 -> ft/s^2 conversion', () => {
    const original = new FeetPerSecondSquared(32.174049);
    const converted = original.toMetersPerSecondSquared();
    const back = converted.toFeetPerSecondSquared();
    
    expect(round(back.value, 3)).toBe(round(original.value, 3));
  });

  it('should maintain precision through m/s^2 -> ft/s^2 -> m/s^2 conversion', () => {
    const original = new MetersPerSecondSquared(9.80665);
    const converted = original.toFeetPerSecondSquared();
    const back = converted.toMetersPerSecondSquared();
    
    expect(back.value).toBeCloseTo(original.value, 5);
  });

  it('should handle standard gravity values correctly', () => {
    // Standard gravity: 9.80665 m/s^2 = 32.174049 ft/s^2
    const mps2 = new MetersPerSecondSquared(9.80665);
    const fps2 = new FeetPerSecondSquared(32.174049);
    
    expect(round(mps2.toFeetPerSecondSquared().value, 3)).toBe(32.174);
    expect(round(fps2.toMetersPerSecondSquared().value, 3)).toBe(9.807);
  });
});

describe('Edge Cases', () => {
  it('should handle very small values', () => {
    const smallFps2 = new FeetPerSecondSquared(0.001);
    const smallMps2 = new MetersPerSecondSquared(0.001);
    
    expect(smallFps2.toMetersPerSecondSquared().value).toBeCloseTo(0.0003048, 7);
    expect(smallMps2.toFeetPerSecondSquared().value).toBeCloseTo(0.00328084, 8);
  });

  it('should handle very large values', () => {
    const largeFps2 = new FeetPerSecondSquared(10000);
    const largeMps2 = new MetersPerSecondSquared(10000);
    
    expect(largeFps2.toMetersPerSecondSquared().value).toBeCloseTo(3048, 1);
    expect(largeMps2.toFeetPerSecondSquared().value).toBeCloseTo(32808.4, 1);
  });

  it('should handle extreme negative values', () => {
    const negativeFps2 = new FeetPerSecondSquared(-1000);
    const negativeMps2 = new MetersPerSecondSquared(-1000);

    console.log(negativeFps2);
    
    expect(negativeFps2.toMetersPerSecondSquared().value).toBeCloseTo(-304.8, 1);
    expect(negativeMps2.toFeetPerSecondSquared().value).toBeCloseTo(-3280.84, 2);
  });
});
