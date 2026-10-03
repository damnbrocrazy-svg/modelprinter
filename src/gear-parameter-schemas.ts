import { z } from "zod"
import { modelLengthSchema } from "./model-length-schema"

// @tscircuit/mm accepts numeric prefixes; gears require complete numeric tokens.
const lengthInput = z.union([
  z.number(),
  z
    .string()
    .regex(
      /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:mm|cm|m|in|inch|mil|ft|feet)?$/i,
      "Length must be a complete number with an optional supported unit",
    )
    .transform((value) => value.toLowerCase()),
])

export const positiveGearLengthSchema = lengthInput
  .pipe(modelLengthSchema)
  .refine((value) => value > 0, "Length must be greater than zero")

export const nonnegativeGearLengthSchema = lengthInput
  .pipe(modelLengthSchema)
  .refine((value) => value >= 0, "Length cannot be negative")

export const gearPressureAngleSchema = z.number().finite().gt(0).lt(90)

export function parseGearInteger(value: string, name: string): number {
  if (!/^\d+$/.test(value))
    throw new Error(`${name} requires a unitless integer`)
  return Number(value)
}

export function parseGearAngle(value: string, name: string): number {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?$/i.test(value))
    throw new Error(`${name} requires a numeric angle in degrees`)
  return Number(value.replace(/deg$/i, ""))
}

export function parseGearToken(token: string): [string, string] {
  const match = token.match(/^([a-z]+)(.*)$/i)
  if (!match) throw new Error(`Invalid gear token "${token}"`)
  return [match[1]!.toLowerCase(), match[2]!]
}
