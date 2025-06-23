import EulerAngles from "../attitude/EulerAngles";
import BodyVector from "../vectors/BodyVector";
import NedVector from "../vectors/NedVector";

/**
 * DCM - Direction Cosine Matrix
 * 
 * @link https://www.youtube.com/watch?v=TODDZnOT3ro
 * 
 * @description
 * 
 * A DCM is a 3x3 matrix that transforms vectors from one coordinate system to another.
 * 
 * It is used to convert between different coordinate systems, such as body, NED, and ENU.
 * 
 * The DCM is a rotation matrix, which means that it is orthogonal and has a determinant of 1.
 */

abstract class DCM {
    public readonly eulerAngles: EulerAngles;
    protected matrix: number[][] = [];

    constructor(eulerAngles: EulerAngles) {
        this.eulerAngles = eulerAngles;
        this.matrix = this.calculateBodyToNedDCM(eulerAngles);
    }

    abstract calculateBodyToNedDCM(eulerAngles: EulerAngles): number[][];

    /**
     * Transform a vector from body coordinates to NED coordinates
     * 
     * @param bodyVector - Vector in body coordinates [x, y, z]
     * @returns Vector in NED coordinates [north, east, down]
     */
    abstract transformFromBody(bodyVector: BodyVector): NedVector;

    /**
     * Transform a vector from NED coordinates to body coordinates
     * 
     * @param nedVector - Vector in NED coordinates [north, east, down]
     * @returns Vector in body coordinates [x, y, z]
     */
    abstract transformToBody(nedVector: NedVector): BodyVector;

    /**
     * Get the raw DCM matrix.
     * 
     * @throws Error if the DCM matrix is not initialized
     * 
     * @returns The DCM matrix
     */
    getMatrix(): number[][] {
        if (this.matrix.length === 0) {
            throw new Error("DCM matrix is not initialized");
        }

        // Return a deep copy of the matrix
        return this.matrix.map(row => [...row]);
    }

    /**
     * Get the transpose of the DCM.
     * 
     * The transpose of a matrix is a new matrix where the rows and columns are swapped.
     * 
     * @returns The transpose of the DCM
     */
    abstract getTranspose(): number[][];

    /**
     * Get the inverse of the DCM.
     * 
     * Alias for getTranspose().
     * 
     * @returns The inverse of the DCM
     */
    getInverse(): number[][] {
        return this.getTranspose();
    }

    /**
     * Check if the DCM is orthogonal.
     * 
     * Orthogonal matrix is a square matrix whose transpose is equal to its inverse.
     * 
     * @param tolerance - The tolerance for the check
     * 
     * @returns True if the DCM is orthogonal, false otherwise
     */
    abstract isOrthogonal(tolerance: number): boolean;

    /**
     * Get the determinant of the DCM. 
     * 
     * It should be 1 for proper rotation matrix.
     * 
     * @returns The determinant of the DCM
     */
    abstract getDeterminant(): number;
}

export default DCM;