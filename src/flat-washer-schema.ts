import { z } from "zod"
import { modelLengthSchema } from "./model-length-schema"

// Reject trailing text instead of accepting a numeric prefix as a dimension.
const length = z
  .union([
    z.number(),
    z
      .string()
      .regex(
        /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:mm|cm|m|in|inch|mil|ft|feet)?$/i,
        "Length must be a complete number with an optional supported unit",
      )
      .transform((value) => value.toLowerCase()),
  ])
  .pipe(modelLengthSchema)
  .refine((value) => value > 0, "Length must be greater than zero")

const shape = {
  innerDiameter: length.default(6.4),
  outerDiameter: length.default(12),
  height: length.default(1.6),
}

function validate(
  props: z.output<z.ZodObject<typeof shape>>,
  context: z.RefinementCtx,
) {
  if (props.innerDiameter >= props.outerDiameter)
    context.addIssue({
      code: "custom",
      path: ["innerDiameter"],
      message: "Inner diameter must be smaller than outer diameter",
    })
}

/** Flat annular washer dimensions in millimeters, without manufacturing tolerances. */
export const flatWasherModelPropsSchema = z
  .object(shape)
  .strict()
  .superRefine(validate)

export const flatWasherModelDefinitionSchema = z
  .object({ fn: z.literal("flatwasher"), ...shape })
  .strict()
  .superRefine(validate)

export type FlatWasherModelPropsInput = z.input<
  typeof flatWasherModelPropsSchema
>
export type FlatWasherModelProps = z.output<typeof flatWasherModelPropsSchema>
export type FlatWasherModelDefinition = z.output<
  typeof flatWasherModelDefinitionSchema
>
