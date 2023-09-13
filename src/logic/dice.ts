import type {TileString} from "./types"
import seedrandom from "seedrandom"
import {randomPick} from "./helpers"

export const routeDieA: TileString[] = [
  "_D_D",
  "_L_L",
  "_DD_",
  "_LL_",
  "_DDD",
  "_LLL",
]

export const routeDieB: TileString[] = ["DLDLo", "_D_L", "__DL"]

export const specialRouteTiles: TileString[] = [
  "DDLD",
  "DLLL",
  "DDDD",
  "LLLL",
  "DLLD",
  "DLDL",
]

export function rollRoundDice(rand = Math.random): TileString[] {
  return [
    randomPick(routeDieA, rand),
    randomPick(routeDieA, rand),
    randomPick(routeDieA, rand),
    randomPick(routeDieB, rand),
  ]
}

export function rollGameDice(seed?: string | number): TileString[][] {
  const rand = seedrandom(seed?.toString())
  return Array.from({length: 7}, () => rollRoundDice(rand))
}
