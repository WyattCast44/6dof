import Degrees from "./Degrees";
import Radians from "./Radians";

class CardinalDegree {
  public readonly value: number;

  constructor(value: number) {
    this.value = CardinalDegree.normalize(value);
  }

  static fromDegrees(value: Degrees): CardinalDegree {
    return new CardinalDegree(value.value);
  }

  static fromRadians(value: Radians): CardinalDegree {
    return new CardinalDegree(CardinalDegree.radToDeg(value.value));
  }

  private static degToRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  toDegrees(): Degrees {
    return new Degrees(this.value);
  }

  toRadians(): Radians {
    return new Radians(CardinalDegree.degToRad(this.value));
  }

  private static normalize(value: number): number {
    let heading = ((value - 1) % 360) + 1;

    if (heading == 0) heading = 360;

    if (heading < 1) heading += 360;

    return heading;
  }

  private static radToDeg(value: number): number {
    return (value * 180) / Math.PI;
  }
}

export default CardinalDegree;
