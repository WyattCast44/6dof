import Hours from "./Hours";
import Seconds from "./Seconds";
import Time from "./Time";

class Minutes extends Time {
  toSeconds(): Seconds {
    return new Seconds(this.value * 60);
  }

  static fromSeconds(value: number): Minutes {
    return new Minutes(value / 60);
  }

  toMinutes(): Minutes {
    return this;
  }

  static fromHours(value: number): Minutes {
    return new Minutes(value * 60);
  }

  toHours(): Hours {
    return new Hours(this.value / 60);
  }
}

export default Minutes;
