import { expect, test } from "bun:test"
import {
  getHelicalGearDimensions,
  getSpurGearDimensions,
  getWormGearDimensions,
  helicalGearModelDefinitionSchema,
  helicalGearModelPropsSchema,
  modelDefinitionSchema,
  mp,
  spurGearModelPropsSchema,
} from "../src"

test("helical gear defaults, aliases, units, and model union", () => {
  const defaults = {
    ...spurGearModelPropsSchema.parse({}),
    helixAngle: 20,
    handedness: "right" as const,
    segmentsPerTurn: 32,
  }
  expect(helicalGearModelPropsSchema.parse({})).toEqual(defaults)
  expect(mp.string("helicalgear").json()).toEqual({
    fn: "helicalgear",
    ...defaults,
  })
  expect(mp.getModelNames()).toContain("helicalgear")
  const model = mp
    .string(
      "HELICALGEAR32_module0.1CM_facewidth0.25in_pressureangle20deg_helixangle30deg_left_borediameter2mm_backlash0.1mm_clearance0.3mm_hubdiameter10mm_hublength2mm_phase-15deg_segments24_turnsegments64",
    )
    .json()
  if (model.fn !== "helicalgear") throw new Error("Expected helical gear")
  expect(model).toEqual({
    fn: "helicalgear",
    ...defaults,
    toothCount: 32,
    module: 1,
    faceWidth: 6.35,
    helixAngle: 30,
    handedness: "left",
    boreDiameter: 2,
    backlash: 0.1,
    clearance: 0.3,
    hubDiameter: 10,
    hubLength: 2,
    phase: -15,
    segmentsPerTooth: 24,
    segmentsPerTurn: 64,
  })
  expect(modelDefinitionSchema.parse(model)).toEqual(model)
  expect(helicalGearModelDefinitionSchema.parse(model)).toEqual(model)
  expect(
    mp.string("helicalgear_teeth16_m2_w4_pa20_ha25_right_bore3").json(),
  ).toMatchObject({
    toothCount: 16,
    module: 2,
    faceWidth: 4,
    pressureAngle: 20,
    helixAngle: 25,
    handedness: "right",
    boreDiameter: 3,
  })
  expect(mp.string("helicalgear_width2mm").json()).toMatchObject({
    faceWidth: 2,
  })
})

test("helical dimensions preserve transverse spur geometry and signed pitch-cylinder twist", () => {
  const props = { toothCount: 30, module: 2, faceWidth: 8, backlash: 0.1 }
  const d = getHelicalGearDimensions({ ...props, helixAngle: 30 })
  expect(d).toMatchObject(getSpurGearDimensions(props))
  expect(d.normalModule).toBeCloseTo(Math.sqrt(3))
  expect(d.normalPitch).toBeCloseTo(Math.PI * Math.sqrt(3))
  expect(d.normalPressureAngle).toBeCloseTo(
    (Math.atan(Math.tan((20 * Math.PI) / 180) * Math.cos(Math.PI / 6)) * 180) /
      Math.PI,
  )
  expect(d.twistAngle).toBeCloseTo(
    (((8 * Math.tan(Math.PI / 6)) / 30) * 180) / Math.PI,
  )
  expect(
    getHelicalGearDimensions({ ...props, helixAngle: 30, handedness: "left" })
      .twistAngle,
  ).toBe(-d.twistAngle)
  const zero = getHelicalGearDimensions({ ...props, helixAngle: 0 })
  expect(zero).toMatchObject(getSpurGearDimensions(props))
  expect(zero.normalModule).toBe(2)
  expect(zero.normalPressureAngle).toBeCloseTo(20)
  expect(zero.twistAngle).toBe(0)
})

test("worm axial pitch matches helical transverse pitch at the worm lead angle", () => {
  const worm = getWormGearDimensions({
    module: 1.5,
    pitchDiameter: 15,
    starts: 2,
  })
  const wheel = getHelicalGearDimensions({
    module: 1.5,
    helixAngle: worm.leadAngle,
  })
  expect(wheel.circularPitch).toBe(worm.axialPitch)
  expect(wheel.normalModule).toBeCloseTo(
    1.5 * Math.cos((worm.leadAngle * Math.PI) / 180),
  )
  expect(wheel.normalPressureAngle).toBeCloseTo(
    (Math.atan(
      Math.tan((20 * Math.PI) / 180) *
        Math.cos((worm.leadAngle * Math.PI) / 180),
    ) *
      180) /
      Math.PI,
  )
})

test("helical model strings reject invalid counts, duplicate aliases, flags, and incomplete numbers", () => {
  for (const suffix of [
    "5",
    "513",
    "24.5",
    "24mm",
    "24_teeth24",
    "_m1_module2",
    "_w2_width3",
    "_ha20_helixangle30",
    "_left_right",
    "_left_left",
    "_left0",
    "_right1",
    "_ha",
    "_ha20rad",
    "_ha20deg2",
    "_ha1.2.3",
    "_ha-1",
    "_ha90",
    "_segments3",
    "_segments65",
    "_turnsegments11",
    "_turnsegments129",
    "_turnsegments32mm",
    "_teeth24mm",
    "_m1.2.3mm",
    "_mNaN",
    "_pa80",
    "_bore21.5",
    "_backlash2",
    "_clearance20",
    "_hubdiameter10",
    "_hublength2",
    "_unknown1",
    "__left",
  ]) {
    expect(() => mp.string(`helicalgear${suffix}`).json()).toThrow()
  }
})

test("helical direct props retain spur validation and reject nonfinite twist", () => {
  for (const props of [
    { helixAngle: -1 },
    { helixAngle: 90 },
    { helixAngle: NaN },
    { helixAngle: Infinity },
    { handedness: "clockwise" },
    { segmentsPerTurn: 12.5 },
    { segmentsPerTurn: 129 },
    { module: 0 },
    { module: 1e308 },
    { faceWidth: 1e308, helixAngle: 89 },
    { pressureAngle: 80 },
    { boreDiameter: 21.5 },
    { hubDiameter: 22, hubLength: 2 },
    { boreDiameter: 10, hubDiameter: 10, hubLength: 2 },
    { backlash: -1 },
    { phase: Infinity },
    { imaginary: true },
  ]) {
    expect(() => helicalGearModelPropsSchema.parse(props)).toThrow()
    expect(() =>
      helicalGearModelDefinitionSchema.parse({ fn: "helicalgear", ...props }),
    ).toThrow()
  }
  expect(() => getHelicalGearDimensions({ boreDiameter: 100 })).toThrow()
})
