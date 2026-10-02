import { test } from "bun:test"
import { assertModelprinter } from "./fixtures/assert-modelprinter"

test("modelprinter parameter contract", assertModelprinter)
