# Straight round shaft

Roadmap #13, item 0016: `mp.string("shaft_d8mm_l300mm").json()` returns
`{ fn: "shaft", diameter: 8, length: 300 }`.

This contract describes a solid round shaft with a constant diameter. It does
not imply a thread, hollow bore, keyway, material, surface finish or manufacturing
tolerance. Geometry generation belongs in `tscircuit/jscad-electronics`.

| Token | JSON property | Default (mm) |
| --- | --- | --- |
| `d`, `diameter` | `diameter` | 8 |
| `l`, `length` | `length` | 300 |

The family, token names and units are case insensitive. Token order is arbitrary.
Each dimension can appear once, including aliases. Unknown tokens, inline family
values, missing values and repeated dimensions are errors.

Dimensions are positive finite decimal lengths, normalized to millimeters.
Numbers and unitless strings mean millimeters. Supported suffixes: `mm`, `cm`,
`m`, `in`, `inch`, `mil`, `ft`, `feet`. Unit-bearing strings must contain the entire
dimension, without internal whitespace, trailing text, fractions or exponents.
The diameter and length are independent: short shafts are valid.

`shaft` uses both defaults. `shaft_l2in_d.5in` produces a 50.8 mm long,
12.7 mm diameter shaft. `shaftModelPropsSchema` accepts `{ diameter, length }`;
`shaftModelDefinitionSchema` and the shared `modelDefinitionSchema` also require
`fn: "shaft"`. All reject unknown fields.
