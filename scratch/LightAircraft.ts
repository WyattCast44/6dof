import AircraftProperties from "./AircraftProperties";
import Kilograms from "../mass/Kilograms";
import KilogramsMetersSquared from "../moments/KilogramsMetersSquared";
import Meters from "../length/Meters";
import MetersSquared from "../area/MetersSquared";

/**
 * LightAircraft - Cessna 172-like aircraft properties
 * 
 * This class provides realistic aircraft properties for a typical light aircraft
 * similar to a Cessna 172. The data includes mass, moments of inertia, and
 * geometric properties needed for flight dynamics calculations.
 * 
 * SPECIFICATIONS (approximate Cessna 172):
 * - Maximum Takeoff Weight: 1111 kg (2450 lbs)
 * - Wing Span: 11.0 m (36.1 ft)
 * - Wing Area: 16.2 m² (174 ft²)
 * - Length: 8.28 m (27.2 ft)
 * - Cruise Speed: ~120 knots
 */
class LightAircraft extends AircraftProperties {
  constructor() {
    super(
      new Kilograms(1111),                    // Mass: 1111 kg (2450 lbs)
      new KilogramsMetersSquared(1285.31),    // Roll inertia (Jxx)
      new KilogramsMetersSquared(1824.93),    // Pitch inertia (Jyy)
      new KilogramsMetersSquared(2666.89),    // Yaw inertia (Jzz)
      new KilogramsMetersSquared(0),          // Cross product (Jxz) - symmetric aircraft
      new Meters(11.0),                       // Wing span: 11.0 m
      new MetersSquared(16.2)                 // Wing area: 16.2 m²
    );
  }

  /**
   * Get aircraft type
   */
  getAircraftType(): string {
    return "Light Aircraft";
  }

  /**
   * Get aircraft manufacturer
   */
  getManufacturer(): string {
    return "Cessna";
  }

  /**
   * Get aircraft model
   */
  getModel(): string {
    return "172 Skyhawk";
  }

  /**
   * Get aircraft description
   */
  getDescription(): string {
    return `${this.getManufacturer()} ${this.getModel()} - ${this.getAircraftType()}`;
  }

  /**
   * Get wing loading in kg/m²
   */
  getWingLoading(): number {
    return this.mass.value / this.wingArea.value; // ~68.6 kg/m²
  }

  /**
   * Get aspect ratio
   */
  getAspectRatio(): number {
    return Math.pow(this.wingSpan.value, 2) / this.wingArea.value; // ~7.47
  }

  /**
   * Get aircraft performance characteristics
   */
  getPerformanceCharacteristics() {
    return {
      maxTakeoffWeight: this.mass.value,
      wingLoading: this.getWingLoading(),
      aspectRatio: this.getAspectRatio(),
      cruiseSpeed: 120, // knots
      stallSpeed: 47,   // knots
      maxAltitude: 14000 // feet
    };
  }
}

export default LightAircraft; 