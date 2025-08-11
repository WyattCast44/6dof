import RadiansPerSecond from "../rates/RadiansPerSecond";

/**
 * The rotational velocities are a set of three angular velocities that describe the rotational motion of the aircraft.
 * 
 * Roll is the angular velocity around the x axis (roll axis). Positive is right.
 * 
 * Pitch is the angular velocity around the y axis (pitch axis). Positive is up.
 * 
 * Yaw is the angular velocity around the z axis (yaw axis). Positive is right.
 */
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