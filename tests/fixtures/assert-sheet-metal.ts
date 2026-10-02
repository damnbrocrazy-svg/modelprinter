import { expect } from "bun:test"
import { mp } from "../../src"

export function assertSheetMetal() {
  expect(
    mp.string("sheetmetal_channel_w28mm_l24mm_h14mm_t1mm_r2mm").json(),
  ).toMatchObject({
    fn: "sheetmetal",
    profile: "channel",
    width: 28,
    baseLength: 24,
  })
  expect(
    mp
      .string("sheetmetal_plate_w20_l20_hole1(r3mm_bottomface_leftofcenter3mm)")
      .json(),
  ).toMatchObject({
    holes: [{ panel: "base", shape: "round", diameter: 6, u: -3, v: 0 }],
  })
  expect(
    mp
      .string(
        "sheetmetal_channel_w28_l24_slot1(l10_w2_leftface_rightofcenter3_abovecenter2_vertical)",
      )
      .json(),
  ).toMatchObject({
    holes: [
      {
        panel: "left",
        shape: "slot",
        length: 10,
        width: 2,
        u: 2,
        v: -3,
        axis: "u",
      },
    ],
  })
  expect(
    mp
      .string("sheetmetal_angle_w28_l24_hole1(d2_angledface_rightofcenter3)")
      .json(),
  ).toMatchObject({ holes: [{ panel: "right", diameter: 2, u: 0, v: 3 }] })
  for (const feature of [
    "hole1(r2)",
    "hole1(r2_leftface)",
    "hole1(r2_bottomface_angledface)",
    "hole1(r2_d4_bottomface)",
    "hole1(r2_bottomface_leftofcenter2_rightofcenter3)",
    "hole1(r2_bottomface_leftofcenter-2)",
    "hole1(r2_bottomface_unknown)",
    "slot1(l2_w4_bottomface)",
    "slot1(l4_bottomface)",
    "hole1(r0_bottomface)",
    "slot1(l4_w2_bottomface_horizontal_vertical)",
    "hole1(r2_bottomface",
    "hole0(r2_bottomface)",
    "hole1(r2_bottomface)_hole1(r2_bottomface)",
    "hole1(r2__bottomface)",
  ])
    expect(
      () => mp.string(`sheetmetal_plate_w20_l20_${feature}`).json(),
      feature,
    ).toThrow()
  expect(() => mp.string("sheetmetal_angle_w10_w12_l10").json()).toThrow(
    "Duplicate",
  )
}
