import {Board} from "./Board"
import {
  ConnectionType,
  type MaybeTrackType,
  type OpenSlot,
  type Position,
  type Rotation,
  type TileString,
  type TrackType,
  type Transform,
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

export function isSpecial(tile: TileString) {
  return !hasOverpass(tile) && !tile.includes("_")
}

export function hasTrackType(tile: TileString, trackType: TrackType) {
  return rotations.some((r) => tile[r] === trackType)
}

export function rotateTile(tile: TileString, r: Rotation = 1) {
  return `${tile[addRotation(0, r, false)]}${tile[addRotation(1, r, false)]}${
    tile[addRotation(2, r, false)]
  }${tile[addRotation(3, r, false)]}${tile[4] ?? ""}` as TileString
}

export function flipTile(tile: TileString) {
  return `${tile[0]}${tile[3]}${tile[2]}${tile[1]}${
    tile[4] ?? ""
  }` as TileString
}

export function memo1<A extends string, T>(fn: (arg: A) => T): (arg: A) => T {
  const cache = {} as Record<A, T>
  return (arg: A) => {
    if (!(arg in cache)) {
      cache[arg] = fn(arg)
    }
    return cache[arg]
  }
}

export function memo2<A1 extends string, A2 extends string, T>(
  fn: (arg1: A1, arg2: A2) => T,
): (arg1: A1, arg2: A2) => T {
  const cache = {} as Record<A1, Record<A2, T>>
  return (arg1: A1, arg2: A2) => {
    if (!(arg1 in cache) || !(arg2 in cache[arg1])) {
      if (!(arg1 in cache)) cache[arg1] = {} as Record<A2, T>
      cache[arg1][arg2] = fn(arg1, arg2)
    }
    return cache[arg1][arg2]
  }
}

export const getAllTransformedTiles = memo1((tile: TileString) => {
  const results: TileString[] = []
  for (const rotation of rotations) {
    for (const flip of [false, true]) {
      const tTile = transformTile(tile, {rotation, flip})
      if (!results.includes(tTile)) results.push(tTile)
    }
  }
  return results
})

export function transformTile(tile: TileString, transform: Transform) {
  const rotated = rotateTile(tile, transform.rotation ?? 0)
  return transform.flip ? flipTile(rotated) : rotated
}

export function isCenterSquare(p: Position) {
  return p.y >= 2 && p.y <= 4 && p.x >= 2 && p.x <= 4
}

export function pEqual(p1: Position, p2: Position) {
  return p1.y === p2.y && p1.x === p2.x
}

export function randomPick<T>(array: T[], rand: () => number = Math.random): T {
  return array[Math.floor(rand() * array.length)]
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function tileFitsInSlot(tile: TileString, slot: OpenSlot) {
  let numMatches = 0

  for (const r of rotations) {
    const tileC = tile[r] as MaybeTrackType
    const slotC = slot[r] as ConnectionType

    if (
      tileC === ConnectionType.NONE ||
      slotC === ConnectionType.NONE ||
      slotC === ConnectionType.UNFILLED ||
      slotC === ConnectionType.EDGE
    ) {
      continue
    }

    if (tileC !== slotC) {
      return false
    }

    numMatches++
  }

  return numMatches >= 1
}

export function updateSlot(r: Rotation, t: ConnectionType, slot: OpenSlot) {
  return (slot.substring(0, r) + t + slot.substring(r + 1)) as OpenSlot
}

export function getMean(list: number[]) {
  return list.reduce((a, b) => a + b) / list.length
}

export function getStandardDeviation(list: number[]) {
  const mean = getMean(list)
  return Math.sqrt(
    list.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
      list.length,
  )
}

export function parseMove(move: string) {
  const t = move.slice(2) as TileString
  const y = parseInt(move[0], 10)
  const x = parseInt(move[1], 10)
  return {p: {y, x}, t}
}

export function encodeMove(p: Position, t: TileString) {
  return `${p.y}${p.x}${t}`
}

export function argmax<T>(list: T[], fn: (item: T) => number) {
  return list
    .map((item) => [item, fn(item)] as const)
    .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
}
