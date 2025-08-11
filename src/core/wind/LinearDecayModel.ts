import DecayModel from "./DecayModel";

/**
 * The linear decay wind model is a simple wind model 
 * that decays the wind speed linearly with altitude.
 */
class LinearDecayModel extends DecayModel {
    constructor(private decayRate: number = 0.1) {
        super();
    }

    getDecayFactor(): number {
        return this.decayRate;
    }
}

export default LinearDecayModel;