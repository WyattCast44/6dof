import Radians from "../angles/Radians";

class EulerAngles {
  public readonly azimuth_psi: Radians;
  public readonly elevation_theta: Radians;
  public readonly bank_phi: Radians;

  constructor(
    azimuth_psi: Radians|number,
    elevation_theta: Radians|number,
    bank_phi: Radians|number
  ) {
    this.azimuth_psi = azimuth_psi instanceof Radians ? azimuth_psi : new Radians(azimuth_psi);
    //this.validateAzimuth(this.azimuth_psi);

    this.elevation_theta = elevation_theta instanceof Radians ? elevation_theta : new Radians(elevation_theta);
    //this.validateElevation(this.elevation_theta);

    this.bank_phi = bank_phi instanceof Radians ? bank_phi : new Radians(bank_phi);
    //this.validateBank(this.bank_phi);
  }

  private validateAzimuth(azimuth: Radians) {
    const degrees = azimuth.toDegrees().value;
    if (degrees < 0 || degrees >= 360) {
      throw new Error("Azimuth must be between 0 and 359 degrees. Given: " + degrees);
    }
  }

  private validateElevation(elevation: Radians) {
    const degrees = elevation.toDegrees().value;
    if (degrees < -90 || degrees > 90) {
      throw new Error("Elevation must be between -90 and 90 degrees. Given: " + degrees);
    }
  }

  private validateBank(bank: Radians) {
    const degrees = bank.toDegrees().value;
    if (degrees < -180 || degrees > 180) {
      throw new Error("Bank must be between -180 and 180 degrees. Given: " + degrees);
    }
  }
}

export default EulerAngles;