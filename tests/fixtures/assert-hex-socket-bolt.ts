import { expect } from "bun:test"
import {
  hexSocketBoltDimensions,
  hexSocketBoltModelPropsSchema,
  modelDefinitionSchema,
  modelprinter,
  mp,
} from "../../src"

export function assertHexSocketBolts() {
  // "parses the M3 x 6mm model and preserves raw parameters"
  {
    const builder = mp.string("hexsocketbolt_m3_l6mm")
    expect(builder.params()).toMatchObject({
      fn: "hexsocketbolt",
      m: "3",
      l: "6mm",
    })
    expect(builder.json()).toEqual({
      fn: "hexsocketbolt",
      metricSize: "M3",
      length: 6,
      showThreads: true,
    })
    expect(modelDefinitionSchema.parse(builder.json())).toEqual(builder.json())
    expect(modelprinter.getModelNames()).toContain("hexsocketbolt")
    expect(hexSocketBoltDimensions.M3).toEqual({
      diameter: 3,
      threadPitch: 0.5,
      headDiameter: 5.5,
      headHeight: 3,
      socketWidth: 2.5,
      socketDepth: 1.3,
    })
  }

  // "supports fractional metric sizes, units, and smooth shanks"
  {
    expect(
      mp.string("HEXSOCKETBOLT_M2.5_length0.6cm_nothreads").json(),
    ).toEqual({
      fn: "hexsocketbolt",
      metricSize: "M2.5",
      length: 6,
      showThreads: false,
    })
    expect(
      hexSocketBoltModelPropsSchema.parse({
        metricSize: "M3",
        length: "0.25in",
      }).length,
    ).toBeCloseTo(6.35)
  }

  for (const source of [
    "hexsocketbolt",
    "hexsocketbolt_m3",
    "hexsocketbolt_m7_l6mm",
    "hexsocketbolt_m3_l0",
    "hexsocketbolt_m3_l-6mm",
    "hexsocketbolt_m3_l",
    "hexsocketbolt_m3_l6mm_typo",
    "hexsocketbolt_m3_l6mm_threads0",
    "hexsocketbolt_m3_l6mm_threads_nothreads",
    "hexsocketbolt_m3_l6mm_length8mm",
    "hexsocketbolt_m3_m4_l6mm",
    "hexsocketbolt(3)_m3_l6mm",
  ]) {
    expect(() => mp.string(source).json()).toThrow()
  }

  // "schema rejects unknown props and nonfinite lengths"
  {
    for (const length of [NaN, Infinity, -1, 0, "nonsense"]) {
      expect(() =>
        hexSocketBoltModelPropsSchema.parse({ metricSize: "M3", length }),
      ).toThrow()
    }
    expect(() =>
      hexSocketBoltModelPropsSchema.parse({
        metricSize: "M3",
        length: 6,
        mystery: true,
      }),
    ).toThrow()
  }
}
