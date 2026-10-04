import { expect, test } from "bun:test"
import {
  flatWasherModelDefinitionSchema,
  flatWasherModelPropsSchema,
  modelDefinitionSchema,
  modelprinter,
  mp,
} from "../src"

test("flat washer roadmap example is a registered model with a validated contract", () => {
  const builder = mp.string("flatwasher_id6.4mm_od12mm_h1.6mm")
  expect(builder.params()).toMatchObject({
    fn: "flatwasher",
    id: "6.4mm",
    od: "12mm",
    h: "1.6mm",
  })
  const model = builder.json()
  expect(model).toEqual({
    fn: "flatwasher",
    innerDiameter: 6.4,
    outerDiameter: 12,
    height: 1.6,
  })
  expect(modelDefinitionSchema.parse(model)).toEqual(model)
  expect(modelprinter.getModelNames()).toContain("flatwasher")
})

test("flat washer defaults and equivalent unit-bearing inputs agree", () => {
  expect(mp.string("flatwasher").json()).toEqual({
    fn: "flatwasher",
    ...flatWasherModelPropsSchema.parse({}),
  })
  const expected = {
    fn: "flatwasher" as const,
    innerDiameter: 6.35,
    outerDiameter: 12.7,
    height: 2.54,
  }
  expect(
    mp
      .string("FLATWASHER_innerdiameter0.25IN_outerdiameter1.27CM_height100mil")
      .json(),
  ).toEqual(expected)
  expect(
    flatWasherModelDefinitionSchema.parse({
      fn: "flatwasher",
      innerDiameter: "0.25in",
      outerDiameter: "1.27cm",
      height: "100mil",
    }),
  ).toEqual(expected)
  expect(mp.string("flatwasher_h2_id3_od10").json()).toEqual({
    fn: "flatwasher",
    innerDiameter: 3,
    outerDiameter: 10,
    height: 2,
  })
})

test("flat washer rejects invalid dimensions through both public object schemas", () => {
  for (const props of [
    { innerDiameter: 0 },
    { outerDiameter: -12 },
    { height: 0 },
    { height: -1 },
    { height: Number.NaN },
    { height: Number.POSITIVE_INFINITY },
    { height: "1mmjunk" },
    { height: "1e999" },
    { height: "2px" },
    { height: true },
    { innerDiameter: 12, outerDiameter: 12 },
    { innerDiameter: "0.5in", outerDiameter: "12mm" },
    { innerDiameter: 13 },
    { outerDiameter: 6 },
    { imaginaryDimension: 4 },
  ]) {
    expect(flatWasherModelPropsSchema.safeParse(props).success).toBe(false)
    expect(
      flatWasherModelDefinitionSchema.safeParse({ fn: "flatwasher", ...props })
        .success,
    ).toBe(false)
    expect(
      modelDefinitionSchema.safeParse({ fn: "flatwasher", ...props }).success,
    ).toBe(false)
  }
  expect(
    flatWasherModelDefinitionSchema.safeParse({ fn: "spacer" }).success,
  ).toBe(false)
})

test("flat washer rejects ambiguous, malformed and physically invalid model strings", () => {
  for (const source of [
    "flatwasher6",
    "flatwasher(6)",
    "flatwasher_id",
    "flatwasher_id3_id4",
    "flatwasher_id3_innerdiameter4",
    "flatwasher_od12_outerdiameter14",
    "flatwasher_h1_height2",
    "flatwasher_h1_H2",
    "flatwasher_h0",
    "flatwasher_h-1mm",
    "flatwasher_h1mmjunk",
    "flatwasher_h2px",
    "flatwasher_id0",
    "flatwasher_id12_od12",
    "flatwasher_id0.5in_od12mm",
    "flatwasher_thickness2",
    "flatwasher_constructor2",
    "flatwasher_od12_",
  ]) {
    expect(() => mp.string(source).json(), source).toThrow()
  }
})

test("flat washer cross-dimension errors identify the invalid inner diameter", () => {
  const result = flatWasherModelPropsSchema.safeParse({
    innerDiameter: "2cm",
    outerDiameter: "10mm",
  })
  expect(result.success).toBe(false)
  if (result.success) throw new Error("Expected dimension validation failure")
  expect(result.error.issues).toContainEqual({
    code: "custom",
    path: ["innerDiameter"],
    message: "Inner diameter must be smaller than outer diameter",
  })
})
