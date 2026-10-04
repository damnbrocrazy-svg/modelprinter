import { helicalGearModelDefinitionSchema } from "./helical-gear-schema"
import { flatWasherModelDefinitionSchema } from "./flat-washer-schema"
import { nemaMotorModelDefinitionSchema } from "./nema-motor-schema"
import { sheetMetalModelDefinitionSchema } from "./sheet-metal-schema"
import { z } from "zod"
import { hexSocketBoltModelDefinitionSchema } from "./hex-socket-bolt-schema"
import { spurGearModelDefinitionSchema } from "./spur-gear-schema"
import { wormGearModelDefinitionSchema } from "./worm-gear-schema"
import {
  modelLengthSchema,
  positiveModelLengthSchema,
  nonnegativeModelLengthSchema,
} from "./model-length-schema"
export {
  modelLengthSchema,
  positiveModelLengthSchema,
  nonnegativeModelLengthSchema,
} from "./model-length-schema"

export const flexScreenOrientationSchema = z.enum([
  "sitsFlat",
  "sitsFlatBelowBoard",
  "foldedToFaceAboveBoard",
  "foldedToFaceBelowBoard",
  "foldedToRightAngleAboveBoard",
  "foldedToRightAngleBelowBoard",
])

const positiveFiniteNumberSchema = z.number().finite().positive()

const aspectRatioStringSchema = z
  .string()
  .refine((value) => {
    const parts = value.split(":")
    if (parts.length !== 2) return false
    const width = Number(parts[0])
    const height = Number(parts[1])
    return (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    )
  }, 'Aspect ratio must look like "16:9"')
  .transform((value) => value as `${number}:${number}`)

export const flexScreenAspectRatioSchema = z.union([
  positiveFiniteNumberSchema,
  aspectRatioStringSchema,
  z.tuple([positiveFiniteNumberSchema, positiveFiniteNumberSchema]),
])

const modelPointSchema = z
  .object({
    x: modelLengthSchema.optional(),
    y: modelLengthSchema.optional(),
    z: modelLengthSchema.optional(),
  })
  .strict()

const rotationValueSchema = z.union([z.number().finite(), z.string().min(1)])

const modelRotationSchema = z.tuple([
  rotationValueSchema,
  rotationValueSchema,
  rotationValueSchema,
])

const orientationShortcutKeys = [
  "sitsFlat",
  "sitsFlatBelowBoard",
  "foldedToFaceAboveBoard",
  "foldedToFaceBelowBoard",
  "foldsAboveBoard",
  "foldsBelowBoard",
  "foldedToRightAngleAboveBoard",
  "foldedToRightAngleBelowBoard",
] as const

const flexScreenModelPropsShape = {
  width: positiveModelLengthSchema.optional(),
  height: positiveModelLengthSchema.optional(),
  diagonal: positiveModelLengthSchema.optional(),
  aspectRatio: flexScreenAspectRatioSchema.optional(),
  ratio: flexScreenAspectRatioSchema.optional(),
  defaultDiagonal: positiveModelLengthSchema.optional(),

  orientation: flexScreenOrientationSchema.optional(),
  sitsFlat: z.boolean().optional(),
  sitsFlatBelowBoard: z.boolean().optional(),
  foldedToFaceAboveBoard: z.boolean().optional(),
  foldedToFaceBelowBoard: z.boolean().optional(),
  foldsAboveBoard: z.boolean().optional(),
  foldsBelowBoard: z.boolean().optional(),
  foldedToRightAngleAboveBoard: z.boolean().optional(),
  foldedToRightAngleBelowBoard: z.boolean().optional(),

  screenThickness: positiveModelLengthSchema.optional(),
  bezelInset: nonnegativeModelLengthSchema.optional(),
  bezelDepth: positiveModelLengthSchema.optional(),
  activeAreaWidth: positiveModelLengthSchema.optional(),
  activeAreaHeight: positiveModelLengthSchema.optional(),
  screenColor: z.string().min(1).optional(),
  bezelColor: z.string().min(1).optional(),
  showScreen: z.boolean().optional(),

  flexCableLength: positiveModelLengthSchema.optional(),
  flexCableWidth: positiveModelLengthSchema.optional(),
  flexCableThickness: positiveModelLengthSchema.optional(),
  flexCableColor: z.string().min(1).optional(),
  conductorCount: z.number().int().positive().optional(),
  conductorPitch: positiveModelLengthSchema.optional(),
  conductorWidth: positiveModelLengthSchema.optional(),
  conductorThickness: positiveModelLengthSchema.optional(),
  conductorColor: z.string().min(1).optional(),
  cableEdgeMargin: nonnegativeModelLengthSchema.optional(),
  exposedContactLength: nonnegativeModelLengthSchema.optional(),
  showConductors: z.boolean().optional(),
  showFlexCable: z.boolean().optional(),

  showStiffeners: z.boolean().optional(),
  stiffenerLength: nonnegativeModelLengthSchema.optional(),
  stiffenerThickness: positiveModelLengthSchema.optional(),
  stiffenerColor: z.string().min(1).optional(),

  bendRadius: positiveModelLengthSchema.optional(),
  bendSegments: z.number().int().min(2).optional(),
  rightAngleVerticalLead: nonnegativeModelLengthSchema.optional(),
  distanceAboveBoard: nonnegativeModelLengthSchema.optional(),
  distanceBelowBoard: nonnegativeModelLengthSchema.optional(),
  foldDistanceFromConnector: nonnegativeModelLengthSchema.optional(),
  foldOutset: positiveModelLengthSchema.optional(),
  foldSegments: z.number().int().min(4).optional(),
  screenGap: nonnegativeModelLengthSchema.optional(),

  boardTopZ: modelLengthSchema.optional(),
  boardThickness: positiveModelLengthSchema.optional(),
  boardClearance: nonnegativeModelLengthSchema.optional(),
  cableStartX: modelLengthSchema.optional(),
  cableStartY: modelLengthSchema.optional(),
  cableStartZ: modelLengthSchema.optional(),
  cableLateralOffset: modelLengthSchema.optional(),

  screenOffset: modelPointSchema.optional(),
  screenRotation: modelRotationSchema.optional(),
  rotation: modelRotationSchema.optional(),
  offset: modelPointSchema.optional(),
}

const addOrientationShortcutIssue = (
  props: Record<string, unknown>,
  addIssue: (path: string) => void,
) => {
  const selectedShortcuts = orientationShortcutKeys.filter(
    (key) => props[key] === true,
  )
  if (selectedShortcuts.length > 1) addIssue(selectedShortcuts[1]!)
}

/**
 * Canonical, renderer-independent properties for a parameterized FlexScreen.
 * Every length accepts either millimeters as a number or a unit-bearing string
 * and is normalized to millimeters by the schema.
 */
export const flexScreenModelPropsSchema = z
  .object(flexScreenModelPropsShape)
  .strict()
  .superRefine((props, context) => {
    addOrientationShortcutIssue(props, (path) => {
      context.addIssue({
        code: "custom",
        message: "Only one FlexScreen orientation shortcut can be true",
        path: [path],
      })
    })
  })

export type FlexScreenOrientation = z.infer<typeof flexScreenOrientationSchema>
export type FlexScreenAspectRatio = z.infer<typeof flexScreenAspectRatioSchema>
export type FlexScreenModelPropsInput = z.input<
  typeof flexScreenModelPropsSchema
>
export type FlexScreenModelProps = z.output<typeof flexScreenModelPropsSchema>

export const flexScreenModelDefinitionSchema = z
  .object({
    fn: z.literal("flexscreen"),
    ...flexScreenModelPropsShape,
  })
  .strict()
  .superRefine((model, context) => {
    addOrientationShortcutIssue(model, (path) => {
      context.addIssue({
        code: "custom",
        message: "Only one FlexScreen orientation shortcut can be true",
        path: [path],
      })
    })
  })

export type FlexScreenModelDefinition = z.infer<
  typeof flexScreenModelDefinitionSchema
>

export const modelDefinitionSchema = z.union([
  flatWasherModelDefinitionSchema,
  nemaMotorModelDefinitionSchema,
  sheetMetalModelDefinitionSchema,
  flexScreenModelDefinitionSchema,
  hexSocketBoltModelDefinitionSchema,
  helicalGearModelDefinitionSchema,
  spurGearModelDefinitionSchema,
  wormGearModelDefinitionSchema,
])
export type ModelDefinition = z.infer<typeof modelDefinitionSchema>
