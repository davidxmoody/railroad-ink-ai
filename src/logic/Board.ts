import {
  type TileString,
  type TrackType,
  type Position,
  type TrackPosition,
  type MaybeTrackType,
  type OpenSlot,
  ConnectionType,
} from "./types"
import {
  flipRotation,
  hasOverpass,
  rotations,
  step,
  tileFitsInSlot,
  updateSlot,
  getAllTransformedTiles,
} from "./helpers"
import {Grid} from "./Grid"

export class Board {
  public static readonly size = Grid.size

  public static readonly exitSlots: Grid<OpenSlot> = Grid.fromList([
    {y: 0, x: 1, v: "D..."},
    {y: 0, x: 3, v: "L..."},
    {y: 0, x: 5, v: "D..."},
    {y: 1, x: 6, v: ".L.."},
    {y: 3, x: 6, v: ".D.."},
    {y: 5, x: 6, v: ".L.."},
    {y: 6, x: 5, v: "..D."},
    {y: 6, x: 3, v: "..L."},
    {y: 6, x: 1, v: "..D."},
    {y: 5, x: 0, v: "...L"},
    {y: 3, x: 0, v: "...D"},
    {y: 1, x: 0, v: "...L"},
  ])

  private tiles: Grid<TileString>
  private openSlots: Grid<OpenSlot>

  public constructor(data?: {
    tiles: Grid<TileString>
    openSlots: Grid<OpenSlot>
  }) {
    this.tiles = data?.tiles ?? Grid.fromList([])
    this.openSlots = data?.openSlots ?? Board.exitSlots
  }

  public get(p: Position) {
    return this.tiles.get(p)
  }

  public getOpenSlot(p: Position) {
    return this.openSlots.get(p)
  }

  public forEachTile(fn: (p: Position, tile: TileString) => void) {
    return this.tiles.forEach(fn)
  }

  public countErrors() {
    // TODO see if this could be sped up by counting open slot connections
    // minus exit connections...
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
    const slot = this.openSlots.get(p)
    return !!slot && tileFitsInSlot(tile, slot)
  }

  public isValidWithTransform(p: Position, tile: TileString) {
    for (const tTile of getAllTransformedTiles(tile)) {
      if (this.isValid(p, tTile)) return true
    }
    return false
  }

  public getAllValidTransformedTiles(p: Position, tile: TileString) {
    return getAllTransformedTiles(tile).filter((tTile) =>
      this.isValid(p, tTile),
    )
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

  public set(p: Position, tile: TileString) {
    if (!this.isValid(p, tile))
      throw new Error(
        `Invalid tile placement ${p.y}${p.x}${tile} ${this.toString()}`,
      )

    const tiles = this.tiles.clone()
    tiles.set(p, tile)

    const openSlots = this.openSlots.clone()
    openSlots.delete(p)

    for (const r of rotations) {
      const adjacentP = step(p, r)
      if (!adjacentP || this.get(adjacentP)) continue

      const trackType = tile[r] as MaybeTrackType

      const existingSlot = openSlots.get(adjacentP)

      if (trackType === ConnectionType.NONE) {
        if (existingSlot) {
          const newSlot = updateSlot(
            flipRotation(r),
            ConnectionType.NONE,
            existingSlot,
          )
          openSlots.set(adjacentP, newSlot)
        }
      } else {
        const newSlot = updateSlot(
          flipRotation(r),
          trackType,
          existingSlot ?? this.calculateSlot(adjacentP),
        )
        openSlots.set(adjacentP, newSlot)
      }
    }

    return new Board({tiles, openSlots})
  }

  private calculateSlot(p: Position) {
    return rotations
      .map((r) => {
        const adjacentP = step(p, r)
        if (!adjacentP) return ConnectionType.EDGE
        const adjacentTile = this.get(p)
        if (!adjacentTile) return ConnectionType.UNFILLED
        return adjacentTile[r]
      })
      .join("") as OpenSlot
  }

  public get openPositions() {
    const ps: Position[] = []
    this.openSlots.forEach((p) => ps.push(p))
    return ps
  }

  public toString() {
    let str = ""

    this.forEachTile(({y, x}, tile) => {
      str += `${y}${x}${tile} `
    })

    return str || "Empty"
  }

  public erase(p: Position) {
    const tiles = this.tiles.clone()
    tiles.delete(p)

    const openSlots = this.openSlots.clone()
    const newSlot = this.calculateSlot(p)
    openSlots.set(p, newSlot)

    return new Board({tiles, openSlots})
  }
}
