import type {
  TileString,
  TrackType,
  Position,
  TrackPosition,
  Exit,
  MaybeTrackType,
} from "./types"
import {
  flipRotation,
  hasOverpass,
  rotations,
  step,
  allTransforms,
  transformTile,
} from "./helpers"

export class Board {
  public static size = 7

  public static exits: Exit[] = [
    {y: 0, x: 1, r: 0, t: "D"},
    {y: 0, x: 3, r: 0, t: "L"},
    {y: 0, x: 5, r: 0, t: "D"},
    {y: 1, x: 6, r: 1, t: "L"},
    {y: 3, x: 6, r: 1, t: "D"},
    {y: 5, x: 6, r: 1, t: "L"},
    {y: 6, x: 5, r: 2, t: "D"},
    {y: 6, x: 3, r: 2, t: "L"},
    {y: 6, x: 1, r: 2, t: "D"},
    {y: 5, x: 0, r: 3, t: "L"},
    {y: 3, x: 0, r: 3, t: "D"},
    {y: 1, x: 0, r: 3, t: "L"},
  ]

  private grid: TileString[]

  public constructor(grid?: TileString[]) {
    this.grid = grid ?? []
  }

  private checkBounds(p: Position) {
    if (p.y < 0 || p.x < 0 || p.y >= Board.size || p.x >= Board.size)
      throw new Error("Board reference out of bounds")
  }

  public get(p: Position): TileString | undefined {
    this.checkBounds(p)
    return this.grid[p.y * Board.size + p.x]
  }

  public forEachTile(fn: (p: Position, tile: TileString) => void) {
    for (let y = 0; y < Board.size; y++) {
      for (let x = 0; x < Board.size; x++) {
        const tile: TileString | undefined = this.grid[y * Board.size + x]
        if (tile) fn({y, x}, tile)
      }
    }
  }

  public countErrors() {
    let numErrors = 0
    this.forEachTile(({y, x}, tile) => {
      for (const r of rotations) {
        if (tile[r] === "_") continue
        const adjacent = step({y, x}, r)
        if (!adjacent) continue
        const adjacentTile = this.get(adjacent)
        if (adjacentTile && adjacentTile[flipRotation(r)] !== "_") continue
        numErrors++
      }
    })
    return numErrors
  }

  public isValid(p: Position, tile: TileString) {
    if (this.get(p) !== undefined) return false

    let numMatchingConnections = 0

    for (const r of rotations) {
      if (tile[r] === "_") continue

      const exit = Board.exits.find(
        (e) => e.y === p.y && e.x === p.x && e.r === r,
      )
      if (exit) {
        if (exit.t === tile[r]) {
          numMatchingConnections++
          continue
        } else {
          return false
        }
      }

      const adjacent = step(p, r)
      if (!adjacent) continue

      const adjacentTile = this.get(adjacent)
      if (!adjacentTile || adjacentTile[flipRotation(r)] === "_") continue

      if (adjacentTile[flipRotation(r)] === tile[r]) {
        numMatchingConnections++
      } else {
        return false
      }
    }

    return numMatchingConnections >= 1
  }

  public isValidWithTransform(p: Position, tile: TileString) {
    return allTransforms.some((t) => this.isValid(p, transformTile(tile, t)))
  }

  public getAllValidTransformedTiles(p: Position, tile: TileString) {
    const validTransformedTiles: TileString[] = []
    for (const tTile of allTransforms.map((t) => transformTile(tile, t))) {
      if (this.isValid(p, tTile) && !validTransformedTiles.includes(tTile)) {
        validTransformedTiles.push(tTile)
      }
    }
    return validTransformedTiles
  }

  public getConnectedTiles(
    tp: TrackPosition,
    onlyConsiderTrackType?: TrackType,
  ): TrackPosition[] {
    const tile = this.get(tp)
    if (!tile) throw new Error("No tile at coordinates")

    const connectedTiles: TrackPosition[] = []

    for (const r of rotations) {
      const newT = tile[r] as MaybeTrackType
      if (newT === "_") continue
      if (onlyConsiderTrackType && newT !== onlyConsiderTrackType) continue
      if (hasOverpass(tile) && newT !== tp.t) continue

      const newPos = step(tp, r)
      if (!newPos) continue

      const connectedTile = this.get(newPos)
      if (!connectedTile) continue
      if (connectedTile[flipRotation(r)] !== newT) continue

      connectedTiles.push({y: newPos.y, x: newPos.x, t: newT})
    }

    return connectedTiles
  }

  public equals(board: Board) {
    for (let i = 0; i < Board.size * Board.size; i++) {
      if (this.grid[i] !== board.grid[i]) return false
    }
    return true
  }

  public set(p: Position, tile: TileString) {
    this.checkBounds(p)
    if (!this.isValid(p, tile)) throw new Error("Invalid tile placement")

    const newGrid = [...this.grid]
    newGrid[p.y * Board.size + p.x] = tile

    return new Board(newGrid)
  }

  public toString() {
    let str = ""

    this.forEachTile(({y, x}, tile) => {
      str += `${y},${x}${tile} `
    })

    return str || "Empty"
  }
}
