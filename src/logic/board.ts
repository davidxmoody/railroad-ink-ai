import {rotations, type Rotation, type Tile, type TrackType} from "./dice"
import {flipRotation, step} from "./helpers"

export interface Exit {
  y: number
  x: number
  r: Rotation
  t: TrackType
}

export class Board {
  public static size = 7

  public static exits: Exit[] = [
    {y: 0, x: 1, r: 0, t: "d"},
    {y: 0, x: 3, r: 0, t: "l"},
    {y: 0, x: 5, r: 0, t: "d"},
    {y: 1, x: 6, r: 1, t: "l"},
    {y: 3, x: 6, r: 1, t: "d"},
    {y: 5, x: 6, r: 1, t: "l"},
    {y: 6, x: 5, r: 2, t: "d"},
    {y: 6, x: 3, r: 2, t: "l"},
    {y: 6, x: 1, r: 2, t: "d"},
    {y: 5, x: 0, r: 3, t: "l"},
    {y: 3, x: 0, r: 3, t: "d"},
    {y: 1, x: 0, r: 3, t: "l"},
  ]

  private grid: Tile[]

  public constructor(grid?: Tile[]) {
    this.grid = grid ?? []
  }

  private checkBounds(y: number, x: number) {
    if (y < 0 || x < 0 || y >= Board.size || x >= Board.size)
      throw new Error("Board reference out of bounds")
  }

  public get(y: number, x: number): Tile | undefined {
    this.checkBounds(y, x)
    return this.grid[y * Board.size + x]
  }

  public forEachTile(fn: (y: number, x: number, tile: Tile) => void) {
    for (let y = 0; y < Board.size; y++) {
      for (let x = 0; x < Board.size; x++) {
        const tile: Tile | undefined = this.grid[y * Board.size + x]
        if (tile) fn(y, x, tile)
      }
    }
  }

  public countErrors() {
    let numErrors = 0
    this.forEachTile((y, x, tile) => {
      for (const r of rotations) {
        if (!tile[r]) continue
        const adjacent = step(y, x, r)
        if (!adjacent) continue
        const adjacentTile = this.get(...adjacent)
        if (adjacentTile?.[flipRotation(r)]) continue
        numErrors++
      }
    })
    return numErrors
  }

  public isValid(y: number, x: number, tile: Tile) {
    if (this.get(y, x) !== undefined) return false

    let numMatchingConnections = 0

    for (const r of rotations) {
      if (!tile[r]) continue

      const exit = Board.exits.find((e) => e.y === y && e.x === x && e.r === r)
      if (exit && exit.t !== tile[r]) return false
      if (exit && exit.t === tile[r]) numMatchingConnections++

      const adjacent = step(y, x, r)
      if (!adjacent) continue

      const adjacentTile = this.get(...adjacent)
      if (!adjacentTile?.[flipRotation(r)]) continue

      if (adjacentTile[flipRotation(r)] === tile[r]) {
        numMatchingConnections++
      } else {
        return false
      }
    }

    return numMatchingConnections >= 1
  }

  public getConnectedTiles(y: number, x: number, t: TrackType) {
    const tile = this.get(y, x)
    if (!tile) throw new Error("No tile at coordinates")

    return rotations.flatMap((r) => {
      const newT = tile[r]
      if (!newT) return []
      if (tile.overpass && newT !== t) return []

      const newPos = step(y, x, r)
      if (!newPos) return []

      const connectedTile = this.get(...newPos)
      if (!connectedTile) return []
      if (connectedTile[flipRotation(r)] !== newT) return []

      return {y: newPos[0], x: newPos[1], t: newT}
    })
  }

  public set(y: number, x: number, tile: Tile) {
    this.checkBounds(y, x)
    if (!this.isValid(y, x, tile)) throw new Error("Invalid tile placement")

    const newGrid = [...this.grid]
    newGrid[y * Board.size + x] = tile

    return new Board(newGrid)
  }
}
