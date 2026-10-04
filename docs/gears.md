# Parameterized gears

`spurgear` describes an external involute spur gear. `wormgear` describes the
helical worm screw in a worm drive. `helicalgear` describes an external
helical involute gear. All three produce renderer-independent model
definitions; JSCAD solids and geometry tests belong in jscad-electronics.

This initial contract supports visualization and mechanical layout. Spur tooth
flanks follow the standard involute above the base circle, with a radial
extension to the root when it lies below the base circle. The model does not
generate manufacturing undercut, trochoidal root fillets, profile shift,
chamfers, or tolerances. Low tooth counts are allowed with that illustrative
root extension. The worm uses a simplified trapezoidal axial rack profile
swept helically. It does not describe a conjugate mating worm wheel, a hobbed
envelope, or a manufacturing-ready worm drive.

Lengths accept millimeters as numbers or complete numeric strings with optional
`mm`, `cm`, `m`, `in`, `inch`, `mil`, `ft`, or `feet` units. All output lengths
are millimeters. Angles in direct props are numbers in degrees; angle tokens
accept numbers with an optional `deg` suffix. Pressure angles must be finite,
greater than zero and less than 90 degrees, and must satisfy the tooth-profile
constraints below. Phase accepts any finite angle. Unknown properties, tokens,
duplicate aliases, malformed numbers, and count values with units are rejected.

## Spur gear

```ts
import { getSpurGearDimensions, mp, spurGearModelPropsSchema } from "@tscircuit/modelprinter"

mp.string("spurgear24_m1mm_w5mm_bore5mm").json()
mp.string("spurgear_teeth40_module1.5mm_facewidth8mm_pa20deg_backlash0.1mm").json()
mp.string("spurgear32_m1mm_bore5mm_hubdiameter12mm_hublength3mm_phase15deg").json()
spurGearModelPropsSchema.parse({ toothCount: 24, module: "1mm", faceWidth: "5mm" })
getSpurGearDimensions({ toothCount: 24, module: 1 })
```

| Direct property | Default | Model-string modifier | Meaning |
| --- | --- | --- | --- |
| `toothCount` | 24 | inline `spurgear24` or `teeth24` | Integer 6–512 |
| `module` | 1 mm | `m`, `module` | Pitch diameter / tooth count |
| `faceWidth` | 5 mm | `w`, `width`, `facewidth` | Positive axial thickness |
| `pressureAngle` | 20° | `pa`, `pressureangle` | Involute pressure angle |
| `backlash` | 0 mm | `backlash` | Nonnegative tangential tooth thinning at the pitch circle |
| `clearance` | 0.25 mm | `clearance` | Nonnegative additional radial dedendum |
| `boreDiameter` | 0 mm | `bore`, `borediameter` | Zero disables the through bore |
| `hubDiameter` | 0 mm | `hubdiameter` | Zero disables the hub |
| `hubLength` | 0 mm | `hublength` | Hub projection above the +Z face |
| `phase` | 0° | `phase` | Rotation about +Z |
| `segmentsPerTooth` | 12 | `segments` | Integer 4–64; outline subdivision control |

The rotation axis is +Z, the lower face is Z=0, and the upper face is
Z=`faceWidth`. The optional hub projects from there to
Z=`faceWidth + hubLength`. Phase zero centers one tooth on +X; positive phase
rotates it toward +Y. The through bore also passes through the hub.

For module `m`, tooth count `N`, pressure angle `a`, backlash `b`, and clearance
`c`, `getSpurGearDimensions` validates props and returns:

| Dimension | Formula |
| --- | --- |
| `pitchDiameter` | `m * N` |
| `baseDiameter` | `pitchDiameter * cos(a)` |
| `outsideDiameter` | `pitchDiameter + 2*m` |
| `rootDiameter` | `pitchDiameter - 2*(m + c)` |
| `circularPitch` | `PI * m` |
| `toothThickness` | `PI * m/2 - b` |

The addendum is one module; the dedendum is one module plus the fixed
millimeter clearance. All derived dimensions must be finite, the root diameter
must be positive, and the bore must be smaller than the root. Hub diameter and
length must both be zero or both positive; an enabled hub must exceed the bore
and remain smaller than the root diameter.

With radians used for the calculation, `inv(a) = tan(a) - a` and the half tooth
angle at radius `r >= baseRadius` is
`toothThickness/(2*pitchRadius) + inv(a) - inv(acos(baseRadius/r))`.
The half angle at the outside radius must remain positive. The half angle at
`max(rootRadius, baseRadius)` must remain less than `PI/N`, preserving a root
gap between adjacent teeth.

Two unshifted spur gears use matching module and pressure angle. Their nominal
center distance is `module * (toothCount1 + toothCount2) / 2`; their speed ratio
comes from their tooth counts. Backlash thins each gear independently, so
thinning both gears contributes clearance to the pair.

## Worm screw

```ts
import { getWormGearDimensions, mp, wormGearModelPropsSchema } from "@tscircuit/modelprinter"

mp.string("wormgear_m1mm_d10mm_l20mm_starts2_left_bore3mm").json()
mp.string("wormgear_module1.5mm_pitchdiameter15mm_length30mm_starts4_right_pa20deg").json()
wormGearModelPropsSchema.parse({ module: 1, pitchDiameter: 10, starts: 2 })
getWormGearDimensions({ module: 1, pitchDiameter: 10, starts: 2 })
```

| Direct property | Default | Model-string modifier | Meaning |
| --- | --- | --- | --- |
| `module` | 1 mm | `m`, `module` | Axial module |
| `pitchDiameter` | 10 mm | `d`, `pitchdiameter` | Positive pitch-cylinder diameter |
| `length` | 20 mm | `l`, `length` | Positive axial length |
| `starts` | 1 | `starts` | Integer 1–8; simultaneous helical threads |
| `pressureAngle` | 20° | `pa`, `pressureangle` | Axial rack pressure angle |
| `backlash` | 0 mm | `backlash` | Nonnegative axial tooth thinning at the pitch cylinder |
| `clearance` | 0.25 mm | `clearance` | Nonnegative additional radial dedendum |
| `boreDiameter` | 0 mm | `bore`, `borediameter` | Zero disables the through bore |
| `handedness` | `"right"` | `right`, `left` | Mutually exclusive flags without values |
| `phase` | 0° | `phase` | Rotation about +Z |
| `radialSegments` | 96 | `segments` | Integer 24–256, divisible by four |
| `segmentsPerTurn` | 32 | `turnsegments` | Integer 12–128; subdivisions per helical revolution |

The worm axis is +Z and the body extends from Z=0 to Z=`length`. A right-hand
thread advances from +X toward +Y as Z increases; a left-hand thread reverses
that angular progression. Phase rotates all starts together about +Z. Threads
are cut flat at the two end planes, with no thread lead-in or chamfer.

For axial module `m`, pitch diameter `d`, number of starts `s`, backlash `b`, and
clearance `c`, `getWormGearDimensions` validates props and returns:

| Dimension | Formula |
| --- | --- |
| `pitchDiameter` | `d` |
| `outsideDiameter` | `d + 2*m` |
| `rootDiameter` | `d - 2*(m + c)` |
| `axialPitch` | `PI * m` |
| `lead` | `s * axialPitch` |
| `leadAngle` | `atan(lead / (PI*d))`, in degrees |
| `toothThickness` | `axialPitch/2 - b` |

The module is explicitly axial; it is not the worm's normal module. Increasing
starts increases lead and lead angle without changing axial pitch or tooth
thickness. All derived dimensions must be finite, the root diameter positive,
and the bore smaller than the root. With axial pressure angle `a`, tip thickness
`toothThickness - 2*m*tan(a)` must be positive, and root thickness
`toothThickness + 2*(m + c)*tan(a)` must be less than axial pitch. These
conditions prevent flattened-away crests and overlapping thread roots.

The exported `SpurGearModelPropsInput` / `WormGearModelPropsInput` types accept
optional defaulted properties; `SpurGearModelProps` / `WormGearModelProps` contain
normalized numbers and resolved defaults. Their `ModelDefinition` counterparts
add `fn: "spurgear"` / `fn: "wormgear"` and are included in the exported
`modelDefinitionSchema` union. Dimension helpers accept props without `fn`.

## Helical gear

`helicalgear` sweeps the spur gear's transverse involute profile along a helix.
It shares all spur properties, defaults, units, tooth-profile validation, bore,
hub, phase, and +Z placement. Its `module`, `pressureAngle`, and `backlash` are
**transverse**, measured in the XY section. At `helixAngle: 0`, it has the same
geometry and dimensions as a spur gear with the same properties.

```ts
import { getHelicalGearDimensions, getWormGearDimensions, helicalGearModelPropsSchema, mp } from "@tscircuit/modelprinter"

mp.string("helicalgear24_m1mm_w8mm_ha25deg_right_bore5mm").json()
mp.string("helicalgear_teeth32_module1mm_helixangle30deg_left_hubdiameter12mm_hublength3mm").json()
helicalGearModelPropsSchema.parse({ toothCount: 24, module: "1mm", helixAngle: 25 })
getHelicalGearDimensions({ toothCount: 24, module: 1, helixAngle: 25 })
```

| Additional property | Default | Model-string modifier | Meaning |
| --- | --- | --- | --- |
| `helixAngle` | 20° | `ha`, `helixangle` | Finite unsigned angle to the axis at the pitch cylinder, 0 ≤ angle < 90° |
| `handedness` | `"right"` | `right`, `left` | Mutually exclusive flags, following the worm convention |
| `segmentsPerTurn` | 32 | `turnsegments` | Integer 12–128; minimum subdivisions per full turn of twist |

Inline tooth count uses `helicalgear24`; `teeth`, `segments`, and every spur
length/angle modifier also work. Negative helix angles are rejected; choose
`left` to reverse the twist. A right-hand tooth advances counterclockwise about
+Z as Z increases. Phase specifies tooth orientation at Z=0. The bore and hub
remain straight circular cylinders.

`getHelicalGearDimensions` returns all spur dimensions plus, for helix angle
`beta` in radians and pitch diameter `d`:

| Dimension | Formula |
| --- | --- |
| `normalModule` | `module * cos(beta)` |
| `normalPressureAngle` | `atan(tan(pressureAngle) * cos(beta))`, in degrees |
| `normalPitch` | `circularPitch * cos(beta)` |
| `twistAngle` | `hand * 2 * faceWidth * tan(beta) / d`, in degrees; `hand` is +1 for right and −1 for left |

All derived dimensions must be finite. `twistAngle` is zero for a spur profile.
The exports `HelicalGearModelPropsInput`, `HelicalGearModelProps`,
`HelicalGearModelDefinition`, `helicalGearModelPropsSchema`, and
`helicalGearModelDefinitionSchema` follow the spur/worm contracts. The definition
has `fn: "helicalgear"` and is part of `modelDefinitionSchema`.

### Meshing conventions

Parallel-axis external helical gears use matching transverse module, pressure
angle, and helix-angle magnitude, with opposite hands. Their nominal center
distance is `module * (toothCountA + toothCountB) / 2`. To mesh with a spur gear
on a parallel shaft, use zero helix angle. A nonzero helical gear is not a
parallel-axis replacement for a spur gear. Crossed-axis arrangements require
matching normal module and normal pressure angle and the appropriate shaft
angle; equal transverse module alone is insufficient.

For a simplified perpendicular worm/helical-wheel layout, set the wheel's
transverse module and pressure angle equal to the worm's axial values, its
helix angle equal to the worm's lead angle, and use the same hand:

```ts
const worm = { module: 1, pitchDiameter: 10, starts: 2, pressureAngle: 20, handedness: "right" as const }
const wheel = helicalGearModelPropsSchema.parse({
  toothCount: 32,
  module: worm.module,
  pressureAngle: worm.pressureAngle,
  helixAngle: getWormGearDimensions(worm).leadAngle,
  handedness: worm.handedness,
})
```

This matches nominal pitch and helix conventions, with center distance
`(worm.pitchDiameter + wheel.module * wheel.toothCount) / 2` and nominal speed
ratio `wheel.toothCount / worm.starts`. It does not generate a throated/hobbed
worm wheel or establish conjugate contact with the existing simplified worm.
These remain visualization and layout models, without manufacturing tolerances,
contact analysis, root fillets, or undercut.
