import {Board} from "./board"
import type {Rotation} from "./dice"

export function step(
  y: number,
  x: number,
  r: Rotation,
): [number, number] | undefined {
  const y2 = r === 0 ? y - 1 : r === 2 ? y + 1 : y
  const x2 = r === 1 ? x + 1 : r === 3 ? x - 1 : x

  if (y2 < 0 || x2 < 0 || y2 >= Board.size || x2 >= Board.size) return undefined

  return [y2, x2]
}

export function flipRotation(r: Rotation) {
  return ((r + 2) % 4) as Rotation
}
