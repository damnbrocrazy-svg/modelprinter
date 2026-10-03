import {
  nemaMotorModelPropsSchema,
  type NemaMotorModelPropsInput,
} from "./nema-motor-schema"

export interface NemaMotorReferencePoint {
  position: { x: number; y: number; z: number }
  direction: { x: number; y: number; z: number }
}

/** Named points/directions in the motor-local right-handed mm frame: +X right,
 * +Y top, +Z along the shaft. Origin is the front mounting face. Points acquire
 * translation; unit directions do not. No geometry is generated here.
 */
export function getNemaMotorReferencePoints(input: NemaMotorModelPropsInput) {
  const p = nemaMotorModelPropsSchema.parse(input)
  const radians = (p.wireSideAngle * Math.PI) / 180
  const x = Math.cos(radians),
    y = Math.sin(radians)
  // Intersect the direction with the cap's chamfered square specification.
  const radius = Math.min(
    p.bodyWidth / 2 / Math.max(Math.abs(x), Math.abs(y)),
    (p.bodyWidth - p.faceCornerChamfer) / (Math.abs(x) + Math.abs(y)),
  )
  const flatRadians = (p.shaftFlatAngle * Math.PI) / 180
  return {
    frontface: {
      position: { x: 0, y: 0, z: 0 },
      direction: { x: 0, y: 0, z: 1 },
    },
    backface: {
      position: { x: 0, y: 0, z: -p.bodyLength },
      direction: { x: 0, y: 0, z: -1 },
    },
    shafttip: {
      position: { x: 0, y: 0, z: p.shaftLength },
      direction: { x: 0, y: 0, z: 1 },
    },
    wireside: {
      position: {
        x: radius * x,
        y: radius * y,
        z: -p.bodyLength + p.rearCapLength / 2,
      },
      direction: { x, y, z: 0 },
    },
    shaftflat:
      p.shaftShape === "d"
        ? {
            position: {
              x:
                (p.shaftDiameter / 2 - p.shaftFlatDepth) *
                Math.cos(flatRadians),
              y:
                (p.shaftDiameter / 2 - p.shaftFlatDepth) *
                Math.sin(flatRadians),
              z: p.shaftLength - p.shaftFlatLength / 2,
            },
            direction: {
              x: Math.cos(flatRadians),
              y: Math.sin(flatRadians),
              z: 0,
            },
          }
        : undefined,
  } satisfies Record<string, NemaMotorReferencePoint | undefined>
}
