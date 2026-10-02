import { expect } from "bun:test"
import {
  createNemaMotorMesh,
  createNemaMotorSections,
  getNemaMotorMountingHoleCenters,
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
  const half = expected.pitch / 2
  expect(getNemaMotorMountingHoleCenters(props)).toEqual([
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ])
  const sections = createNemaMotorSections(props)
  const drilled = sections.find((s) => s.holes.length === 4)!
  expect(drilled.zMax).toBe(0)
  expect(drilled.zMin).toBe(
    -(size === 23 ? props.frontCapLength : props.mountingHoleDepth),
  )
  for (const [index, hole] of drilled.holes.entries()) {
    const [cx, cy] = getNemaMotorMountingHoleCenters(props)[index]!
    for (const [x, y] of hole)
      expect(Math.hypot(x - cx, y - cy)).toBeCloseTo(expected.diameter / 2, 10)
  }
  // Every shell must be finite, closed and consistently outward-wound.
  const mesh = createNemaMotorMesh(props)
  const edges = new Map<string, { count: number; direction: number }>()
  let volume = 0
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const ids = mesh.indices.slice(i, i + 3)
    const [a, b, c] = ids.map((id) =>
      mesh.positions.slice(id * 3, id * 3 + 3),
    ) as [number[], number[], number[]]
    volume +=
      (a[0]! * (b[1]! * c[2]! - b[2]! * c[1]!) +
        a[1]! * (b[2]! * c[0]! - b[0]! * c[2]!) +
        a[2]! * (b[0]! * c[1]! - b[1]! * c[0]!)) /
      6
    for (let j = 0; j < 3; j++) {
      const u = ids[j]!,
        v = ids[(j + 1) % 3]!,
        key = `${Math.min(u, v)}:${Math.max(u, v)}`
      expect(u).not.toBe(v)
      const e = edges.get(key) ?? { count: 0, direction: 0 }
      e.count++
      e.direction += u < v ? 1 : -1
      edges.set(key, e)
    }
  }
  expect(
    [...edges.values()].every((e) => e.count === 2 && e.direction === 0),
  ).toBe(true)
  expect(volume).toBeGreaterThan(0)
  expect(mesh.positions.every(Number.isFinite)).toBe(true)
  const zs = mesh.positions.filter((_, i) => i % 3 === 2)
  expect(Math.min(...zs)).toBe(-expected.length)
  expect(Math.max(...zs)).toBe(expected.shaft)

  // A real chord over only the tip-side length, with a round shoulder.
  const d = createNemaMotorSections({
    ...props,
    shaftShape: "d",
    shaftFlatLength: 8,
    shaftFlatDepth: 0.5,
  })
  const flat = d.filter((s) => s.name === "shaft").at(-1)!
  expect(flat.zMin).toBe(props.shaftLength - 8)
  expect(Math.max(...flat.outline.map(([x]) => x))).toBeCloseTo(
    props.shaftDiameter / 2 - 0.5,
  )
  const rotated = createNemaMotorSections({
    ...props,
    shaftShape: "d",
    shaftFlatLength: 8,
    shaftFlatDepth: 0.5,
    shaftFlatAngle: 90,
  }).at(-1)!
  expect(Math.max(...rotated.outline.map(([, y]) => y))).toBeCloseTo(
    props.shaftDiameter / 2 - 0.5,
  )
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
  ])
    expect(() =>
      nemaMotorModelPropsSchema.parse({ nemaSize: 17, ...bad }),
    ).toThrow()
}
