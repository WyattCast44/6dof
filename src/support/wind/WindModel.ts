import CardinalDegree from "../angles/CardinalDegree";
import Feet from "../length/Feet";
import Meters from "../length/Meters";
import Knots from "../velocity/Knots";
import Wind from "./Wind";

class WindModel {
  private altitudes: Map<number, Wind> = new Map();

  constructor() {
    this.altitudes = new Map();
  }

  addAltitude(altitude: Feet | Meters, wind: Wind) {
    // the altitude given can be in feet or meters
    // but we need to store it as meters in the map
    // so we need to convert the altitude to meters
    const altitudeInMeters =
      altitude instanceof Feet ? altitude.toMeters() : altitude;

    // we need to store the wind at the altitude in the map
    this.altitudes.set(altitudeInMeters.value, wind);

    this.resortAltitudes();
  }

  private resortAltitudes(): void {
    // we need to resort the altitudes in the map
    // so that the altitudes are in ascending order
    // for example, if we have the following altitudes:
    // 1000, 2000, 3000, 4000, 5000
    // we need to resort them to:
    // 1000, 2000, 3000, 4000, 5000
    // so that the altitudes are in ascending order
    // and we can use the binary search to find the wind at a given altitude
    this.altitudes = new Map([...this.altitudes].sort((a, b) => a[0] - b[0]));
  }

  getWindAtAltitude(altitude: Feet | Meters): Wind {
    let altitudeInMeters =
      altitude instanceof Feet ? altitude.toMeters() : altitude;

    // ensure that the altitude is positive
    if (altitudeInMeters.value < 0) {
      altitudeInMeters = new Meters(0);
    }

    // No wind data available
    if (this.altitudes.size === 0) {
      return new Wind(new Knots(0), new CardinalDegree(0));
    }

    const altitudeArray = Array.from(this.altitudes.entries());
    const lowestAltitude = altitudeArray[0][0];
    const highestAltitude = altitudeArray[altitudeArray.length - 1][0];
    const highestWind = altitudeArray[altitudeArray.length - 1][1];
    const lowestWind = altitudeArray[0][1];

    // Single altitude point
    if (this.altitudes.size === 1) {
      return this.calculateDecayWind(altitudeInMeters.value, lowestWind);
    }

    // Altitude above highest known altitude
    if (altitudeInMeters.value >= highestAltitude) {
      return highestWind;
    }

    // Altitude below lowest known altitude
    if (altitudeInMeters.value <= lowestAltitude) {
      return this.calculateDecayWind(altitudeInMeters.value, lowestWind);
    }

    // Find the altitude range for interpolation
    const range = this.findAltitudeRange(altitudeInMeters.value);
    if (range) {
      const [wind1, wind2, alt1, alt2] = range;
      const ratio = (altitudeInMeters.value - alt1) / (alt2 - alt1);
      return this.interpolateWind(wind1, wind2, ratio);
    }

    // Fallback to highest wind
    return highestWind;
  }

  private findAltitudeRange(
    targetAltitude: number
  ): [Wind, Wind, number, number] | null {
    const altitudeArray = Array.from(this.altitudes.entries());

    // Binary search to find the appropriate altitude range
    let left = 0;
    let right = altitudeArray.length - 1;

    while (left < right - 1) {
      const mid = Math.floor((left + right) / 2);
      const midAltitude = altitudeArray[mid][0];

      if (targetAltitude < midAltitude) {
        right = mid;
      } else {
        left = mid;
      }
    }

    if (left < right) {
      const [alt1, wind1] = altitudeArray[left];
      const [alt2, wind2] = altitudeArray[right];
      return [wind1, wind2, alt1, alt2];
    }

    return null;
  }

  private interpolateWind(wind1: Wind, wind2: Wind, ratio: number): Wind {
    // Interpolate speed
    const speed1 =
      wind1.speed instanceof Knots ? wind1.speed.value : wind1.speed;
    const speed2 =
      wind2.speed instanceof Knots ? wind2.speed.value : wind2.speed;
    const interpolatedSpeed = speed1 + (speed2 - speed1) * ratio;

    // Interpolate direction
    const dir1 =
      wind1.direction instanceof CardinalDegree
        ? wind1.direction
        : new CardinalDegree(wind1.direction);
    const dir2 =
      wind2.direction instanceof CardinalDegree
        ? wind2.direction
        : new CardinalDegree(wind2.direction);
    const interpolatedDirection = this.interpolateDirection(dir1, dir2, ratio);

    return new Wind(new Knots(interpolatedSpeed), interpolatedDirection);
  }

  private interpolateDirection(
    dir1: CardinalDegree,
    dir2: CardinalDegree,
    ratio: number
  ): CardinalDegree {
    // Convert to radians for interpolation
    const rad1 = dir1.toRadians().value;
    const rad2 = dir2.toRadians().value;

    // Handle circular interpolation by finding the shortest angular distance
    let delta = rad2 - rad1;

    // Normalize to [-π, π]
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;

    // Interpolate
    const interpolatedRad = rad1 + delta * ratio;

    // Convert back to degrees and create CardinalDegree
    const interpolatedDeg = (interpolatedRad * 180) / Math.PI;
    return new CardinalDegree(interpolatedDeg);
  }

  private calculateDecayWind(targetAltitude: number, lowestWind: Wind): Wind {
    const lowestSpeed = lowestWind.speed.value;
    const surfaceSpeed = lowestSpeed * 0.1; // 10% of lowest speed at surface

    // Calculate the altitude where the lowest wind occurs
    const altitudeArray = Array.from(this.altitudes.entries());
    const lowestAltitude = altitudeArray[0][0];

    // Linear decay from lowest altitude to surface (0 altitude)
    // At lowestAltitude: speed = lowestSpeed
    // At 0 altitude: speed = surfaceSpeed
    const decayRate = (lowestSpeed - surfaceSpeed) / lowestAltitude;
    const targetSpeed = Math.max(surfaceSpeed + decayRate * targetAltitude, 0);

    // Use the direction from the lowest wind
    const direction =
      lowestWind.direction instanceof CardinalDegree
        ? lowestWind.direction
        : new CardinalDegree(lowestWind.direction);

    return new Wind(new Knots(targetSpeed), direction);
  }

  getMinAltitude(): Meters {
    if (this.altitudes.size === 0) return new Meters(0);
    return new Meters(Math.min(...this.altitudes.keys()));
  }

  getMaxAltitude(): Meters {
    if (this.altitudes.size === 0) return new Meters(0);
    return new Meters(Math.max(...this.altitudes.keys()));
  }

  hasWindData(): boolean {
    return this.altitudes.size > 0;
  }
}

export default WindModel;
