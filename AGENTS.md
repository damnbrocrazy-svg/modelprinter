# Repository conventions

- Do not update README.md when adding new models.
- This repository owns model strings, parameter schemas, dimensions, defaults,
  and validation. Geometry generation and visual snapshots belong in
  tscircuit/jscad-electronics; do not add meshes or renderer dependencies here.
- Test parameter contracts without describe blocks. Keep reusable assertions in
  tests/fixtures.

Run `bun test`, `bun run typecheck`, `bun run format:check`, and `bun run build`
before submitting changes. Build output is generated: never commit dist/ or the
root index.js, index.d.ts and index.js.map files, or types/. The prepare/prepack scripts
stage the root entrypoints for the modelprinter package; dist/ is never published.
Lockfile generation is disabled in bunfig.toml; do not commit bun.lock or bun.lockb.
