import { test } from "bun:test"
import { assertSpurGears, assertWormGears } from "./fixtures/assert-gears"

test("spur gear parameter contract", assertSpurGears)
test("worm screw parameter contract", assertWormGears)
