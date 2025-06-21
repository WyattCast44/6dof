class AircraftProperties {
    // mass
    public readonly mass_kg: number = 0;
    /**
     * Moment of inertia
     */
    // jxx = roll inertia?
    public readonly jxx_b_kgm2: number = 0;
    // jyy = pitch inertia?
    public readonly jyy_b_kgm2: number = 0;
    // jzz = yaw inertia?
    public readonly jzz_b_kgm2: number = 0;
    // jxz = cross-product of inertia?
    public readonly jxz_b_kgm2: number = 0;

    // center of gravity
    constructor() {}
}

export default AircraftProperties;