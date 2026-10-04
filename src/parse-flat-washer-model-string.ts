import { flatWasherModelDefinitionSchema } from "./flat-washer-schema"
import type { RawModelprinterParams } from "./parse-model-string"

const lengths = {
  id: "innerDiameter",
  innerdiameter: "innerDiameter",
  od: "outerDiameter",
  outerdiameter: "outerDiameter",
  h: "height",
  height: "height",
} as const

export function parseFlatWasherModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  if (raw.fn !== "flatwasher" || tokens[0]?.toLowerCase() !== "flatwasher")
    throw new Error("The flatwasher function does not accept an inline value")

  const props: Record<string, unknown> = { fn: "flatwasher" }
  // Read original tokens so repeated tokens cannot be silently overwritten.
  for (const token of tokens.slice(1)) {
    const match = token.match(/^([a-z]+)(.*)$/i)
    const name = match?.[1]?.toLowerCase()
    if (!name || !Object.hasOwn(lengths, name))
      throw new Error(`Unknown flat washer token "${token}"`)
    const property = lengths[name as keyof typeof lengths]
    if (property in props)
      throw new Error(
        `Flat washer property "${property}" is set more than once`,
      )
    props[property] = match![2]
  }
  return flatWasherModelDefinitionSchema.parse(props)
}
