import {Rotation, Tile, TrackType} from "./dice"

interface Connection {
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

  private grid: Tile[] = []
  private openConnections = [...Board.exits]

  private checkBounds(y: number, x: number) {
    if (y < 0 || x < 0 || y >= Board.size || x >= Board.size)
      throw new Error("Board reference out of bounds")
  }

  public get(y: number, x: number) {
    this.checkBounds(y, x)
    return this.grid[y * Board.size + x]
  }

  public isValid(y: number, x: number, tile: Tile) {
    if (this.get(y, x) !== undefined) return false

    const connections = this.openConnections.filter(
      (c) => c.y === y && c.x === x,
    )

    if (connections.length === 0) return false

    for (const connection of connections) {
      if (connection.t !== tile[connection.r]) return false
    }

    return true
  }

  public set(y: number, x: number, tile: Tile) {
    this.checkBounds(y, x)
    if (!this.isValid(y, x, tile)) throw new Error("Invalid tile placement")

    this.grid[y * Board.size + x] = tile

    for (const r of [0, 1, 2, 3] as const) {
      const connection = this.openConnections.find(
        (c) => c.y === y && c.x === x && c.r === r,
      )

      if (connection) {
        this.openConnections = this.openConnections.filter(
          (c) => c !== connection,
        )
      } else {
        const cY = r === 0 ? y - 1 : r === 2 ? y + 1 : y
        const cX = r === 1 ? x + 1 : r === 3 ? x - 1 : x
        const cR = ((r + 2) % 4) as Rotation

        if (cY < 0 || cX < 0 || cY >= Board.size || cX >= Board.size) {
          continue // Routes can safely go off the edge of the board
        }

        this.openConnections.push({y: cY, x: cX, r: cR, t: tile[r]!})
      }
    }
  }

  public print() {
    for (let y = 0; y < Board.size; y++) {
      for (let x = 0; x < Board.size; x++) {
        // TODO
        console.log(this.grid[y * Board.size + x])
      }
    }
  }
}
