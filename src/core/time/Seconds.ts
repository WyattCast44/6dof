import Hours from "./Hours";
import Minutes from "./Minutes";
import Time from "./Time";

class Seconds extends Time {
  toSeconds(): Seconds {
    return this;
  }

  static fromMinutes(value: number): Seconds {
    return new Seconds(value * 60);
  }

  toMinutes(): Minutes {
    return new Minutes(this.value / 60);
  }

  static fromHours(value: number): Seconds {
    return new Seconds(value * 3600);
  }

  toHours(): Hours {
    return new Hours(this.value / 3600);
  }
}

export default Seconds;
