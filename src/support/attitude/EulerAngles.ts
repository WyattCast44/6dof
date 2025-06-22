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
    this.elevation_theta = elevation_theta instanceof Radians ? elevation_theta : new Radians(elevation_theta);
    this.bank_phi = bank_phi instanceof Radians ? bank_phi : new Radians(bank_phi);
  }
}

export default EulerAngles;