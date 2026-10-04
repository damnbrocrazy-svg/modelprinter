# Flat washers

`flatwasher` describes an annular washer with a circular through-hole. It is
roadmap item 0006 in issue #13. This package defines the parameter contract;
mesh generation belongs in `tscircuit/jscad-electronics`.

```ts
mp.string("flatwasher_id6.4mm_od12mm_h1.6mm").json()
// { fn: "flatwasher", innerDiameter: 6.4, outerDiameter: 12, height: 1.6 }
```

| Property | String tokens | Default (mm) |
| --- | --- | --- |
| `innerDiameter` | `id`, `innerdiameter` | 6.4 |
| `outerDiameter` | `od`, `outerdiameter` | 12 |
| `height` | `h`, `height` | 1.6 |

Dimensions accept numbers in millimeters or strings with `mm`, `cm`, `m`, `in`,
`inch`, `mil`, `ft`, or `feet`. Units and string token names are case-insensitive.
Output dimensions are always millimeters. All dimensions must be finite and
positive, and the inner diameter must be strictly smaller than the outer diameter
after unit conversion. The defaults match the roadmap example; they are not a
manufacturing standard or tolerance specification.

`flatWasherModelPropsSchema` validates objects without `fn`;
`flatWasherModelDefinitionSchema` and `modelDefinitionSchema` validate definitions
with `fn: "flatwasher"`. Both object schemas reject unknown properties. The string
parser rejects unknown tokens, missing values, duplicate properties (including
aliases), inline function values, and malformed dimension suffixes.

The intended geometry contract is a concentric annular extrusion along +Z from
Z=0 to Z=`height`, centered on the X/Y origin, with the two supplied diameters.
No renderer, mesh tessellation, surface finish, or manufacturing tolerance is
specified by this schema.
