import { expect, test } from "bun:test"
import {
  modelDefinitionSchema,
  mp,
  parseModelString,
  shaftModelDefinitionSchema,
  shaftModelPropsSchema,
} from "../src"

test("roadmap shaft string produces millimeter dimensions", () => {
  expect(mp.string("shaft_d8mm_l300mm").json()).toEqual({
    fn: "shaft",
    diameter: 8,
    length: 300,
  })
})

test("shaft defaults and aliases use the public parser and schemas", () => {
  const defaults = { fn: "shaft", diameter: 8, length: 300 } as const
  expect(mp.getModelNames()).toContain("shaft")
  expect(parseModelString("shaft")).toEqual(defaults)
  expect(modelDefinitionSchema.parse({ fn: "shaft" })).toEqual(defaults)
  expect(shaftModelPropsSchema.parse({})).toEqual({ diameter: 8, length: 300 })
  expect(parseModelString(" SHAFT_LENGTH2IN_DIAMETER.5IN ")).toEqual({
    fn: "shaft",
    diameter: 12.7,
    length: 50.8,
  })
  expect(parseModelString("shaft_l10")).toEqual({ ...defaults, length: 10 })
  // A short cylindrical shaft is valid; no arbitrary length/diameter ratio.
  expect(parseModelString("shaft_d10_l2")).toEqual({
    fn: "shaft",
    diameter: 10,
    length: 2,
  })
})

test("shaft dimensions normalize mixed metric and imperial units", () => {
  expect(parseModelString("shaft_d2cm_l1ft")).toEqual({
    fn: "shaft",
    diameter: 20,
    length: 304.8,
  })
  const units = [
    ["mm", 1],
    ["cm", 10],
    ["m", 1000],
    ["in", 25.4],
    ["inch", 25.4],
    ["mil", 0.0254],
    ["ft", 304.8],
    ["feet", 304.8],
  ] as const
  for (const [unit, expected] of units) {
    expect(
      shaftModelPropsSchema.parse({ diameter: `1${unit}` }).diameter,
    ).toBeCloseTo(expected, 8)
    expect(parseModelString(`shaft_l1${unit}`)).toEqual({
      fn: "shaft",
      diameter: 8,
      length: expected,
    })
  }
})

test("shaft rejects nonpositive, nonfinite and malformed dimensions", () => {
  const badValues = [
    0,
    -1,
    NaN,
    Infinity,
    -Infinity,
    "0mm",
    "-1in",
    "",
    "8mmjunk",
    "2e3",
    "1 mm",
    "1px",
    "1/2in",
    "NaN",
    "Infinity",
    true,
    null,
  ]
  for (const key of ["diameter", "length"]) {
    for (const value of badValues) {
      expect(shaftModelPropsSchema.safeParse({ [key]: value }).success).toBe(
        false,
      )
      expect(
        shaftModelDefinitionSchema.safeParse({ fn: "shaft", [key]: value })
          .success,
      ).toBe(false)
      expect(
        modelDefinitionSchema.safeParse({ fn: "shaft", [key]: value }).success,
      ).toBe(false)
    }
  }
  for (const source of [
    "shaft_d0",
    "shaft_l-2",
    "shaft_d8mmjunk",
    "shaft_l2e3",
    "shaft_d",
    "shaft_l",
    "shaft_d(8mm)",
    "shaft8_d3",
    "shaft_d8__l3",
    "shaft_d8_",
    "shaft_colorred",
    "shaft_radius4",
  ])
    expect(() => parseModelString(source)).toThrow()
})

test("shaft rejects duplicate dimensions and unknown schema properties", () => {
  for (const source of [
    "shaft_d8_d9",
    "shaft_d8_diameter8",
    "shaft_diameter8_d8",
    "shaft_l10_length10",
    "shaft_L10_l20",
  ])
    expect(() => parseModelString(source)).toThrow("set more than once")
  expect(shaftModelPropsSchema.safeParse({ radius: 4 }).success).toBe(false)
  expect(shaftModelDefinitionSchema.safeParse({ fn: "spacer" }).success).toBe(
    false,
  )
  expect(
    modelDefinitionSchema.safeParse({ fn: "shaft", radius: 4 }).success,
  ).toBe(false)
})
