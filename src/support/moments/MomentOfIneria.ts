abstract class MomentOfIneria {
  constructor(public readonly value: number) {}
  abstract toKilogramsMetersSquared(): any;
}

export default MomentOfIneria;