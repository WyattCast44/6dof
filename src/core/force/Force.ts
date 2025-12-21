abstract class Force {
  constructor(public readonly value: number) {}

  abstract toNewtons(): any;
  abstract toPoundForce(): any;
  abstract toString(): string;
}

export default Force;
