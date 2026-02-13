/**
 * Control surface deflections and throttle setting.
 *
 * All angular deflections are in radians.
 * Throttle is normalized 0 (idle) to 1 (full power).
 */
interface ControlInput {
  throttle: number;  // 0 to 1
  elevator: number;  // radians
  aileron: number;   // radians
  rudder: number;    // radians
}

/**
 * Create a neutral (zero-deflection, idle-throttle) control input.
 */
function neutralControls(): ControlInput {
  return { throttle: 0, elevator: 0, aileron: 0, rudder: 0 };
}

export { neutralControls };
export type { ControlInput };
