import { copyFile, cp, writeFile } from "node:fs/promises"

// Publish generated entrypoints at the package root, never the dist directory.
for (const filename of ["index.js", "index.js.map"]) {
  await copyFile(
    new URL(`../dist/${filename}`, import.meta.url),
    new URL(`../${filename}`, import.meta.url),
  )
}
// Use tsc declarations: bundlers may treat a Git dependency's own source as
// external when the prepare script runs inside the consumer's node_modules.
await cp(
  new URL("../dist/types", import.meta.url),
  new URL("../types", import.meta.url),
  { recursive: true },
)
await writeFile(
  new URL("../index.d.ts", import.meta.url),
  'export * from "./types/index"\n',
)
