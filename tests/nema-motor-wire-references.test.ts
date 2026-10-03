import { expect, test } from "bun:test"
import {
  getNemaMotorReferencePoints,
  parseModelString,
  nemaMotorModelPropsSchema,
} from "../src"

test("NEMA references follow dimensions and wire angles independently of visibility", () => {
  for (const wireConnection of ["none", "stubs", "jst-ph-6"] as const) {
    const p = nemaMotorModelPropsSchema.parse({
      nemaSize: 17,
      bodyLength: 48,
      shaftLength: 30,
      wireSideAngle: 90,
      wireConnection,
    })
    const refs = getNemaMotorReferencePoints(p)
    expect(refs.backface.position).toEqual({ x: 0, y: 0, z: -48 })
    expect(refs.shafttip.position.z).toBe(30)
    expect(refs.wireside.position.x).toBeCloseTo(0)
    expect(refs.wireside.position.y).toBeCloseTo(21.15)
    expect(refs.wireside.position.z).toBe(-45.5)
    expect(refs.wireside.direction.y).toBeCloseTo(1)
  }
  const diagonal = getNemaMotorReferencePoints({
    nemaSize: 17,
    wireSideAngle: 45,
  }).wireside.position
  expect(diagonal.x + diagonal.y).toBeCloseTo(42.3 - 3)
  expect(getNemaMotorReferencePoints({ nemaSize: 8 }).shaftflat).toBeUndefined()
})

test("wire model strings parse, normalize and reject conflicting/invalid parameters", () => {
  expect(parseModelString("nema17_jstph6_wireangle-90deg")).toMatchObject({
    wireConnection: "jst-ph-6",
    wireSideAngle: 270,
  })
  expect(
    parseModelString(
      "nema17_wirestubs_wirecount6_wirelength8mm_wirediameter1mm",
    ),
  ).toMatchObject({
    wireConnection: "stubs",
    wireCount: 6,
    wireLength: 8,
    wireDiameter: 1,
  })
  expect(parseModelString("nema17_nowires")).toMatchObject({
    wireConnection: "none",
  })
  for (const model of [
    "nema17_jstph4",
    "nema17_nowires_wirestubs",
    "nema17_wireanglebad",
    "nema17_wirecount1",
    "nema17_wirediameter6mm",
    "nema17_wirelength0mm",
  ])
    expect(() => parseModelString(model)).toThrow()
})
