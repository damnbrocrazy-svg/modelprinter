import { assertNemaMotor } from "./fixtures/assert-nema-motor"
import { test } from "bun:test"
import { assertHexSocketBolts } from "./fixtures/assert-hex-socket-bolt"
import { assertModelprinter } from "./fixtures/assert-modelprinter"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"
import { renderBoltSnapshot } from "./fixtures/render-bolt-snapshot"

test("M3 x 6mm hex socket bolt - four views", async () => {
  assertModelprinter()
  for (const size of [8, 17, 23] as const) assertNemaMotor(size)
  assertHexSocketBolts()
  await expectPngSnapshot(await renderBoltSnapshot(), import.meta.path)
})
