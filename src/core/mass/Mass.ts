abstract class Mass {
  constructor(public readonly value: number) {}
  abstract toKilograms(): any;
}

export default Mass;