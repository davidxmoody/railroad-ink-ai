import {Board} from "./board"
import type {Rotation} from "./dice"
import type {Position} from "./types"

export function step(p: Position, r: Rotation): Position | undefined {
  const p2 = {
    y: r === 0 ? p.y - 1 : r === 2 ? p.y + 1 : p.y,
    x: r === 1 ? p.x + 1 : r === 3 ? p.x - 1 : p.x,
  }

  if (p2.y < 0 || p2.x < 0 || p2.y >= Board.size || p2.x >= Board.size)
    return undefined

  return p2
}

export function flipRotation(r: Rotation) {
  return ((r + 2) % 4) as Rotation
}
