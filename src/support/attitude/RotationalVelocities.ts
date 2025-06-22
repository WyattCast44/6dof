import RadiansPerSecond from "../rates/RadiansPerSecond";

class RotationalVelocities {
    public roll_p: RadiansPerSecond;
    public pitch_q: RadiansPerSecond;
    public yaw_r: RadiansPerSecond;

    constructor(
        roll_p: RadiansPerSecond|number,
        pitch_q: RadiansPerSecond|number,
        yaw_r: RadiansPerSecond|number
    ) {
        this.roll_p = roll_p instanceof RadiansPerSecond ? roll_p : new RadiansPerSecond(roll_p);
        this.pitch_q = pitch_q instanceof RadiansPerSecond ? pitch_q : new RadiansPerSecond(pitch_q);
        this.yaw_r = yaw_r instanceof RadiansPerSecond ? yaw_r : new RadiansPerSecond(yaw_r);
    }
}

export default RotationalVelocities;