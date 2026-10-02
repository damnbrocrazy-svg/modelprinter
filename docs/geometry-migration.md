# Geometry ownership

modelprinter is the specification package: model strings, parsers, schemas,
normalized dimensions, defaults, and validation. It does not create vertices,
indices, JSCAD solids, or visual snapshots.

Geometry for NEMA motors, hex socket bolts, and sheet metal lives in
[jscad-electronics](https://github.com/tscircuit/jscad-electronics).
The existing `createHexSocketBoltMesh` and `createSheetMetalMesh` exports move
there, along with their mesh types, topology checks, and four-view PNG snapshots.
Consumers must change those imports from `@tscircuit/modelprinter` to
`jscad-electronics`. This is a breaking API change for mesh consumers.

Continue importing `mp`, model schemas, types, and dimension tables from
`@tscircuit/modelprinter`. Pass the parsed props to the geometry component or
mesh factory in jscad-electronics. Renderer code must consume these definitions
rather than maintaining a second copy of model defaults or the string grammar.

Coordinate conventions and visual approximations are unchanged by the move.
