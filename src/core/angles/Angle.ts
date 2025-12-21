abstract class Angle {
  public readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  abstract toDegrees(): any;
  abstract toRadians(): any;
  abstract getStringUnits(): string;
  abstract toString(): string;
}

export default Angle;