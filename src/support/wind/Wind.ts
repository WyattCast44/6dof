import CardinalDegree from "../angles/CardinalDegree";
import Knots from "../velocity/Knots";

class Wind {
  public readonly speed: Knots;
  public readonly direction: CardinalDegree;

  constructor(
    speed: number | Knots,
    direction: number | CardinalDegree
  ) {
    this.speed = speed instanceof Knots ? speed : new Knots(speed);
    this.direction = direction instanceof CardinalDegree ? direction : new CardinalDegree(direction);
  }
}

export default Wind;