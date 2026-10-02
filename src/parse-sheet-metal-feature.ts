import { positiveModelLengthSchema } from "./model-length-schema"
import {
  sheetMetalHoleSchema,
  type SheetMetalHole,
  type SheetMetalModelProps,
} from "./sheet-metal-schema"

/** Compile face-relative feature language to panel-local coordinates. */
export function parseSheetMetalFeature(
  feature: string,
  profile: SheetMetalModelProps["profile"],
): SheetMetalHole {
  const match = feature.match(/^(hole|slot)[1-9]\d*\(([^()]+)\)$/)
  if (!match) throw new Error(`Invalid sheet metal feature "${feature}"`)
  const kind = match[1]!
  const values: Record<string, string> = {}
  for (const token of match[2]!.split("_")) {
    const parameter = token.match(
      /^(leftofcenter|rightofcenter|abovecenter|belowcenter|r|d|l|w)([0-9.].*)$/,
    )
    const key = parameter?.[1] ?? token
    if (key in values) throw new Error(`Duplicate ${key} in ${feature}`)
    values[key] = parameter?.[2] ?? ""
  }
  const allowed = new Set([
    "bottomface",
    "angledface",
    "leftface",
    "rightface",
    "leftofcenter",
    "rightofcenter",
    "abovecenter",
    "belowcenter",
    ...(kind === "hole" ? ["r", "d"] : ["l", "w", "horizontal", "vertical"]),
  ])
  for (const key of Object.keys(values)) {
    if (!allowed.has(key)) throw new Error(`Unknown ${key} in ${feature}`)
  }
  const faces = ["bottomface", "angledface", "leftface", "rightface"].filter(
    (face) => face in values,
  )
  if (faces.length !== 1)
    throw new Error(`Specify exactly one face in ${feature}`)
  const face = faces[0]!
  if (
    (face === "angledface" && profile !== "angle") ||
    (["leftface", "rightface"].includes(face) && profile !== "channel")
  )
    throw new Error(`No ${face} on ${profile}`)
  for (const [a, b] of [
    ["leftofcenter", "rightofcenter"],
    ["abovecenter", "belowcenter"],
    ["horizontal", "vertical"],
    ["r", "d"],
  ]) {
    if (a! in values && b! in values)
      throw new Error(`Conflicting ${a} and ${b} in ${feature}`)
  }
  const distance = (key: string) =>
    key in values ? positiveModelLengthSchema.parse(values[key]) : 0
  const horizontal = distance("rightofcenter") - distance("leftofcenter")
  const vertical = distance("abovecenter") - distance("belowcenter")
  const panel =
    face === "bottomface" ? "base" : face === "leftface" ? "left" : "right"
  const position = {
    panel,
    u: panel === "base" ? horizontal : vertical,
    v: panel === "base" ? vertical : horizontal * (panel === "left" ? -1 : 1),
  }
  if (kind === "hole") {
    if (!("r" in values) && !("d" in values))
      throw new Error(`Hole requires r or d in ${feature}`)
    return sheetMetalHoleSchema.parse({
      ...position,
      shape: "round",
      diameter: "r" in values ? 2 * distance("r") : distance("d"),
    })
  }
  if (!("l" in values) || !("w" in values))
    throw new Error(`Slot requires l and w in ${feature}`)
  const length = distance("l"),
    width = distance("w")
  if (length < width) throw new Error("Slot length must be at least its width")
  return sheetMetalHoleSchema.parse({
    ...position,
    shape: "slot",
    length,
    width,
    axis: (panel === "base") === !("vertical" in values) ? "u" : "v",
  })
}
