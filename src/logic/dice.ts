import type {TileString} from "./types"

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

function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function rollDice(): TileString[] {
  return [
    randomPick(routeDieA),
    randomPick(routeDieA),
    randomPick(routeDieA),
    randomPick(routeDieB),
  ]
}
