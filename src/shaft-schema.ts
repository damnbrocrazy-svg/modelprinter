import { z } from "zod"
import { positiveModelLengthSchema } from "./model-length-schema"

// Require a complete dimension; the shared unit converter accepts numeric prefixes.
const length = z
  .union([
    z.number(),
    z
      .string()
      .regex(
        /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:mm|cm|m|in|inch|mil|ft|feet)?$/i,
        "Expected a number with an optional supported length unit",
      )
      .transform((value) => value.toLowerCase()),
  ])
  .pipe(positiveModelLengthSchema)

const shape = {
  diameter: length.default(8),
  length: length.default(300),
}

/** Solid round shaft dimensions in millimeters; no thread or tolerance implied. */
export const shaftModelPropsSchema = z.object(shape).strict()
export const shaftModelDefinitionSchema = z
  .object({ fn: z.literal("shaft"), ...shape })
  .strict()

export type ShaftModelPropsInput = z.input<typeof shaftModelPropsSchema>
export type ShaftModelProps = z.output<typeof shaftModelPropsSchema>
export type ShaftModelDefinition = z.output<typeof shaftModelDefinitionSchema>
