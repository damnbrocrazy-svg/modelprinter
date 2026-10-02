import { test } from "bun:test"
import { assertNemaMotor } from "./fixtures/assert-nema-motor"

for (const size of [8, 17, 23] as const)
  test(`NEMA${size} parameter contract`, () => assertNemaMotor(size))
