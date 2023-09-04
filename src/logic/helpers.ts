import {Board} from "./Board"
import type {
  Position,
  Rotation,
  TileString,
  TrackType,
  Transform,
} from "./types"

export function step(p: Position, r: Rotation): Position | undefined {
  const p2 = {
    y: r === 0 ? p.y - 1 : r === 2 ? p.y + 1 : p.y,
    x: r === 1 ? p.x + 1 : r === 3 ? p.x - 1 : p.x,
  }

  if (p2.y < 0 || p2.x < 0 || p2.y >= Board.size || p2.x >= Board.size) {
    return undefined
  }

  return p2
}

export function addRotation(r1: Rotation, r2: Rotation, clockwise = true) {
  return ((clockwise ? r1 + r2 : 4 + r1 - r2) % 4) as Rotation
}

export function flipRotation(r: Rotation) {
  return addRotation(r, 2)
}

export const rotations: Rotation[] = [0, 1, 2, 3]

export function hasOverpass(tile: TileString) {
  return tile[4] === "o"
}

export function hasTrackType(tile: TileString, trackType: TrackType) {
  return rotations.some((r) => tile[r] === trackType)
}

export function rotateTile(tile: TileString, r: Rotation = 1) {
  return `${tile[addRotation(0, r, false)]}${tile[addRotation(1, r, false)]}${
    tile[addRotation(2, r, false)]
  }${tile[addRotation(3, r, false)]}${tile[4]}` as TileString
}

export function flipTile(tile: TileString) {
  return `${tile[0]}${tile[3]}${tile[2]}${tile[1]}${tile[4]}` as TileString
}

export function getAllTransforms(tile: TileString) {
  // TODO memoize/cache this because it's called a lot
  const transforms = new Set<TileString>()
  for (const r of rotations) {
    transforms.add(rotateTile(tile, r))
    transforms.add(rotateTile(flipTile(tile), r))
  }
  return transforms.values()
}

export function transformTile(tile: TileString, transform: Transform) {
  const rotated = rotateTile(tile, transform.rotation ?? 0)
  return transform.flip ? flipTile(rotated) : rotated
}

export function isCenterSquare(p: Position) {
  return p.y >= 2 && p.y <= 4 && p.x >= 2 && p.x <= 4
}