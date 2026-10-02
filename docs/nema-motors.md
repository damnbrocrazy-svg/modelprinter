# NEMA stepper motors

`mp.string("nema8").json()`, `nema17`, and `nema23` resolve to `fn: "nema"`
and `nemaSize: 8 | 17 | 23`. Lengths are millimeters or unit-bearing strings.
`nemaMotorModelPropsSchema` validates direct props with a required `nemaSize`.

| Default | NEMA 8 | NEMA 17 | NEMA 23 |
| --- | --- | --- | --- |
| Body width × length | 20.3 × 33 | 42.3 × 38 | 56.4 × 51 |
| Square hole pitch | 16 | 31 | 47.14 |
| Hole center coordinates | (±8, ±8) | (±15.5, ±15.5) | (±23.57, ±23.57) |
| Hole diameter / depth | 2 / 2 blind | 3 / 4.5 blind | 5 / through front flange |
| Pilot diameter × height | 15 × 1.5 | 22 × 2 | 38.1 × 1.6 |
| Shaft diameter × length from face | 4 × 15 | 5 × 24 | 6.35 × 20.6 |
| Shaft shape | round | D | D |
| D flat depth / length | 0.5 / 10 when enabled | 0.5 / 15 | 0.5 / 15 |

Mounting, pilot and shaft dimensions follow representative Nanotec drawings:
[SCA2018](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_SCA2018.pdf),
[ST4118](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST4118.pdf),
[ST5918](https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST5918.pdf).
Frame names do not guarantee body length or shaft details. D cuts, cap lengths
and corner chamfers are illustrative defaults; no screw threads or wires are modeled.

The shaft axis is +Z. The mounting face is Z=0, the body spans -bodyLength to 0,
and the shaft tip is at shaftLength (measured from the face, including the pilot).
The flat runs back from the tip for shaftFlatLength. Flat depth is radial material
removed, so a 5 mm shaft with a 0.5 mm cut measures 4.5 mm from flat to opposite
side. Flat angle is degrees counterclockwise around +Z, starting on the +X side.

```ts
mp.string("nema17_l48mm_shaftlength24mm_dshaft_flatdepth0.5mm_flatlength15mm_flatangle90deg").json()
// Alternative small-motor mounting geometry:
mp.string("nema8_holespacing15.4mm_pilotdiameter16mm").json()
// 8 mm NEMA 23 shaft:
mp.string("nema23_shaftdiameter8mm_shaftlength25mm_flatdepth0.5mm_flatlength20mm").json()
```

Modifiers: `l` / `length` / `bodylength`, `bodywidth`, `shaftlength`,
`shaftdiameter`, `round` / `dshaft`, `flatdepth`, `flatlength`, `flatangle`,
`holespacing`, `holediameter`, `holedepth`, `throughholes` / `blindholes`,
`pilotdiameter`, `pilotlength`, `frontcap`, `rearcap`, `facechamfer`, `bodychamfer`.
Duplicate, unknown and geometrically invalid parameters fail validation.

This package defines parameters and parses model strings; it does not generate
motor geometry. The corresponding components in jscad-electronics build the
JSCAD solids and own the visual snapshots and geometry tests.

## Rear face

The rear face is Z=-bodyLength. Bare model strings show four installed socket-head
cap screws. `_backfaceholes` removes the screws and exposes four blind bores;
`_backfacescrews` explicitly selects installed screws. `_plainbackface` omits both.
These flags are mutually exclusive. Direct props use `backFace: "holes" | "screws" | "plain"`.

Rear fasteners are representative configurable details, not guaranteed by a NEMA
frame number. The square rear pitch defaults to the mounting pitch (16 / 31 /
47.14 mm), independently overridden by `backFaceHoleSpacing` / `_backholespacing`.
The enabled rear face uses the front-face outline so the NEMA23 rear fasteners
have support outside the chamfered core. Front flange holes are unchanged.

| Rear default (mm) | NEMA8 | NEMA17 | NEMA23 |
| --- | --- | --- | --- |
| Screw size | M2 | M3 | M4 |
| Bore diameter / depth | 2 / 2 | 3 / 4.5 | 4 / 4.5 |
| Head diameter / height | 3.8 / 2 | 5.5 / 3 | 7 / 4 |

`backFaceScrewSize` / `_backscrewm3` selects the existing ISO 4762 bolt
head/socket dimensions. `backFaceHoleDiameter` / `_backholediameter` and
`backFaceHoleDepth` / `_backholedepth` override the bores. Heads extend outward
along -Z, increasing the complete model's length beyond the body length.
Screw shanks are smooth and only occupy the rear bore; internal tie rods and
threads are not represented. Validation rejects bores without floors,
screws larger than the bore, and holes or heads that cross the rear-face edge.

```ts
mp.string("nema17_backfaceholes").json()
mp.string("nema23_backfacescrews_backholespacing40mm_backscrewm3").json()
```
