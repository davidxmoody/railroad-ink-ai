import {Rotation, Tile, TrackType} from "./dice"

export interface Connection {
  y: number
  x: number
  r: Rotation
  t: TrackType
}

export class Board {
  public static size = 7

  public static exits: Connection[] = [
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
  private openConnections: Connection[]

  public constructor(data?: {grid: Tile[]; openConnections: Connection[]}) {
    this.grid = data?.grid ?? []
    this.openConnections = data?.openConnections ?? [...Board.exits]
  }

  private checkBounds(y: number, x: number) {
    if (y < 0 || x < 0 || y >= Board.size || x >= Board.size)
      throw new Error("Board reference out of bounds")
  }

  public get(y: number, x: number): Tile | undefined {
    this.checkBounds(y, x)
    return this.grid[y * Board.size + x]
  }

  public getConnections(y: number, x: number): Connection[] {
    this.checkBounds(y, x)
    return this.openConnections.filter((c) => c.y === y && c.x === x)
  }

  public isValid(y: number, x: number, tile: Tile) {
    if (this.get(y, x) !== undefined) return false

    const connections = this.openConnections.filter(
      (c) => c.y === y && c.x === x,
    )

    let numMatchingConnections = 0
    for (const connection of connections) {
      if (tile[connection.r] === undefined) continue
      if (tile[connection.r] !== connection.t) return false
      numMatchingConnections++
    }

    return numMatchingConnections >= 1
  }

  public set(y: number, x: number, tile: Tile) {
    this.checkBounds(y, x)
    if (!this.isValid(y, x, tile)) throw new Error("Invalid tile placement")

    const newGrid = [...this.grid]
    newGrid[y * Board.size + x] = tile

    let newOpenConnections = this.openConnections

    for (const r of [0, 1, 2, 3] as const) {
      const connection = newOpenConnections.find(
        (c) => c.y === y && c.x === x && c.r === r,
      )

      if (connection) {
        newOpenConnections = newOpenConnections.filter((c) => c !== connection)
      } else {
        const cT = tile[r]
        if (cT === undefined) continue

        const cY = r === 0 ? y - 1 : r === 2 ? y + 1 : y
        const cX = r === 1 ? x + 1 : r === 3 ? x - 1 : x
        const cR = ((r + 2) % 4) as Rotation

        if (cY < 0 || cX < 0 || cY >= Board.size || cX >= Board.size) {
          continue // Routes can safely go off the edge of the board
        }

        newOpenConnections.push({y: cY, x: cX, r: cR, t: cT})
      }
    }

    return new Board({grid: newGrid, openConnections: newOpenConnections})
  }
}
