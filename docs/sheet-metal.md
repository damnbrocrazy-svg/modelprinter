# Sheet metal model strings

A string describes a formed profile followed by named through-cut features:

```
sheetmetal_angle_w24mm_l20mm_h16mm_t1.2mm_r2mm_hole1(r3mm_bottomface_leftofcenter3mm)_slot1(l12mm_w3mm_angledface_horizontal)
```

`w` is sheet width, `l` is straight base length, `h` is straight flange height,
`t` is thickness, and the outer `r` is inside bend radius. Straight lengths
exclude the curved bends. Profiles are `plate`, `angle` (one 90-degree upright),
and `channel` (two 90-degree uprights). This is formed geometry, not a flat
pattern or bend-allowance calculation.

## Features

- `hole1(r3mm_bottomface_leftofcenter3mm)`: radius 3 mm through-hole.
- `hole2(d3.2mm_bottomface_rightofcenter8mm_abovecenter9mm)`: diameter 3.2 mm through-hole.
- `slot1(l12mm_w3mm_angledface_horizontal)`: capsule-shaped through-slot,
  overall length 12 mm and width 3 mm, including its semicircular ends.

Feature names use positive integer suffixes and must be unique (`hole1`,
`hole2`, `slot1`). Parameter order inside parentheses does not matter. Use
exactly one face per feature. Round holes require exactly one of `r` or `d`;
slots require `l` and `w`, with length at least width. Slots default to
`horizontal`; `vertical` rotates them 90 degrees in the face's coordinate frame.
Dimensions and offset magnitudes must be positive. Units default to mm.

## Faces and positions

The base is centered at world X/Y zero, with its midsurface at Z zero.
Uprights extend toward +Z. Every feature starts at the center of the **straight
portion** of its selected face, excluding bend arcs. Omitted offsets are zero.

| Face | Profiles | View defining left/right and above/below |
| --- | --- | --- |
| `bottomface` | All | Look down from +Z, +X to the right, +Y above |
| `angledface` | Angle | Look from +X, +Y to the right, +Z above |
| `leftface` | Channel | Wall on -X; look from -X, -Y to the right, +Z above |
| `rightface` | Channel | Wall on +X; look from +X, +Y to the right, +Z above |

`bottomface` names the base panel, not a cut direction. All features cut through
the full thickness. Use `leftofcenter`, `rightofcenter`, `abovecenter`, and
`belowcenter` with positive distances. Opposing offsets on the same axis are
an error, rather than silently cancelling. Face tokens cannot create new panels;
`angledface` does not specify an arbitrary fold angle.

Unknown tokens, repeated parameters, duplicate feature names, unavailable faces,
and malformed parentheses are rejected when parsing. Geometry generation in jscad-electronics additionally
rejects cutouts touching/crossing an edge or bend tangent and overlapping cutout
bounding boxes (a conservative restriction).

The parser compiles this language to the parameter schema's `panel`, `u`, and `v`
coordinates. Application examples and visual snapshots should use complete model
strings rather than duplicating those internal coordinates.
