export function round(value: number, precision: number = 0): number {
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

export function degToRad(value: number): number {
  return value * Math.PI / 180;
}

export function radToDeg(value: number): number {
  return value * 180 / Math.PI;
}