import type CardinalDegree from "../angles/CardinalDegree";
import type Degrees from "../angles/Degrees";
import type Knots from "../velocity/Knots";

/**
 * The wind field is a vector field that describes the wind at a given point in space.
 * 
 * It has a horizontal and vertical component.
 * 
 * The horizontal component is the wind speed and direction.
 * 
 * The vertical component is the wind speed and direction.
 */
class WindField
{
    constructor(
        public readonly horizontalSpeed: Knots,
        public readonly horizontalDirection: CardinalDegree,
        public readonly verticalSpeed: Knots,
        public readonly verticalDirection: Degrees,
    ) {}
}

export default WindField;