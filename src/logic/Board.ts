import type {
  TileString,
  TrackType,
  Position,
  TrackPosition,
  Exit,
  MaybeTrackType,
  OpenSlot,
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

  public static readonly exitSlots: Grid<OpenSlot> = Grid.fromList([
    {y: 0, x: 1, v: "D___"},
    {y: 0, x: 3, v: "L___"},
    {y: 0, x: 5, v: "D___"},
    {y: 1, x: 6, v: "_L__"},
    {y: 3, x: 6, v: "_D__"},
    {y: 5, x: 6, v: "_L__"},
    {y: 6, x: 5, v: "__D_"},
    {y: 6, x: 3, v: "__L_"},
    {y: 6, x: 1, v: "__D_"},
    {y: 5, x: 0, v: "___L"},
    {y: 3, x: 0, v: "___D"},
    {y: 1, x: 0, v: "___L"},
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
    return getAllTransformedTiles(tile).some((tTile) => this.isValid(p, tTile))
  }

  public getAllValidTransformedTiles(p: Position, tile: TileString) {
    const validTransformedTiles: TileString[] = []
    for (const tTile of getAllTransformedTiles(tile)) {
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

  public set(p: Position, tile: TileString) {
    if (!this.isValid(p, tile)) throw new Error("Invalid tile placement")

    const tiles = this.tiles.clone()
    tiles.set(p, tile)

    const openSlots = this.openSlots.clone()
    openSlots.delete(p)

    for (const r of rotations) {
      const adjacentP = step(p, r)
      if (!adjacentP || this.get(adjacentP)) continue

      const t = tile[r] as MaybeTrackType
      if (t === "_") continue

      openSlots.set(adjacentP, updateSlot(flipRotation(r), t))
    }

    return new Board({tiles, openSlots})
  }

  public get openPositions() {
    const ps: Position[] = []
    this.openSlots.forEach((p) => ps.push(p))
    return ps
  }

  public toString() {
    let str = ""

    this.forEachTile(({y, x}, tile) => {
      str += `${y},${x}${tile} `
    })

    return str || "Empty"
  }
}
