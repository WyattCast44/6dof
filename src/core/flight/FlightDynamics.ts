import Environment from "../environment/Environment";
import Aircraft from "../aircraft/Aircraft";

class FlightDynamics
{
    constructor(
        public readonly aircraft: Aircraft,
        public readonly environment: Environment
    ) {}
}

export default FlightDynamics;