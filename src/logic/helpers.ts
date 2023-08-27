import {Board} from "./Board"
import type {Position, Rotation, TileString, TrackType} from "./types"

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

export const rotations: Rotation[] = [0, 1, 2, 3]

export function hasOverpass(tile: TileString) {
  return tile[4] === "o"
}

export function hasTrackType(tile: TileString, trackType: TrackType) {
  return rotations.some((r) => tile[r] === trackType)
}

export function rotateTile(tile: TileString) {
  return `${tile[3]}${tile[0]}${tile[1]}${tile[2]}${tile[4]}` as TileString
}

export function flipTile(tile: TileString) {
  return `${tile[0]}${tile[3]}${tile[2]}${tile[1]}${tile[4]}` as TileString
}
