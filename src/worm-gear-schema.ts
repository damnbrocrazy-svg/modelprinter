import { z } from "zod"
import {
  gearPressureAngleSchema,
  nonnegativeGearLengthSchema as nonnegative,
  positiveGearLengthSchema as positive,
} from "./gear-parameter-schemas"

const shape = {
  /** Axial metric module; axial pitch is PI times this value. */
  module: positive.default(1),
  pitchDiameter: positive.default(10),
  length: positive.default(20),
  starts: z.number().int().min(1).max(8).default(1),
  /** Axial rack pressure angle in degrees. */
  pressureAngle: gearPressureAngleSchema.default(20),
  /** Axial tooth thinning at the pitch cylinder, in millimeters. */
  backlash: nonnegative.default(0),
  /** Additional radial dedendum beyond one module, in millimeters. */
  clearance: nonnegative.default(0.25),
  boreDiameter: nonnegative.default(0),
  handedness: z.enum(["right", "left"]).default("right"),
  /** Counterclockwise degrees about +Z, beginning at the Z=0 end. */
  phase: z.number().finite().default(0),
  radialSegments: z
    .number()
    .int()
    .min(24)
    .max(256)
    .refine(
      (value) => value % 4 === 0,
      "Radial segments must be divisible by four",
    )
    .default(96),
  segmentsPerTurn: z.number().int().min(12).max(128).default(32),
}

type ResolvedWormGearProps = z.output<z.ZodObject<typeof shape>>

function dimensions(props: ResolvedWormGearProps) {
  const axialPitch = Math.PI * props.module
  const lead = props.starts * axialPitch
  return {
    pitchDiameter: props.pitchDiameter,
    outsideDiameter: props.pitchDiameter + 2 * props.module,
    rootDiameter: props.pitchDiameter - 2 * (props.module + props.clearance),
    axialPitch,
    lead,
    leadAngle:
      (Math.atan(lead / (Math.PI * props.pitchDiameter)) * 180) / Math.PI,
    toothThickness: axialPitch / 2 - props.backlash,
  }
}

function validate(props: ResolvedWormGearProps, context: z.RefinementCtx) {
  const issue = (message: string, path?: keyof ResolvedWormGearProps) =>
    context.addIssue({ code: "custom", message, path: path ? [path] : [] })
  const d = dimensions(props)
  if (Object.values(d).some((value) => !Number.isFinite(value))) {
    issue("Derived worm dimensions must be finite")
    return
  }
  if (d.rootDiameter <= 0) {
    issue("Dedendum must leave a positive root diameter", "pitchDiameter")
    return
  }
  if (props.boreDiameter >= d.rootDiameter)
    issue(
      "Bore diameter must be smaller than the root diameter",
      "boreDiameter",
    )
  const slope = Math.tan((props.pressureAngle * Math.PI) / 180)
  const tipThickness = d.toothThickness - 2 * props.module * slope
  const rootThickness =
    d.toothThickness + 2 * (props.module + props.clearance) * slope
  if (!Number.isFinite(tipThickness) || tipThickness <= 0)
    issue("Axial tooth tip must have positive thickness", "backlash")
  if (!Number.isFinite(rootThickness) || rootThickness >= d.axialPitch)
    issue("Adjacent threads must leave a positive root gap", "pressureAngle")
}

/** A helical worm screw with a simplified trapezoidal axial tooth profile. */
export const wormGearModelPropsSchema = z
  .object(shape)
  .strict()
  .superRefine(validate)

export const wormGearModelDefinitionSchema = z
  .object({ fn: z.literal("wormgear"), ...shape })
  .strict()
  .superRefine(validate)

export type WormGearModelPropsInput = z.input<typeof wormGearModelPropsSchema>
export type WormGearModelProps = z.output<typeof wormGearModelPropsSchema>
export type WormGearModelDefinition = z.output<
  typeof wormGearModelDefinitionSchema
>

/** Validates props and returns axial-module worm-screw dimensions. */
export const getWormGearDimensions = (input: WormGearModelPropsInput = {}) =>
  dimensions(wormGearModelPropsSchema.parse(input))
