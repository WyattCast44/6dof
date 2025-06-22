import Force from "./Force";
import Newtons from "./Newtons";

class PoundForce extends Force {
  toNewtons(): Newtons {
    return new Newtons(this.value * 4.44822);
  }

  toPoundForce(): PoundForce {
    return this;
  }
}

export default PoundForce;
