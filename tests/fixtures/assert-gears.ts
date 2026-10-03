import { expect } from "bun:test"
import {
  getSpurGearDimensions,
  getWormGearDimensions,
  modelDefinitionSchema,
  modelprinter,
  mp,
  spurGearModelDefinitionSchema,
  spurGearModelPropsSchema,
  wormGearModelDefinitionSchema,
  wormGearModelPropsSchema,
} from "../../src"

export function assertSpurGears() {
  const defaults = {
    toothCount: 24,
    module: 1,
    faceWidth: 5,
    pressureAngle: 20,
    backlash: 0,
    clearance: 0.25,
    boreDiameter: 0,
    hubDiameter: 0,
    hubLength: 0,
    phase: 0,
    segmentsPerTooth: 12,
  }
  expect(spurGearModelPropsSchema.parse({})).toEqual(defaults)
  expect(mp.string("spurgear").json()).toEqual({ fn: "spurgear", ...defaults })
  expect(modelprinter.getModelNames()).toContain("spurgear")
  const builder = mp.string(
    "spurgear24_m1mm_w5mm_bore5mm_pa20deg_backlash0.1mm_clearance0.25mm_hubdiameter10mm_hublength3mm_phase15deg_segments12",
  )
  expect(builder.params()).toMatchObject({
    fn: "spurgear",
    num_pins: 24,
    m: "1mm",
  })
  const model = builder.json()
  if (model.fn !== "spurgear")
    throw new Error("Expected a spur gear definition")
  expect(model).toEqual({
    fn: "spurgear",
    ...defaults,
    boreDiameter: 5,
    backlash: 0.1,
    hubDiameter: 10,
    hubLength: 3,
    phase: 15,
  })
  expect(modelDefinitionSchema.parse(model)).toEqual(model)
  expect(spurGearModelDefinitionSchema.parse(model)).toEqual(model)
  expect(
    mp
      .string(
        "SPURGEAR_teeth32_module0.1CM_facewidth0.25in_borediameter0.2cm_pressureangle20_phase-30deg",
      )
      .json(),
  ).toMatchObject({
    toothCount: 32,
    module: 1,
    faceWidth: 6.35,
    boreDiameter: 2,
    phase: -30,
  })
  expect(mp.string("spurgear6_width2mm").json()).toMatchObject({
    toothCount: 6,
    faceWidth: 2,
  })
  const d = getSpurGearDimensions({
    module: "2mm",
    toothCount: 30,
    backlash: "0.1mm",
  })
  expect(d.pitchDiameter).toBe(60)
  expect(d.baseDiameter).toBeCloseTo(60 * Math.cos((20 * Math.PI) / 180))
  expect(d.outsideDiameter).toBe(64)
  expect(d.rootDiameter).toBe(55.5)
  expect(d.circularPitch).toBeCloseTo(2 * Math.PI)
  expect(d.toothThickness).toBeCloseTo(Math.PI - 0.1)

  for (const source of [
    "spurgear5",
    "spurgear513",
    "spurgear24.5",
    "spurgear24mm",
    "spurgear(24)",
    "spurgear24_teeth24",
    "spurgear_teeth24_teeth25",
    "spurgear_m1mm_module2mm",
    "spurgear_w5mm_width6mm",
    "spurgear_pa20deg_pressureangle25deg",
    "spurgear_bore1mm_borediameter2mm",
    "spurgear_unknown1",
    "spurgear_teeth24mm",
    "spurgear_teeth24.5",
    "spurgear_segments12mm",
    "spurgear_segments3",
    "spurgear_segments65",
    "spurgear_m1.2.3mm",
    "spurgear_m1mm2",
    "spurgear_m1e3mm",
    "spurgear_mNaN",
    "spurgear_mInfinity",
    "spurgear_m1rad",
    "spurgear_m",
    "spurgear_pa20rad",
    "spurgear_pa20deg2",
    "spurgear_pa",
    "spurgear_phase1.2.3deg",
    "spurgear_clearance20mm",
    "spurgear_bore21.5mm",
    "spurgear_backlash2mm",
    "spurgear_hubdiameter10mm",
    "spurgear_hublength3mm",
    "spurgear_hubdiameter22mm_hublength3mm",
    "spurgear_bore10mm_hubdiameter10mm_hublength3mm",
    "spurgear_pa80deg",
  ]) {
    expect(() => mp.string(source).json()).toThrow()
  }
  for (const props of [
    { toothCount: 24.5 },
    { module: 0 },
    { faceWidth: -1 },
    { pressureAngle: 0 },
    { pressureAngle: 90 },
    { pressureAngle: NaN },
    { phase: Infinity },
    { backlash: -1 },
    { clearance: -1 },
    { boreDiameter: -1 },
    { hubLength: -1 },
    { module: 1e308 },
    { module: "1.2.3" },
    { imaginary: true },
    { faceWidth: 1e308, hubLength: 1e308, hubDiameter: 10 },
  ]) {
    expect(() => spurGearModelPropsSchema.parse(props)).toThrow()
    expect(() =>
      spurGearModelDefinitionSchema.parse({ fn: "spurgear", ...props }),
    ).toThrow()
  }
  expect(() => getSpurGearDimensions({ boreDiameter: 100 })).toThrow()
}

export function assertWormGears() {
  const defaults = {
    module: 1,
    pitchDiameter: 10,
    length: 20,
    starts: 1,
    pressureAngle: 20,
    backlash: 0,
    clearance: 0.25,
    boreDiameter: 0,
    handedness: "right" as const,
    phase: 0,
    radialSegments: 96,
    segmentsPerTurn: 32,
  }
  expect(wormGearModelPropsSchema.parse({})).toEqual(defaults)
  expect(mp.string("wormgear").json()).toEqual({ fn: "wormgear", ...defaults })
  expect(modelprinter.getModelNames()).toContain("wormgear")
  const model = mp
    .string(
      "wormgear_m1mm_d10mm_l20mm_starts2_left_bore3mm_pa20deg_backlash0.1mm_clearance0.25mm_phase15deg_segments96_turnsegments32",
    )
    .json()
  if (model.fn !== "wormgear")
    throw new Error("Expected a worm gear definition")
  expect(model).toEqual({
    fn: "wormgear",
    ...defaults,
    starts: 2,
    handedness: "left",
    boreDiameter: 3,
    backlash: 0.1,
    phase: 15,
  })
  expect(modelDefinitionSchema.parse(model)).toEqual(model)
  expect(wormGearModelDefinitionSchema.parse(model)).toEqual(model)
  expect(
    mp
      .string(
        "WORMGEAR_module0.1CM_pitchdiameter1cm_length0.5in_borediameter2mm_pressureangle20_right",
      )
      .json(),
  ).toMatchObject({
    module: 1,
    pitchDiameter: 10,
    length: 12.7,
    handedness: "right",
  })
  const d = getWormGearDimensions({
    module: "2mm",
    pitchDiameter: 20,
    starts: 2,
    backlash: 0.1,
  })
  expect(d.pitchDiameter).toBe(20)
  expect(d.outsideDiameter).toBe(24)
  expect(d.rootDiameter).toBe(15.5)
  expect(d.axialPitch).toBeCloseTo(2 * Math.PI)
  expect(d.lead).toBeCloseTo(4 * Math.PI)
  expect(d.leadAngle).toBeCloseTo((Math.atan(0.2) * 180) / Math.PI)
  expect(d.toothThickness).toBeCloseTo(Math.PI - 0.1)
  expect(getWormGearDimensions({ starts: 8 }).lead).toBeCloseTo(8 * Math.PI)

  for (const source of [
    "wormgear2",
    "wormgear_starts0",
    "wormgear_starts9",
    "wormgear_starts2mm",
    "wormgear_starts2.5",
    "wormgear_m1mm_module2mm",
    "wormgear_d10mm_pitchdiameter12mm",
    "wormgear_l20mm_length25mm",
    "wormgear_left_right",
    "wormgear_left_left",
    "wormgear_left0",
    "wormgear_right1",
    "wormgear_unknown1",
    "wormgear_segments25",
    "wormgear_segments20",
    "wormgear_segments260",
    "wormgear_turnsegments11",
    "wormgear_turnsegments129",
    "wormgear_segments96mm",
    "wormgear_turnsegments32.5",
    "wormgear_m1.2.3mm",
    "wormgear_d10mm2",
    "wormgear_l",
    "wormgear_m1rad",
    "wormgear_mNaN",
    "wormgear_pa20rad",
    "wormgear_phase20deg2",
    "wormgear_pa",
    "wormgear_pa80deg",
    "wormgear_d2.5mm",
    "wormgear_bore7.5mm",
    "wormgear_backlash1mm",
    "wormgear_clearance2mm",
  ]) {
    expect(() => mp.string(source).json()).toThrow()
  }
  for (const props of [
    { starts: 1.5 },
    { module: 0 },
    { length: -1 },
    { pressureAngle: 0 },
    { pressureAngle: 90 },
    { pressureAngle: NaN },
    { phase: Infinity },
    { backlash: -1 },
    { clearance: -1 },
    { boreDiameter: -1 },
    { radialSegments: 25 },
    { module: 1e308, pitchDiameter: 1e308 },
    { module: "1.2.3" },
    { imaginary: true },
  ]) {
    expect(() => wormGearModelPropsSchema.parse(props)).toThrow()
    expect(() =>
      wormGearModelDefinitionSchema.parse({ fn: "wormgear", ...props }),
    ).toThrow()
  }
  expect(() => getWormGearDimensions({ boreDiameter: 100 })).toThrow()
}
