import CardinalDegree from "../angles/CardinalDegree";
import type AtmosphereModel from "../atmosphere/AtmosphereModel";
import StandardAtmosphere1976 from "../atmosphere/StandardAtmosphere1976";
import ConstantGravityModel from "../gravity/ConstantGravityModel";
import type GravityModel from "../gravity/GravityModel";
import Feet from "../length/Feet";
import Knots from "../velocity/Knots";
import Wind from "../wind/Wind";
import WindModel from "../wind/WindModel";

class Environment
{
    constructor(
        public readonly gravityModel: GravityModel,
        public readonly atmosphereModel: AtmosphereModel,
        public readonly windModel: WindModel,
    ) {
    }
}

let windModel = new WindModel();
windModel.addAltitude(new Feet(0), new Wind(new Knots(5), new CardinalDegree(260)));
windModel.addAltitude(new Feet(1000), new Wind(new Knots(10), new CardinalDegree(260)));
windModel.addAltitude(new Feet(5000), new Wind(new Knots(20), new CardinalDegree(310)));
windModel.addAltitude(new Feet(10000), new Wind(new Knots(50), new CardinalDegree(340)));

let gravityModel = new ConstantGravityModel();
let atmosphereModel = new StandardAtmosphere1976(gravityModel);

let environment = new Environment(
    gravityModel,
    atmosphereModel,
    windModel
);

console.log(environment);

export default Environment;