import { z } from "zod"
import {
  positiveModelLengthSchema as positive,
  nonnegativeModelLengthSchema as nonnegative,
} from "./model-length-schema"

export const nemaSizeSchema = z.union([
  z.literal(8),
  z.literal(17),
  z.literal(23),
])
export type NemaSize = z.infer<typeof nemaSizeSchema>

/** Representative motors, not dimensions guaranteed by a frame name.
 * Mounting/pilot/shaft references: Nanotec SCA2018, ST4118 and ST5918 drawings:
 * https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_SCA2018.pdf
 * https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST4118.pdf
 * https://www.nanotec.com/fileadmin/files/Baureihenuebersichten/Schrittmotoren/Product_Overview_ST5918.pdf
 * Cap thicknesses, chamfers and D cuts are illustrative, configurable details.
 * NEMA 8 also has 15.4 mm pitch / 16 mm pilot variants; override both together.
 */
export const nemaMotorDimensions = {
  8: {
    bodyWidth: 20.3,
    bodyLength: 33,
    mountingHoleSpacing: 16,
    mountingHoleDiameter: 2,
    mountingHoleDepth: 2,
    mountingHoleThrough: false,
    pilotDiameter: 15,
    pilotLength: 1.5,
    shaftDiameter: 4,
    shaftLength: 15,
    shaftShape: "round",
    shaftFlatDepth: 0.5,
    shaftFlatLength: 10,
    shaftFlatAngle: 0,
    frontCapLength: 3.5,
    rearCapLength: 3.5,
    faceCornerChamfer: 0.5,
    bodyCornerChamfer: 3,
  },
  17: {
    bodyWidth: 42.3,
    bodyLength: 38,
    mountingHoleSpacing: 31,
    mountingHoleDiameter: 3,
    mountingHoleDepth: 4.5,
    mountingHoleThrough: false,
    pilotDiameter: 22,
    pilotLength: 2,
    shaftDiameter: 5,
    shaftLength: 24,
    shaftShape: "d",
    shaftFlatDepth: 0.5,
    shaftFlatLength: 15,
    shaftFlatAngle: 0,
    frontCapLength: 5,
    rearCapLength: 5,
    faceCornerChamfer: 3,
    bodyCornerChamfer: 6,
  },
  23: {
    bodyWidth: 56.4,
    bodyLength: 51,
    mountingHoleSpacing: 47.14,
    mountingHoleDiameter: 5,
    mountingHoleDepth: 5,
    mountingHoleThrough: true,
    pilotDiameter: 38.1,
    pilotLength: 1.6,
    shaftDiameter: 6.35,
    shaftLength: 20.6,
    shaftShape: "d",
    shaftFlatDepth: 0.5,
    shaftFlatLength: 15,
    shaftFlatAngle: 0,
    frontCapLength: 5,
    rearCapLength: 5,
    faceCornerChamfer: 2,
    bodyCornerChamfer: 15,
  },
} as const

const shape = {
  nemaSize: nemaSizeSchema,
  bodyWidth: positive.optional(),
  bodyLength: positive.optional(),
  mountingHoleSpacing: positive.optional(),
  mountingHoleDiameter: positive.optional(),
  mountingHoleDepth: positive.optional(),
  mountingHoleThrough: z.boolean().optional(),
  pilotDiameter: positive.optional(),
  pilotLength: positive.optional(),
  /** Distance from mounting face Z=0 to shaft tip, including pilot height. */
  shaftLength: positive.optional(),
  shaftDiameter: positive.optional(),
  shaftShape: z.enum(["round", "d"]).optional(),
  /** Radial material removed from the +X side before rotation. */
  shaftFlatDepth: nonnegative.optional(),
  /** Flat extends back from the tip; leaves a round shoulder above the pilot. */
  shaftFlatLength: nonnegative.optional(),
  /** Degrees around +Z, counterclockwise; zero puts the flat on +X. */
  shaftFlatAngle: z.number().finite().optional(),
  frontCapLength: positive.optional(),
  rearCapLength: positive.optional(),
  faceCornerChamfer: nonnegative.optional(),
  bodyCornerChamfer: nonnegative.optional(),
}
const resolve = (p: z.output<z.ZodObject<typeof shape>>) => {
  const d = nemaMotorDimensions[p.nemaSize]
  return {
    nemaSize: p.nemaSize,
    bodyWidth: p.bodyWidth ?? d.bodyWidth,
    bodyLength: p.bodyLength ?? d.bodyLength,
    mountingHoleSpacing: p.mountingHoleSpacing ?? d.mountingHoleSpacing,
    mountingHoleDiameter: p.mountingHoleDiameter ?? d.mountingHoleDiameter,
    mountingHoleDepth: p.mountingHoleDepth ?? d.mountingHoleDepth,
    mountingHoleThrough: p.mountingHoleThrough ?? d.mountingHoleThrough,
    pilotDiameter: p.pilotDiameter ?? d.pilotDiameter,
    pilotLength: p.pilotLength ?? d.pilotLength,
    shaftDiameter: p.shaftDiameter ?? d.shaftDiameter,
    shaftLength: p.shaftLength ?? d.shaftLength,
    shaftShape: p.shaftShape ?? d.shaftShape,
    shaftFlatDepth: p.shaftFlatDepth ?? d.shaftFlatDepth,
    shaftFlatLength: p.shaftFlatLength ?? d.shaftFlatLength,
    shaftFlatAngle: p.shaftFlatAngle ?? d.shaftFlatAngle,
    frontCapLength: p.frontCapLength ?? d.frontCapLength,
    rearCapLength: p.rearCapLength ?? d.rearCapLength,
    faceCornerChamfer: p.faceCornerChamfer ?? d.faceCornerChamfer,
    bodyCornerChamfer: p.bodyCornerChamfer ?? d.bodyCornerChamfer,
  }
}
export type NemaMotorModelProps = ReturnType<typeof resolve>
const validate = (p: NemaMotorModelProps, ctx: z.RefinementCtx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message })
  const r = p.mountingHoleDiameter / 2
  if (p.frontCapLength + p.rearCapLength >= p.bodyLength)
    issue("End caps must leave a positive body length")
  if (
    p.faceCornerChamfer >= p.bodyWidth / 2 ||
    p.bodyCornerChamfer >= p.bodyWidth / 2
  )
    issue("Chamfer must be smaller than half the body width")
  if (
    p.mountingHoleSpacing + 2 * r >= p.bodyWidth ||
    p.bodyWidth - p.faceCornerChamfer - p.mountingHoleSpacing <= r * Math.SQRT2
  )
    issue("Mounting holes must fit entirely inside the front face")
  if (p.pilotDiameter >= p.bodyWidth || p.pilotDiameter <= p.shaftDiameter)
    issue(
      "Pilot diameter must exceed the shaft diameter and fit inside the face",
    )
  if (p.mountingHoleSpacing / Math.SQRT2 <= p.pilotDiameter / 2 + r)
    issue("Mounting holes must clear the pilot")
  if (!p.mountingHoleThrough && p.mountingHoleDepth >= p.frontCapLength)
    issue("Blind mounting hole depth must be less than the front cap length")
  if (
    p.mountingHoleThrough &&
    p.bodyWidth - p.bodyCornerChamfer - p.mountingHoleSpacing >= -r * Math.SQRT2
  )
    issue("Body and rear cap must clear through mounting holes")
  if (p.shaftLength <= p.pilotLength)
    issue("Shaft tip must extend beyond the pilot")
  if (
    p.shaftShape === "d" &&
    (p.shaftFlatDepth <= 0 ||
      p.shaftFlatDepth >= p.shaftDiameter / 2 ||
      p.shaftFlatLength <= 0 ||
      p.shaftFlatLength > p.shaftLength - p.pilotLength)
  )
    issue(
      "D flat must have positive depth less than the shaft radius and fit above the pilot",
    )
}

export const nemaMotorModelPropsSchema = z
  .object(shape)
  .strict()
  .transform(resolve)
  .superRefine(validate)
export const nemaMotorModelDefinitionSchema = z
  .object({ fn: z.literal("nema"), ...shape })
  .strict()
  .transform(({ fn, ...props }) => ({ fn, ...resolve(props) }))
  .superRefine(validate)
export type NemaMotorModelPropsInput = z.input<typeof nemaMotorModelPropsSchema>
export type NemaMotorModelDefinition = z.output<
  typeof nemaMotorModelDefinitionSchema
>
