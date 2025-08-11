abstract class Force {
  constructor(public readonly value: number) {}

  abstract toNewtons(): any;
  abstract toPoundForce(): any;
}

export default Force;
