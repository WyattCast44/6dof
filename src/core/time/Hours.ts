import Minutes from "./Minutes";
import Seconds from "./Seconds";
import Time from "./Time";

class Hours extends Time {
  toSeconds(): Seconds {
    return new Seconds(this.value * 3600);
  }

  static fromSeconds(value: number): Hours {
    return new Hours(value / 3600);
  }

  toMinutes(): Minutes {
    return new Minutes(this.value * 60);
  }

  static fromMinutes(value: number): Hours {
    return new Hours(value / 60);
  }

  toHours(): Hours {
    return this;
  }
}

export default Hours;
