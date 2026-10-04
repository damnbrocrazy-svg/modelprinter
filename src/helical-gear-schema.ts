import { z } from "zod"
import {
  getSpurGearDimensions,
  spurGearModelPropsSchema,
} from "./spur-gear-schema"

const shape = {
  ...spurGearModelPropsSchema.innerType().shape,
  /** Unsigned pitch-cylinder helix angle to +Z, in degrees. */
  helixAngle: z.number().finite().min(0).lt(90).default(20),
  /** Right-hand teeth advance counterclockwise as Z increases. */
  handedness: z.enum(["right", "left"]).default("right"),
  segmentsPerTurn: z.number().int().min(12).max(128).default(32),
}

type ResolvedHelicalGearProps = z.output<z.ZodObject<typeof shape>>

function dimensions(props: ResolvedHelicalGearProps) {
  const { helixAngle, handedness, segmentsPerTurn, ...spur } = props
  const d = getSpurGearDimensions(spur)
  const beta = (helixAngle * Math.PI) / 180
  return {
    ...d,
    normalModule: props.module * Math.cos(beta),
    normalPressureAngle:
      (Math.atan(
        Math.tan((props.pressureAngle * Math.PI) / 180) * Math.cos(beta),
      ) *
        180) /
      Math.PI,
    normalPitch: d.circularPitch * Math.cos(beta),
    /** Signed angular advance between the lower and upper faces, in degrees. */
    twistAngle:
      helixAngle === 0
        ? 0
        : ((handedness === "right" ? 1 : -1) *
            (((2 * props.faceWidth) / d.pitchDiameter) *
              Math.tan(beta) *
              180)) /
          Math.PI,
  }
}

function validate(
  props: ResolvedHelicalGearProps & { fn?: string },
  context: z.RefinementCtx,
) {
  const { fn, helixAngle, handedness, segmentsPerTurn, ...spur } = props
  const result = spurGearModelPropsSchema.safeParse(spur)
  if (!result.success) {
    for (const issue of result.error.issues) context.addIssue(issue)
    return
  }
  if (
    Object.values(
      dimensions({ ...result.data, helixAngle, handedness, segmentsPerTurn }),
    ).some((value) => !Number.isFinite(value))
  )
    context.addIssue({
      code: "custom",
      message: "Derived helical gear dimensions must be finite",
    })
}

/** Transverse module, pressure angle and backlash match the spur-gear contract. */
export const helicalGearModelPropsSchema = z
  .object(shape)
  .strict()
  .superRefine(validate)

export const helicalGearModelDefinitionSchema = z
  .object({ fn: z.literal("helicalgear"), ...shape })
  .strict()
  .superRefine(validate)

export type HelicalGearModelPropsInput = z.input<
  typeof helicalGearModelPropsSchema
>
export type HelicalGearModelProps = z.output<typeof helicalGearModelPropsSchema>
export type HelicalGearModelDefinition = z.output<
  typeof helicalGearModelDefinitionSchema
>

export const getHelicalGearDimensions = (
  input: HelicalGearModelPropsInput = {},
) => dimensions(helicalGearModelPropsSchema.parse(input))
