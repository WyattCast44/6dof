import Force from "./Force";
import PoundForce from "./PoundForce";

class Newtons extends Force {
  toNewtons(): Newtons {
    return this;
  }

  toPoundForce(): PoundForce {
    return new PoundForce(this.value / 4.44822);
  }
}

export default Newtons;
