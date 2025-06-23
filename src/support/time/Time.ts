abstract class Time {
    constructor(
        public readonly value: number
    ) {}

    abstract toSeconds(): any;
    abstract toMinutes(): any;
    abstract toHours(): any;
}

export default Time;