import type MetersSquared from "../area/MetersSquared";
import type Meters from "../length/Meters";
import Kilograms from "../mass/Kilograms";
import Newtons from "../force/Newtons";
import type KilogramsMetersSquared from "../moments/KilogramsMetersSquared";

class AircraftProperties {
  // general properties
  public readonly name: string;
  public readonly mass: Kilograms;
  public readonly maxThrust: Newtons;

  // geometric properties
  public readonly wingArea: MetersSquared;
  public readonly wingSpan: Meters;
  public readonly meanChord: Meters;

  // moment of inertia properties
  public readonly rollInertiaIxx: KilogramsMetersSquared; // Jxx - roll moment of inertia
  public readonly pitchInertiaIyy: KilogramsMetersSquared; // Jyy - pitch moment of inertia
  public readonly yawInertiaIzz: KilogramsMetersSquared; // Jzz - yaw moment of inertia
  public readonly crossProductInertiaIxz: KilogramsMetersSquared; // Jxz - cross product of inertia

  // aerodynamic properties
  public readonly liftCoefficientCL0: number; /// Lift coefficient at zero angle of attack
  public readonly liftCoefficientCLalpha: number; // Lift curve slope (per radian)
  public readonly dragCoefficientCD0: number; // Parasitic drag coefficient 
  public readonly dragCoefficientCDalpha: number; // Induced drag factor (for parabolic drag polar)
  public readonly sideForceCoefficientCYbeta: number; // Side force due to sideslip (per radian)
  public readonly rollMomentCoefficientClbeta: number; // Roll moment due to sideslip (dihedral effect)
  public readonly rollMomentCoefficientClp: number; // Roll damping (roll moment due to roll rate)
  public readonly rollMomentCoefficientClr: number; // Roll moment due to yaw rate
  public readonly pitchMomentCoefficientCm0: number; // Pitch moment at zero lift
  public readonly pitchMomentCoefficientCmalpha: number; // Pitch moment due to angle of attack (stability)
  public readonly pitchMomentCoefficientCmq: number; // Pitch damping (pitch moment due to pitch rate)
  public readonly yawMomentCoefficientCnbeta: number; // Yaw moment due to sideslip (weathercock stability)
  public readonly yawMomentCoefficientCnp: number; // Yaw moment due to roll rate
  public readonly yawMomentCoefficientCnr: number; // Yaw damping (yaw moment due to yaw rate)

  constructor(
    properties: {
      name: string,
      mass: Kilograms,
      maxThrust: Newtons,
      wingArea: MetersSquared,
      wingSpan: Meters,
      meanChord: Meters,
      rollInertiaIxx: KilogramsMetersSquared,
      pitchInertiaIyy: KilogramsMetersSquared,
      yawInertiaIzz: KilogramsMetersSquared,
      crossProductInertiaIxz: KilogramsMetersSquared,
      liftCoefficientCL0: number,
      liftCoefficientCLalpha: number,
      dragCoefficientCD0: number,
      dragCoefficientCDalpha: number,
      sideForceCoefficientCYbeta: number,
      rollMomentCoefficientClbeta: number,
      rollMomentCoefficientClp: number,
      rollMomentCoefficientClr: number,
      pitchMomentCoefficientCm0: number,
      pitchMomentCoefficientCmalpha: number,
      pitchMomentCoefficientCmq: number,
      yawMomentCoefficientCnbeta: number,
      yawMomentCoefficientCnp: number,
      yawMomentCoefficientCnr: number,
    }
  ) {
    this.name = properties.name;
    this.mass = properties.mass;
    this.maxThrust = properties.maxThrust;
    this.wingArea = properties.wingArea;
    this.wingSpan = properties.wingSpan;
    this.meanChord = properties.meanChord;
    this.rollInertiaIxx = properties.rollInertiaIxx;
    this.pitchInertiaIyy = properties.pitchInertiaIyy;
    this.yawInertiaIzz = properties.yawInertiaIzz;
    this.crossProductInertiaIxz = properties.crossProductInertiaIxz;
    this.liftCoefficientCL0 = properties.liftCoefficientCL0;
    this.wingArea = properties.wingArea;
    this.wingSpan = properties.wingSpan;
    this.meanChord = properties.meanChord;
    this.rollInertiaIxx = properties.rollInertiaIxx;
    this.pitchInertiaIyy = properties.pitchInertiaIyy;
    this.yawInertiaIzz = properties.yawInertiaIzz;
    this.crossProductInertiaIxz = properties.crossProductInertiaIxz;
    this.liftCoefficientCL0 = properties.liftCoefficientCL0;
    this.liftCoefficientCLalpha = properties.liftCoefficientCLalpha;
    this.dragCoefficientCD0 = properties.dragCoefficientCD0;
    this.dragCoefficientCDalpha = properties.dragCoefficientCDalpha;
    this.sideForceCoefficientCYbeta = properties.sideForceCoefficientCYbeta;
    this.rollMomentCoefficientClbeta = properties.rollMomentCoefficientClbeta;
    this.rollMomentCoefficientClp = properties.rollMomentCoefficientClp;
    this.rollMomentCoefficientClr = properties. rollMomentCoefficientClr;
    this.pitchMomentCoefficientCm0 = properties.pitchMomentCoefficientCm0;
    this.pitchMomentCoefficientCmalpha = properties.pitchMomentCoefficientCmalpha;
    this.pitchMomentCoefficientCmq = properties.pitchMomentCoefficientCmq;
    this.yawMomentCoefficientCnbeta = properties.yawMomentCoefficientCnbeta;
    this.yawMomentCoefficientCnp = properties.yawMomentCoefficientCnp;
    this.yawMomentCoefficientCnr = properties.yawMomentCoefficientCnr;
  }
}

export default AircraftProperties;