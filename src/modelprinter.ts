import { parseNemaMotorModelParams } from "./parse-nema-motor-model-string"
import { parseShaftModelParams } from "./parse-shaft-model-string"
import { parseSheetMetalModelParams } from "./parse-sheet-metal-model-string"
import type { ModelDefinition } from "./flex-screen-schema"
import { parseHexSocketBoltModelParams } from "./parse-hex-socket-bolt-model-string"
import { parseFlexScreenModelParams } from "./parse-flex-screen-model-string"
import { parseSpurGearModelParams } from "./parse-spur-gear-model-string"
import { parseWormGearModelParams } from "./parse-worm-gear-model-string"
import {
  parseModelStringParams,
  type RawModelprinterParams,
} from "./parse-model-string"

import { parseHelicalGearModelParams } from "./parse-helical-gear-model-string"

const modelFunctions = {
  shaft: parseShaftModelParams,
  helicalgear: parseHelicalGearModelParams,
  nema: parseNemaMotorModelParams,
  sheetmetal: parseSheetMetalModelParams,
  flexscreen: parseFlexScreenModelParams,
  hexsocketbolt: parseHexSocketBoltModelParams,
  spurgear: parseSpurGearModelParams,
  wormgear: parseWormGearModelParams,
}

const modelParamsToJson = (params: RawModelprinterParams): ModelDefinition => {
  const modelFunction = modelFunctions[params.fn as keyof typeof modelFunctions]
  if (modelFunction) {
    return modelFunction(params)
  }
  throw new Error(`Unsupported modelprinter function "${params.fn}"`)
}

export const string = (value: string) => {
  const params = parseModelStringParams(value)
  return {
    params: () => params,
    json: () => modelParamsToJson(params),
  }
}

export const parseModelString = (value: string): ModelDefinition =>
  string(value).json()

export const modelprinter = {
  string,
  getModelNames: () => Object.keys(modelFunctions),
}

/** Compact alias matching footprinter's familiar `fp.string(...)` API. */
export const mp = modelprinter
