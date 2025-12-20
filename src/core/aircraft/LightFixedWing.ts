import MetersSquared from "../area/MetersSquared";
import Newtons from "../force/Newtons";
import Meters from "../length/Meters";
import Kilograms from "../mass/Kilograms";
import KilogramsMetersSquared from "../moments/KilogramsMetersSquared";
import AircraftProperties from "./AircraftProperties";

/**
 * Default aerodynamic coefficients for a light fixed-wing aircraft.
 * Based on typical values for aircraft like Cessna 172.
 */
const DEFAULT_AERO_COEFFICIENTS = {
  liftCoefficientCL0: 0.25,
  liftCoefficientCLalpha: 5.0,
  dragCoefficientCD0: 0.03,
  dragCoefficientCDalpha: 0.3,
  sideForceCoefficientCYbeta: -0.5,
  rollMomentCoefficientClbeta: -0.1,
  rollMomentCoefficientClp: -0.5,
  rollMomentCoefficientClr: 0.1,
  pitchMomentCoefficientCm0: 0.05,
  pitchMomentCoefficientCmalpha: -0.5,
  pitchMomentCoefficientCmq: -12.0,
  yawMomentCoefficientCnbeta: 0.1,
  yawMomentCoefficientCnp: -0.03,
  yawMomentCoefficientCnr: -0.15,
};

/**
 * Default inertia properties for a light fixed-wing aircraft.
 * Values in kg·m², typical for a Cessna 172 class aircraft.
 */
const DEFAULT_INERTIA = {
  rollInertiaIxx: 1285,
  pitchInertiaIyy: 1825,
  yawInertiaIzz: 2667,
  crossProductInertiaIxz: 0,
};

/**
 * A light fixed-wing single-engine aircraft.
 *
 * Default values are representative of a Cessna 172 Skyhawk:
 * - Mass: 1043 kg (2300 lb)
 * - Wing area: 16.2 m² (174 ft²)
 * - Wingspan: 11.0 m (36 ft)
 * - Max thrust: ~1800 N (180 hp equivalent)
 *
 * @example
 * ```typescript
 * // Use defaults
 * const aircraft = new LightFixedWing();
 *
 * // Customize specific properties
 * const heavier = new LightFixedWing({
 *   mass: 1200,
 *   name: "Cessna 172 (loaded)",
 * });
 *
 * // Full customization
 * const custom = new LightFixedWing({
 *   name: "Custom Aircraft",
 *   mass: 900,
 *   wingArea: 14.0,
 *   aeroCoefficients: { CL0: 0.3, CLalpha: 5.5 },
 * });
 * ```
 */
class LightFixedWing extends AircraftProperties {
  
  constructor(
    name: string = "Cessna 172 Skyhawk",
    mass: Kilograms = new Kilograms(1043),
    wingArea: MetersSquared = new MetersSquared(16.2),
    wingSpan: Meters = new Meters(11.0),
    meanChord: Meters = new Meters(1.49),
    maxThrust: Newtons = new Newtons(1800),
  ) {
    super({
      name: name,
      mass: mass,
      maxThrust: maxThrust,
      wingArea: wingArea,
      wingSpan: wingSpan,
      meanChord: meanChord,
      rollInertiaIxx: new KilogramsMetersSquared(DEFAULT_INERTIA.rollInertiaIxx),
      pitchInertiaIyy: new KilogramsMetersSquared(DEFAULT_INERTIA.pitchInertiaIyy),
      yawInertiaIzz: new KilogramsMetersSquared(DEFAULT_INERTIA.yawInertiaIzz),
      crossProductInertiaIxz: new KilogramsMetersSquared(DEFAULT_INERTIA.crossProductInertiaIxz),
      liftCoefficientCL0: DEFAULT_AERO_COEFFICIENTS.liftCoefficientCL0,
      liftCoefficientCLalpha: DEFAULT_AERO_COEFFICIENTS.liftCoefficientCLalpha,
      dragCoefficientCD0: DEFAULT_AERO_COEFFICIENTS.dragCoefficientCD0,
      dragCoefficientCDalpha: DEFAULT_AERO_COEFFICIENTS.dragCoefficientCDalpha,
      sideForceCoefficientCYbeta: DEFAULT_AERO_COEFFICIENTS.sideForceCoefficientCYbeta,
      rollMomentCoefficientClbeta: DEFAULT_AERO_COEFFICIENTS.rollMomentCoefficientClbeta,
      rollMomentCoefficientClp: DEFAULT_AERO_COEFFICIENTS.rollMomentCoefficientClp,
      rollMomentCoefficientClr: DEFAULT_AERO_COEFFICIENTS.rollMomentCoefficientClr,
      pitchMomentCoefficientCm0: DEFAULT_AERO_COEFFICIENTS.pitchMomentCoefficientCm0,
      pitchMomentCoefficientCmalpha: DEFAULT_AERO_COEFFICIENTS.pitchMomentCoefficientCmalpha,
      pitchMomentCoefficientCmq: DEFAULT_AERO_COEFFICIENTS.pitchMomentCoefficientCmq,
      yawMomentCoefficientCnbeta: DEFAULT_AERO_COEFFICIENTS.yawMomentCoefficientCnbeta,
      yawMomentCoefficientCnp: DEFAULT_AERO_COEFFICIENTS.yawMomentCoefficientCnp,
      yawMomentCoefficientCnr: DEFAULT_AERO_COEFFICIENTS.yawMomentCoefficientCnr,
    });
  }
  /**
   * Get the aspect ratio (wingspan² / wing area).
   */
  get aspectRatio(): number {
    return (this.wingSpan.value * this.wingSpan.value) / this.wingArea.value;
  }

  /**
   * Get the wing loading (mass / wing area) in kg/m².
   */
  get wingLoading(): number {
    return this.mass.value / this.wingArea.value;
  }

  /**
   * Get a summary of aircraft properties.
   */
  toString(): string {
    return (
      `${this.name}\n` +
      `  Mass: ${this.mass} kg\n` +
      `  Wing Area: ${this.wingArea} m²\n` +
      `  Wingspan: ${this.wingSpan} m\n` +
      `  Aspect Ratio: ${this.aspectRatio.toFixed(2)}\n` +
      `  Wing Loading: ${this.wingLoading.toFixed(1)} kg/m²\n` +
      `  Max Thrust: ${this.maxThrust} N`
    );
  }
}

export default LightFixedWing;