import Minutes from "./Minutes";
import Seconds from "./Seconds";
import Time from "./Time";

class Hours extends Time {
  toSeconds(): Seconds {
    return new Seconds(this.value * 3600);
  }

  toMinutes(): Minutes {
    return new Minutes(this.value * 60);
  }

  toHours(): Hours {
    return this;
  }
}

export default Hours;
