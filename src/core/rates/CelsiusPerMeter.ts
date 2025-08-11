class CelsiusPerMeter {
  constructor(public readonly value: number) {}

  static standardLapseRate(): CelsiusPerMeter {
    return new CelsiusPerMeter(-0.0065);
  }
}

export default CelsiusPerMeter;
