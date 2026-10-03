import {
  parseGearAngle,
  parseGearInteger,
  parseGearToken,
} from "./gear-parameter-schemas"
import type { RawModelprinterParams } from "./parse-model-string"
import { wormGearModelDefinitionSchema } from "./worm-gear-schema"

const lengths = {
  m: "module",
  module: "module",
  d: "pitchDiameter",
  pitchdiameter: "pitchDiameter",
  l: "length",
  length: "length",
  bore: "boreDiameter",
  borediameter: "boreDiameter",
  backlash: "backlash",
  clearance: "clearance",
} as const

export function parseWormGearModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  if (tokens[0]?.toLowerCase() !== "wormgear" || raw.fn !== "wormgear")
    throw new Error("The wormgear function does not accept an inline value")
  const props: Record<string, unknown> = { fn: "wormgear" }
  for (const token of tokens.slice(1)) {
    const [name, value] = parseGearToken(token)
    let property: string
    let parsed: unknown
    if (name in lengths) {
      property = lengths[name as keyof typeof lengths]
      parsed = value
    } else if (["starts", "segments", "turnsegments"].includes(name)) {
      property =
        name === "starts"
          ? "starts"
          : name === "segments"
            ? "radialSegments"
            : "segmentsPerTurn"
      parsed = parseGearInteger(value, property)
    } else if (name === "pa" || name === "pressureangle" || name === "phase") {
      property = name === "phase" ? "phase" : "pressureAngle"
      parsed = parseGearAngle(value, property)
    } else if (name === "right" || name === "left") {
      if (value) throw new Error(`Worm flag "${name}" does not accept a value`)
      property = "handedness"
      parsed = name
    } else throw new Error(`Unknown worm gear token "${token}"`)
    if (property in props)
      throw new Error(`Worm gear property "${property}" is set more than once`)
    props[property] = parsed
  }
  return wormGearModelDefinitionSchema.parse(props)
}
