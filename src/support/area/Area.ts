abstract class Area {
  constructor(public readonly value: number) {}
  abstract toMetersSquared(): any;
}

export default Area;