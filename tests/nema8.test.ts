import { test } from "bun:test"
import { assertNemaMotor } from "./fixtures/assert-nema-motor"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"
import { renderNemaMotorSnapshot } from "./fixtures/render-nema-motor-snapshot"
test("NEMA 8 geometry and four views", async () => {
  assertNemaMotor(8)
  await expectPngSnapshot(await renderNemaMotorSnapshot(8), import.meta.path)
})
