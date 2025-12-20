import StateVector from "../numerical/StateVector";
import AircraftProperties from "./AircraftProperties";

class Aircraft {
    private properties: AircraftProperties;
    private initialState: StateVector;
    private currentState: StateVector;
    private stateHistory: StateVector[] = [];

    constructor({
        properties,
        initialState,
    }: {
        properties: AircraftProperties;
        initialState: StateVector;
    }) {
        this.properties = properties;
        this.initialState = initialState;
        this.currentState = initialState;
        this.stateHistory.push(initialState);
    }

    getProperties(): AircraftProperties {
        return this.properties;
    }

    getInitialState(): StateVector {
        return this.initialState;
    }

    getCurrentState(): StateVector {
        return this.currentState;
    }

    setCurrentState(state: StateVector): void {
        this.currentState = state;
        this.stateHistory.push(state);
    }

    getStateHistory(): StateVector[] {
        return this.stateHistory;
    }
}

export default Aircraft;