import {
  parseGearAngle,
  parseGearInteger,
  parseGearToken,
} from "./gear-parameter-schemas"
import type { RawModelprinterParams } from "./parse-model-string"
import { helicalGearModelDefinitionSchema } from "./helical-gear-schema"

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

export function parseHelicalGearModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  const first = tokens[0]?.match(/^helicalgear(\d+)?$/i)
  if (!first || raw.fn !== "helicalgear")
    throw new Error("Expected helicalgear with an optional inline tooth count")
  const props: Record<string, unknown> = { fn: "helicalgear" }
  if (first[1]) props.toothCount = parseGearInteger(first[1], "toothCount")
  for (const token of tokens.slice(1)) {
    const [name, value] = parseGearToken(token)
    let property: string
    let parsed: unknown
    if (name in lengths) {
      property = lengths[name as keyof typeof lengths]
      parsed = value
    } else if (
      name === "teeth" ||
      name === "segments" ||
      name === "turnsegments"
    ) {
      property =
        name === "teeth"
          ? "toothCount"
          : name === "segments"
            ? "segmentsPerTooth"
            : "segmentsPerTurn"
      parsed = parseGearInteger(value, property)
    } else if (
      name === "pa" ||
      name === "pressureangle" ||
      name === "phase" ||
      name === "ha" ||
      name === "helixangle"
    ) {
      property =
        name === "phase"
          ? "phase"
          : name === "ha" || name === "helixangle"
            ? "helixAngle"
            : "pressureAngle"
      parsed = parseGearAngle(value, property)
    } else if (name === "right" || name === "left") {
      if (value)
        throw new Error(`Helical flag "${name}" does not accept a value`)
      property = "handedness"
      parsed = name
    } else throw new Error(`Unknown helical gear token "${token}"`)
    if (property in props)
      throw new Error(
        `Helical gear property "${property}" is set more than once`,
      )
    props[property] = parsed
  }
  return helicalGearModelDefinitionSchema.parse(props)
}
