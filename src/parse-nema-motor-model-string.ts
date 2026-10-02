import { nemaMotorModelDefinitionSchema } from "./nema-motor-schema"
import type { RawModelprinterParams } from "./parse-model-string"

const lengths = {
  l: "bodyLength",
  length: "bodyLength",
  bodylength: "bodyLength",
  bodywidth: "bodyWidth",
  shaftlength: "shaftLength",
  shaftdiameter: "shaftDiameter",
  flatdepth: "shaftFlatDepth",
  flatlength: "shaftFlatLength",
  holespacing: "mountingHoleSpacing",
  holediameter: "mountingHoleDiameter",
  holedepth: "mountingHoleDepth",
  pilotdiameter: "pilotDiameter",
  pilotlength: "pilotLength",
  frontcap: "frontCapLength",
  rearcap: "rearCapLength",
  facechamfer: "faceCornerChamfer",
  bodychamfer: "bodyCornerChamfer",
} as const

export function parseNemaMotorModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  const match = tokens[0]?.match(/^nema(8|17|23)$/i)
  if (!match) throw new Error("Expected nema8, nema17 or nema23")
  const props: Record<string, unknown> = {
    fn: "nema",
    nemaSize: Number(match[1]),
  }
  for (const token of tokens.slice(1)) {
    const match = token.match(/^([a-z]+)(.*)$/i)
    if (!match) throw new Error(`Invalid NEMA token "${token}"`)
    const name = match[1]!.toLowerCase(),
      value = match[2]!
    let property: string, parsed: unknown
    if (name in lengths) {
      property = lengths[name as keyof typeof lengths]
      parsed = value
    } else if (name === "flatangle") {
      property = "shaftFlatAngle"
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:deg)?$/i.test(value))
        throw new Error("flatangle requires a numeric angle in degrees")
      parsed = Number(value.replace(/deg$/i, ""))
    } else if (
      ["round", "dshaft", "throughholes", "blindholes"].includes(name)
    ) {
      if (value) throw new Error(`NEMA flag "${name}" does not accept a value`)
      property =
        name === "round" || name === "dshaft"
          ? "shaftShape"
          : "mountingHoleThrough"
      parsed =
        name === "round"
          ? "round"
          : name === "dshaft"
            ? "d"
            : name === "throughholes"
    } else throw new Error(`Unknown NEMA motor token "${token}"`)
    if (property in props)
      throw new Error(`NEMA property "${property}" is set more than once`)
    props[property] = parsed
  }
  return nemaMotorModelDefinitionSchema.parse(props)
}
