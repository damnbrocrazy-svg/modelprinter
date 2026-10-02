import { test } from "bun:test"
import { assertNemaMotor } from "./fixtures/assert-nema-motor"
import { expectPngSnapshot } from "./fixtures/expect-png-snapshot"
import { renderNemaMotorSnapshot } from "./fixtures/render-nema-motor-snapshot"
test("NEMA 17 geometry and four views", async () => {
  assertNemaMotor(17)
  await expectPngSnapshot(await renderNemaMotorSnapshot(17), import.meta.path)
})
