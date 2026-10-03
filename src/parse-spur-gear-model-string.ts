import {
  parseGearAngle,
  parseGearInteger,
  parseGearToken,
} from "./gear-parameter-schemas"
import type { RawModelprinterParams } from "./parse-model-string"
import { spurGearModelDefinitionSchema } from "./spur-gear-schema"

const lengths = {
  m: "module",
  module: "module",
  w: "faceWidth",
  width: "faceWidth",
  facewidth: "faceWidth",
  bore: "boreDiameter",
  borediameter: "boreDiameter",
  backlash: "backlash",
  clearance: "clearance",
  hubdiameter: "hubDiameter",
  hublength: "hubLength",
} as const

export function parseSpurGearModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  const first = tokens[0]?.match(/^spurgear(\d+)?$/i)
  if (!first || raw.fn !== "spurgear")
    throw new Error("Expected spurgear with an optional inline tooth count")
  const props: Record<string, unknown> = { fn: "spurgear" }
  if (first[1]) props.toothCount = parseGearInteger(first[1], "toothCount")
  for (const token of tokens.slice(1)) {
    const [name, value] = parseGearToken(token)
    let property: string
    let parsed: unknown
    if (name in lengths) {
      property = lengths[name as keyof typeof lengths]
      parsed = value
    } else if (name === "teeth" || name === "segments") {
      property = name === "teeth" ? "toothCount" : "segmentsPerTooth"
      parsed = parseGearInteger(value, property)
    } else if (name === "pa" || name === "pressureangle" || name === "phase") {
      property = name === "phase" ? "phase" : "pressureAngle"
      parsed = parseGearAngle(value, property)
    } else throw new Error(`Unknown spur gear token "${token}"`)
    if (property in props)
      throw new Error(`Spur gear property "${property}" is set more than once`)
    props[property] = parsed
  }
  return spurGearModelDefinitionSchema.parse(props)
}
