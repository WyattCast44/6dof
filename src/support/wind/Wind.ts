import CardinalDegree from "../angles/CardinalDegree";
import Knots from "../velocity/Knots";

class Wind {
  public readonly speed: Knots;
  public readonly direction: CardinalDegree;
  
  constructor(props: { speed: Knots|number, direction: CardinalDegree|number }) {
    this.speed = props.speed instanceof Knots ? props.speed : new Knots(props.speed);
    this.direction = props.direction instanceof CardinalDegree ? props.direction : new CardinalDegree(props.direction);
  }
}

export default Wind;