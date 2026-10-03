import { z } from "zod"
import {
  gearPressureAngleSchema,
  nonnegativeGearLengthSchema as nonnegative,
  positiveGearLengthSchema as positive,
} from "./gear-parameter-schemas"

const shape = {
  toothCount: z.number().int().min(6).max(512).default(24),
  /** Metric module: pitch diameter divided by tooth count, in millimeters. */
  module: positive.default(1),
  faceWidth: positive.default(5),
  /** Degrees; the standard involute pressure angle. */
  pressureAngle: gearPressureAngleSchema.default(20),
  /** Tangential tooth thinning at the pitch circle, in millimeters. */
  backlash: nonnegative.default(0),
  /** Additional radial dedendum beyond one module, in millimeters. */
  clearance: nonnegative.default(0.25),
  boreDiameter: nonnegative.default(0),
  hubDiameter: nonnegative.default(0),
  /** Hub projection beyond the face at Z=faceWidth. */
  hubLength: nonnegative.default(0),
  /** Counterclockwise degrees about +Z; phase zero centers a tooth on +X. */
  phase: z.number().finite().default(0),
  segmentsPerTooth: z.number().int().min(4).max(64).default(12),
}

type ResolvedSpurGearProps = z.output<z.ZodObject<typeof shape>>

function dimensions(props: ResolvedSpurGearProps) {
  const pitchDiameter = props.module * props.toothCount
  return {
    pitchDiameter,
    baseDiameter:
      pitchDiameter * Math.cos((props.pressureAngle * Math.PI) / 180),
    outsideDiameter: pitchDiameter + 2 * props.module,
    rootDiameter: pitchDiameter - 2 * (props.module + props.clearance),
    circularPitch: Math.PI * props.module,
    toothThickness: (Math.PI * props.module) / 2 - props.backlash,
  }
}

const involute = (angle: number) => Math.tan(angle) - angle

function validate(props: ResolvedSpurGearProps, context: z.RefinementCtx) {
  const issue = (message: string, path?: keyof ResolvedSpurGearProps) =>
    context.addIssue({ code: "custom", message, path: path ? [path] : [] })
  const d = dimensions(props)
  if (
    Object.values(d).some((value) => !Number.isFinite(value)) ||
    !Number.isFinite(props.faceWidth + props.hubLength)
  ) {
    issue("Derived gear dimensions must be finite")
    return
  }
  if (d.rootDiameter <= 0) {
    issue("Dedendum must leave a positive root diameter", "clearance")
    return
  }
  if (props.boreDiameter >= d.rootDiameter)
    issue(
      "Bore diameter must be smaller than the root diameter",
      "boreDiameter",
    )
  if ((props.hubDiameter === 0) !== (props.hubLength === 0))
    issue("Hub diameter and length must both be zero or both be positive")
  if (props.hubDiameter > 0) {
    if (props.hubDiameter >= d.rootDiameter)
      issue(
        "Hub diameter must be smaller than the root diameter",
        "hubDiameter",
      )
    if (props.boreDiameter >= props.hubDiameter)
      issue("Hub diameter must exceed the bore diameter", "hubDiameter")
  }

  const pressureAngle = (props.pressureAngle * Math.PI) / 180
  const halfPitchAngle = d.toothThickness / d.pitchDiameter
  const halfTipAngle =
    halfPitchAngle +
    involute(pressureAngle) -
    involute(Math.acos(d.baseDiameter / d.outsideDiameter))
  if (!Number.isFinite(halfTipAngle) || halfTipAngle <= 0)
    issue("Tooth tip must have positive angular thickness", "backlash")
  const halfRootAngle =
    halfPitchAngle +
    involute(pressureAngle) -
    involute(
      Math.acos(d.baseDiameter / Math.max(d.rootDiameter, d.baseDiameter)),
    )
  if (
    !Number.isFinite(halfRootAngle) ||
    halfRootAngle >= Math.PI / props.toothCount
  )
    issue("Adjacent teeth must leave a positive root gap", "pressureAngle")
}

/** Renderer-independent involute spur-gear parameters, normalized to millimeters. */
export const spurGearModelPropsSchema = z
  .object(shape)
  .strict()
  .superRefine(validate)

export const spurGearModelDefinitionSchema = z
  .object({ fn: z.literal("spurgear"), ...shape })
  .strict()
  .superRefine(validate)

export type SpurGearModelPropsInput = z.input<typeof spurGearModelPropsSchema>
export type SpurGearModelProps = z.output<typeof spurGearModelPropsSchema>
export type SpurGearModelDefinition = z.output<
  typeof spurGearModelDefinitionSchema
>

/** Validates props and returns standard unshifted involute-gear dimensions. */
export const getSpurGearDimensions = (input: SpurGearModelPropsInput = {}) =>
  dimensions(spurGearModelPropsSchema.parse(input))
