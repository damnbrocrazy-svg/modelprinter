import type { RawModelprinterParams } from "./parse-model-string"
import { shaftModelDefinitionSchema } from "./shaft-schema"

const properties = {
  d: "diameter",
  diameter: "diameter",
  l: "length",
  length: "length",
} as const

export function parseShaftModelParams(raw: RawModelprinterParams) {
  const tokens = raw.string.split("_")
  if (raw.fn !== "shaft" || tokens[0]?.toLowerCase() !== "shaft")
    throw new Error("The shaft function does not accept an inline value")

  const props: Record<string, unknown> = { fn: "shaft" }
  // Parse source tokens to preserve duplicates that the raw dictionary overwrites.
  for (const token of tokens.slice(1)) {
    const match = token.match(/^([a-z]+)(.*)$/i)
    const name = match?.[1]?.toLowerCase()
    if (!name || !Object.hasOwn(properties, name))
      throw new Error(`Unknown shaft token "${token}"`)
    const property = properties[name as keyof typeof properties]
    if (property in props)
      throw new Error(`Shaft property "${property}" is set more than once`)
    props[property] = match![2]
  }
  return shaftModelDefinitionSchema.parse(props)
}
