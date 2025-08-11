abstract class Acceleration {
  public readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  abstract getStringUnits(): string;
  abstract toFeetPerSecondSquared(): any;
  abstract toMetersPerSecondSquared(): any;
}

export default Acceleration;
