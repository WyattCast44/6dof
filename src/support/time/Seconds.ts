import Hours from "./Hours";
import Minutes from "./Minutes";
import Time from "./Time";

class Seconds extends Time {
  toSeconds(): Seconds {
    return this;
  }

  toMinutes(): Minutes {
    return new Minutes(this.value / 60);
  }

  toHours(): Hours {
    return new Hours(this.value / 3600);
  }
}

export default Seconds;
