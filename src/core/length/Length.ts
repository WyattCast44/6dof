abstract class Length {
  public readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  abstract toFeet(): any;
  abstract toMeters(): any;
  abstract getStringUnits(): string;
  abstract toKilometers(): any;
  abstract toNauticalMiles(): any;
}

export default Length;
