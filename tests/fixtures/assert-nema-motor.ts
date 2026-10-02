import { expect } from "bun:test"
import {
  modelDefinitionSchema,
  mp,
  nemaMotorModelPropsSchema,
  type NemaSize,
} from "../../src"

export function assertNemaMotor(size: NemaSize) {
  const expected = {
    8: { pitch: 16, diameter: 2, length: 33, shaft: 15 },
    17: { pitch: 31, diameter: 3, length: 38, shaft: 24 },
    23: { pitch: 47.14, diameter: 5, length: 51, shaft: 20.6 },
  }[size]
  const definition = mp.string(`NEMA${size}`).json()
  if (definition.fn !== "nema") throw new Error("Expected NEMA")
  expect(modelDefinitionSchema.parse(definition)).toEqual(definition)
  expect(mp.getModelNames()).toContain("nema")
  expect(definition.mountingHoleSpacing).toBe(expected.pitch)
  expect(definition.mountingHoleDiameter).toBe(expected.diameter)
  const { fn, ...props } = definition
  expect(props.backFace).toBe("screws")
  expect(props.backFaceHoleSpacing).toBe(expected.pitch)
  expect(props.backFaceScrewSize).toBe(
    ({ 8: "M2", 17: "M3", 23: "M4" } as const)[size],
  )
  for (const [token, mode] of [
    ["backfaceholes", "holes"],
    ["backfacescrews", "screws"],
    ["plainbackface", "plain"],
  ])
    expect(mp.string(`nema${size}_${token}`).json()).toMatchObject({
      backFace: mode,
    })
  expect(
    mp
      .string(
        `nema${size}_backfaceholes_backholespacing12mm_backholediameter2mm_backholedepth1mm_backscrewm2.5`,
      )
      .json(),
  ).toMatchObject({
    backFace: "holes",
    backFaceHoleSpacing: 12,
    backFaceHoleDiameter: 2,
    backFaceHoleDepth: 1,
    backFaceScrewSize: "M2.5",
  })
  expect(
    modelDefinitionSchema.parse(mp.string(`nema${size}_backfaceholes`).json()),
  ).toMatchObject({ backFace: "holes" })
  expect(props.bodyLength).toBe(expected.length)
  expect(props.shaftLength).toBe(expected.shaft)
  expect(props.shaftFlatLength).toBe(size === 8 ? 10 : 15)
  expect(
    mp
      .string(`nema${size}_dshaft_flatdepth0.5mm_flatlength8mm_flatangle90deg`)
      .json(),
  ).toMatchObject({
    shaftShape: "d",
    shaftFlatDepth: 0.5,
    shaftFlatLength: 8,
    shaftFlatAngle: 90,
  })
  expect(mp.string(`nema${size}_l6cm_round`).json()).toMatchObject({
    bodyLength: 60,
    shaftShape: "round",
  })
  expect(
    mp.string("nema8_holespacing15.4mm_pilotdiameter16mm").json(),
  ).toMatchObject({ mountingHoleSpacing: 15.4, pilotDiameter: 16 })
  for (const bad of [
    "nema9",
    "nema170",
    "nema17.5",
    "nema17_l0",
    "nema17_l20_l30",
    "nema17_l20_length30",
    "nema17_typo5",
    "nema17_backfaceholes_backfacescrews",
    "nema17_backfacescrews_backfaceholes",
    "nema17_backfaceholes0",
    "nema17_backholedepth5mm",
    "nema17_backholespacing42mm",
    "nema17_backholespacing1mm",
    "nema17_backfaceholes_backholespacing2mm",
    "nema17_backholediameter1mm",
    "nema17_backscrewm1",
    "nema17_backfacescrews_backscrewm8",
    "nema17_round_dshaft",
    "nema17_dshaft0",
    "nema17_flatangle",
    "nema17_flatdepth3",
    "nema17_flatlength24",
    "nema17_holespacing42",
    "nema17_holedepth6",
  ])
    expect(() => mp.string(bad).json()).toThrow()
  for (const bad of [
    { shaftLength: Infinity },
    { bodyLength: 8 },
    { bodyWidth: 20 },
    { pilotDiameter: 4 },
    { shaftShape: "d", shaftFlatDepth: 0 },
    { mountingHoleSpacing: 1 },
    { mystery: true },
    { backFace: "threads" },
    { backFaceScrewSize: "M1" },
    { backFaceHoleDepth: 0 },
    { backFaceHoleDiameter: -1 },
  ])
    expect(() =>
      nemaMotorModelPropsSchema.parse({ nemaSize: 17, ...bad }),
    ).toThrow()
}
