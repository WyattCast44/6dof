# Aircraft Properties Reference Guide

This document explains the physical meaning, typical values, and sources for each property in the `AircraftProperties` interface used in the flight dynamics simulation.

## Table of Contents

1. [Mass and Geometry](#mass-and-geometry)
2. [Inertia Properties](#inertia-properties)
3. [Aerodynamic Coefficients](#aerodynamic-coefficients)
   - [Lift Coefficients](#lift-coefficients)
   - [Drag Coefficients](#drag-coefficients)
   - [Side Force Coefficients](#side-force-coefficients)
   - [Roll Moment Coefficients](#roll-moment-coefficients)
   - [Pitch Moment Coefficients](#pitch-moment-coefficients)
   - [Yaw Moment Coefficients](#yaw-moment-coefficients)
4. [Typical Values by Aircraft Type](#typical-values-by-aircraft-type)
5. [How to Obtain These Values](#how-to-obtain-these-values)

---

## Mass and Geometry

### `mass` (kg)

**What it is:** Total aircraft mass including fuel, payload, and structure.

**Physical meaning:** Determines inertial response to forces (F = ma) and the weight force (W = mg).

**How to find it:**
- Aircraft Pilot Operating Handbook (POH)
- Type Certificate Data Sheet (TCDS)

**Typical values:**
| Aircraft Type | Mass (kg) |
|--------------|-----------|
| Light GA (Cessna 172) | 1,000 - 1,200 |
| Twin Engine (Baron) | 2,000 - 2,500 |
| Regional Jet | 20,000 - 50,000 |
| Transport (737) | 60,000 - 80,000 |

---

### `wingArea` (S, m²)

**What it is:** Reference wing planform area, typically the projected area of the wing including the fuselage portion.

**Physical meaning:** Used to non-dimensionalize aerodynamic forces:
```
Lift = ½ρV²S·CL
Drag = ½ρV²S·CD
```

**How to find it:**
- Aircraft specifications
- Type Certificate Data Sheet
- Estimate: S ≈ wingspan × mean_chord

**Typical values:**
| Aircraft Type | Wing Area (m²) |
|--------------|----------------|
| Light GA | 14 - 18 |
| Business Jet | 25 - 50 |
| Regional Jet | 50 - 100 |
| Transport | 100 - 500 |

---

### `wingspan` (b, m)

**What it is:** Distance from wingtip to wingtip.

**Physical meaning:** 
- Determines aspect ratio (AR = b²/S)
- Used to non-dimensionalize roll and yaw moments
- Affects induced drag and roll rate

**Typical values:**
| Aircraft Type | Wingspan (m) |
|--------------|--------------|
| Light GA | 10 - 12 |
| Business Jet | 15 - 25 |
| Regional Jet | 25 - 35 |
| Transport | 35 - 80 |

---

### `meanChord` (c̄, m)

**What it is:** Mean Aerodynamic Chord (MAC) - a weighted average of the chord distribution.

**Physical meaning:**
- Reference length for pitch moment coefficient
- Used to locate center of gravity and aerodynamic center

**How to calculate:**
For a rectangular wing: c̄ = wing_area / wingspan
For tapered wings: More complex integration required

**Typical values:**
| Aircraft Type | Mean Chord (m) |
|--------------|----------------|
| Light GA | 1.3 - 1.8 |
| Business Jet | 2.0 - 3.5 |
| Transport | 4.0 - 8.0 |

---

### `maxThrust` (N)

**What it is:** Maximum thrust available from the propulsion system.

**Physical meaning:** Determines climb capability, maximum speed, and acceleration.

**Conversions:**
- 1 hp ≈ 746 W
- For propeller: Thrust ≈ (Power × efficiency) / Velocity
- At static: Thrust ≈ (2 × Power × ρ × disk_area)^(1/3)

**Typical values:**
| Aircraft Type | Max Thrust (N) |
|--------------|----------------|
| Light GA (180 hp) | 1,500 - 2,000 |
| Twin Engine | 10,000 - 20,000 |
| Regional Jet | 50,000 - 100,000 |
| Transport (per engine) | 100,000 - 400,000 |

---

## Inertia Properties

Moments of inertia determine how the aircraft responds to torques. They appear in Euler's rotational equations of motion.

### `Ixx` (kg·m²) - Roll Inertia

**What it is:** Moment of inertia about the body x-axis (longitudinal/roll axis).

**Physical meaning:** Resistance to roll angular acceleration.
```
Roll acceleration = Roll moment / Ixx
```

**Typical values:** 500 - 2,000 kg·m² for light GA

---

### `Iyy` (kg·m²) - Pitch Inertia

**What it is:** Moment of inertia about the body y-axis (lateral/pitch axis).

**Physical meaning:** Resistance to pitch angular acceleration. Usually the largest moment of inertia.

**Typical values:** 1,000 - 3,000 kg·m² for light GA

---

### `Izz` (kg·m²) - Yaw Inertia

**What it is:** Moment of inertia about the body z-axis (vertical/yaw axis).

**Physical meaning:** Resistance to yaw angular acceleration.

**Typical values:** 1,500 - 4,000 kg·m² for light GA

---

### `Ixz` (kg·m²) - Product of Inertia

**What it is:** Cross-coupling between roll and yaw due to mass distribution.

**Physical meaning:** For aircraft with vertical symmetry (most conventional aircraft), Ixy = Iyz = 0, but Ixz may be non-zero due to engine placement, swept wings, etc.

**Typical values:** Often small or zero for symmetric aircraft

---

## Aerodynamic Coefficients

Aerodynamic coefficients non-dimensionalize forces and moments so they can be compared across different aircraft, speeds, and altitudes.

### Lift Coefficients

#### `CL0` - Zero-Alpha Lift Coefficient

**What it is:** Lift coefficient when angle of attack is zero.

**Physical meaning:** Lift generated by wing camber and incidence alone.

**Sign convention:** Positive means upward lift at α = 0

**Typical values:** 0.1 - 0.4 for cambered airfoils, 0 for symmetric airfoils

---

#### `CLα` (CLalpha) - Lift Curve Slope (per radian)

**What it is:** Rate of change of lift coefficient with angle of attack.
```
CL = CL0 + CLα × α
```

**Physical meaning:** How quickly lift increases as you pitch up.

**Theoretical value:** 2π ≈ 6.28 per radian for thin airfoil theory

**Practical values:** 4.0 - 6.0 per radian (finite wing effects reduce it)

**Estimation:**
```
CLα ≈ 2π × AR / (2 + √(AR² + 4))
```
where AR is aspect ratio.

---

### Drag Coefficients

#### `CD0` - Zero-Lift Drag Coefficient

**What it is:** Drag coefficient when lift is zero (parasitic drag).

**Physical meaning:** Drag from skin friction, form drag, and interference drag - independent of lift.

**Components:**
- Skin friction: ~0.005 - 0.010
- Form drag: ~0.005 - 0.015
- Interference: ~0.002 - 0.005

**Typical total values:**
| Aircraft Type | CD0 |
|--------------|-----|
| Clean GA | 0.025 - 0.035 |
| Retractable gear | 0.020 - 0.028 |
| Jet transport | 0.015 - 0.020 |

---

#### `CDα` - Induced Drag Factor

**What it is:** Coefficient for the parabolic drag polar.
```
CD = CD0 + CDα × α²
```

Or more commonly written as:
```
CD = CD0 + CL² / (π × e × AR)
```

**Physical meaning:** Drag increase due to lift (induced drag from wingtip vortices).

**Estimation:**
```
CDα ≈ CLα² / (π × e × AR)
```
where e ≈ 0.7-0.9 is the Oswald efficiency factor.

**Typical values:** 0.2 - 0.5

---

### Side Force Coefficients

#### `CYβ` (CYbeta) - Side Force Due to Sideslip (per radian)

**What it is:** Rate of change of side force coefficient with sideslip angle.

**Physical meaning:** Side force generated when the aircraft is flying with sideslip (yawing into the relative wind).

**Sign convention:** Negative means sideslip to the right (positive β) produces side force to the left.

**Typical values:** -0.3 to -0.8 per radian

**Primary contributors:** Fuselage, vertical tail

---

### Roll Moment Coefficients

Roll moment (L or l) causes the aircraft to bank. Positive roll moment raises the left wing.

#### `Clβ` (Clbeta) - Dihedral Effect (per radian)

**What it is:** Roll moment generated due to sideslip.

**Physical meaning:** When the aircraft sideslips, dihedral causes it to roll away from the sideslip direction. This is a primary lateral stability derivative.

**Sign convention:** Negative means sideslip to the right (positive β) causes left roll (negative), which is stabilizing.

**Primary contributors:**
- Wing dihedral angle (main)
- Wing sweep
- Wing vertical position (high wing adds negative Clβ)

**Typical values:** -0.05 to -0.15 per radian

**Stability requirement:** Must be negative for spiral stability

---

#### `Clp` - Roll Damping (per rad/s, normalized)

**What it is:** Roll moment due to roll rate.
```
Cl_due_to_p = Clp × (p × b / 2V)
```

**Physical meaning:** When rolling, the downgoing wing sees increased angle of attack (more lift) and the upgoing wing sees decreased angle of attack (less lift). This opposes the roll - damping.

**Sign convention:** Negative means roll rate produces opposing moment (always negative for conventional aircraft).

**Typical values:** -0.4 to -0.6

---

#### `Clr` - Roll Due to Yaw Rate

**What it is:** Roll moment generated by yaw rate.

**Physical meaning:** When yawing, the advancing wing moves faster (more lift) and retreating wing slower (less lift), causing a roll.

**Sign convention:** Positive means yaw right (positive r) causes right roll (positive).

**Typical values:** 0.05 to 0.20

---

### Pitch Moment Coefficients

Pitch moment (M or m) causes the aircraft to pitch up or down. Positive pitch moment raises the nose.

#### `Cm0` - Zero-Lift Pitching Moment

**What it is:** Pitch moment coefficient when lift is zero.

**Physical meaning:** Moment generated by airfoil camber and aircraft geometry at zero lift.

**Sign convention:** Positive means nose-up moment

**Typical values:** -0.1 to +0.1 (depends heavily on CG location)

---

#### `Cmα` (Cmalpha) - Pitch Stiffness (per radian)

**What it is:** Rate of change of pitch moment with angle of attack. THE critical longitudinal stability derivative.

**Physical meaning:** When angle of attack increases, does the aircraft pitch nose-up (unstable) or nose-down (stable)?

**Sign convention:** 
- **Negative = Stable** (pitch up → nose-down moment → returns to trim)
- Positive = Unstable

**Typical values:** -0.3 to -1.5 per radian

**Factors affecting it:**
- CG location (forward CG more stable)
- Tail size and moment arm
- Wing aerodynamic center location

**Stability requirement:** MUST be negative for static longitudinal stability

---

#### `Cmq` - Pitch Damping (per rad/s, normalized)

**What it is:** Pitch moment due to pitch rate.
```
Cm_due_to_q = Cmq × (q × c̄ / 2V)
```

**Physical meaning:** When pitching, the horizontal tail sees a change in angle of attack that opposes the pitching motion.

**Sign convention:** Negative means pitch rate produces opposing moment (damping).

**Typical values:** -10 to -25

**Primary contributor:** Horizontal tail

---

### Yaw Moment Coefficients

Yaw moment (N or n) causes the aircraft to yaw left or right. Positive yaw moment turns the nose to the right.

#### `Cnβ` (Cnbeta) - Weathercock Stability (per radian)

**What it is:** Yaw moment generated due to sideslip. THE critical directional stability derivative.

**Physical meaning:** When sideslipping, does the aircraft yaw into the wind (stable) or away from it (unstable)? Like a weathervane.

**Sign convention:**
- **Positive = Stable** (sideslip right → yaw right → reduces sideslip)
- Negative = Unstable

**Typical values:** 0.05 to 0.15 per radian

**Primary contributor:** Vertical tail size and moment arm

**Stability requirement:** MUST be positive for directional stability

---

#### `Cnp` - Adverse Yaw

**What it is:** Yaw moment due to roll rate.

**Physical meaning:** When rolling, the downgoing wing has more drag (induced drag due to higher lift), causing the nose to yaw toward the raised wing - "adverse yaw."

**Sign convention:** Negative means roll right (positive p) causes yaw left (negative), which is adverse.

**Typical values:** -0.01 to -0.10

---

#### `Cnr` - Yaw Damping (per rad/s, normalized)

**What it is:** Yaw moment due to yaw rate.
```
Cn_due_to_r = Cnr × (r × b / 2V)
```

**Physical meaning:** When yawing, the vertical tail sees a change in sideslip angle that opposes the yawing motion.

**Sign convention:** Negative means yaw rate produces opposing moment (damping).

**Typical values:** -0.10 to -0.25

**Primary contributor:** Vertical tail

---

## Typical Values by Aircraft Type

### Light General Aviation (Cessna 172-like)

```typescript
{
  mass: 1043,           // kg
  wingArea: 16.2,       // m²
  wingspan: 11.0,       // m
  meanChord: 1.49,      // m
  maxThrust: 1800,      // N

  inertia: {
    Ixx: 1285,          // kg·m²
    Iyy: 1825,          // kg·m²
    Izz: 2667,          // kg·m²
    Ixz: 0,             // kg·m²
  },

  aeroCoefficients: {
    CL0: 0.25,
    CLalpha: 5.0,       // per radian
    CD0: 0.03,
    CDalpha: 0.3,
    CYbeta: -0.5,       // per radian
    Clbeta: -0.1,       // per radian
    Clp: -0.5,
    Clr: 0.1,
    Cm0: 0.05,
    Cmalpha: -0.5,      // per radian
    Cmq: -12.0,
    Cnbeta: 0.1,        // per radian
    Cnp: -0.03,
    Cnr: -0.15,
  }
}
```

### Fighter Aircraft (F-16-like)

```typescript
{
  mass: 12000,          // kg
  wingArea: 27.9,       // m²
  wingspan: 9.96,       // m
  meanChord: 3.45,      // m
  maxThrust: 130000,    // N (with afterburner)

  aeroCoefficients: {
    CL0: 0.0,           // Symmetric airfoil
    CLalpha: 3.5,       // Lower due to low aspect ratio
    CD0: 0.02,
    CDalpha: 0.4,
    Clbeta: -0.08,
    Clp: -0.35,
    Cmalpha: -0.3,      // Relaxed stability (fly-by-wire)
    Cmq: -8.0,
    Cnbeta: 0.08,
    Cnr: -0.12,
  }
}
```

---

## How to Obtain These Values

### 1. Published Sources

**NACA/NASA Reports:**
- Search NTRS (ntrs.nasa.gov) for "[aircraft name] stability derivatives"
- Example: NASA TN D-7428 for Cessna 172 data

**USAF DATCOM:**
- Empirical methods to estimate all coefficients
- Free download from DTIC

**Textbooks:**
- Napolitano's "Aircraft Dynamics" has tables of typical values
- Etkin's "Dynamics of Flight" has extensive data

### 2. Flight Test Data

**Sources:**
- FAA Type Certificate Data Sheets
- Military FLIGHT manuals (often declassified)
- Academic flight test reports

### 3. Computational Methods

**Panel Methods:** XFLR5, AVL (free software)
- Good for CLα, CDi, stability derivatives
- Less accurate for viscous effects

**CFD:** OpenFOAM, SU2
- High accuracy but computationally expensive
- Best for complex geometries

### 4. Estimation Formulas

For initial estimates without detailed data:

```typescript
// Lift curve slope (finite wing)
const AR = wingspan * wingspan / wingArea;
const CLalpha = 2 * Math.PI * AR / (2 + Math.sqrt(AR * AR + 4));

// Oswald efficiency
const e = 1.78 * (1 - 0.045 * Math.pow(AR, 0.68)) - 0.64;

// Induced drag factor
const k = 1 / (Math.PI * e * AR);
const CDalpha = CLalpha * CLalpha * k;

// Pitch damping (rough estimate)
const Cmq = -2 * CLalpha_tail * (tail_arm / meanChord) * (St / S);
```

---

## References

1. Anderson, J.D. (2016). *Introduction to Flight*, 8th Ed. McGraw-Hill.
2. Nelson, R.C. (1998). *Flight Stability and Automatic Control*, 2nd Ed. McGraw-Hill.
3. Etkin, B. & Reid, L.D. (1996). *Dynamics of Flight: Stability and Control*, 3rd Ed. Wiley.
4. Napolitano, M.R. (2012). *Aircraft Dynamics: From Modeling to Simulation*. Wiley.
5. USAF Stability and Control DATCOM. Flight Control Division, Air Force Flight Dynamics Laboratory, 1978.
6. Roskam, J. (1979). *Airplane Flight Dynamics and Automatic Flight Controls*. DARcorporation.

---

## Quick Reference Card

| Coefficient | What it Controls | Stable Sign | Typical Range |
|-------------|-----------------|-------------|---------------|
| CLα | Lift effectiveness | + | 4.0 to 6.0 |
| Cmα | Pitch stability | **−** | -0.3 to -1.5 |
| Cmq | Pitch damping | − | -10 to -25 |
| Clβ | Dihedral effect | **−** | -0.05 to -0.15 |
| Clp | Roll damping | − | -0.4 to -0.6 |
| Cnβ | Weathercock stability | **+** | 0.05 to 0.15 |
| Cnr | Yaw damping | − | -0.10 to -0.25 |

**Bold** = Critical stability derivatives that must have correct sign.
