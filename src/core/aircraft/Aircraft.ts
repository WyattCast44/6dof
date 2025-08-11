import type StateVector from "../numerical/StateVector";
import type AircraftDynamicsModel from "./AircraftDynamicsModel";
import type AircraftProperties from "./AircraftProperties";

class Aircraft {
    private properties: AircraftProperties;
    private dynamicsModel: AircraftDynamicsModel;
    private initialState: StateVector;

    constructor({
        properties,
        dynamicsModel,
        initialState,
    }: {
        properties: AircraftProperties;
        dynamicsModel: AircraftDynamicsModel;
        initialState: StateVector;
    }) {
        this.properties = properties;
        this.dynamicsModel = dynamicsModel;
        this.initialState = initialState;
    }
}

export default Aircraft;