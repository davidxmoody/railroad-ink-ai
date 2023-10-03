import {getAllTransformedTiles, rotations} from "./helpers"
import {
  ConnectionType,
  type MaybeTrackType,
  type OpenSlot,
  type TileString,
} from "./types"

// TODO memoise again
export default (tile: TileString, slot: OpenSlot) => {
  const placements = getAllTransformedTiles(tile)
    .map((tTile) => {
      let numMatches = 0
      let numErrors = 0

      for (const r of rotations) {
        const tileC = tTile[r] as MaybeTrackType
        const slotC = slot[r] as ConnectionType

        if (tileC === ConnectionType.NONE) {
          if (slotC === ConnectionType.ROAD || slotC === ConnectionType.RAIL) {
            numErrors++
          }
        } else if (
          slotC === ConnectionType.ROAD ||
          slotC === ConnectionType.RAIL
        ) {
          if (slotC === tileC) {
            numMatches++
          } else {
            return null
          }
        } else if (slotC === ConnectionType.NONE) {
          numErrors++
        }
      }

      if (numMatches === 0) {
        return null
      }

      const isSurrounded = rotations.every(
        (r) => tTile[r] !== ConnectionType.UNFILLED,
      )

      return {tTile, isSurrounded, numMatches, numErrors}
    })
    .filter(<T>(x: T | null): x is T => !!x)

  return placements
    .filter(({isSurrounded, numMatches, numErrors}, index) => {
      if (!isSurrounded) return true

      const hasStrictlyBetterPlacement = placements.some(
        (p2, i2) =>
          i2 !== index &&
          (p2.numMatches > numMatches ||
            (p2.numMatches === numMatches && p2.numErrors < numErrors)),
      )

      return !hasStrictlyBetterPlacement
    })
    .map(({tTile}) => tTile)
}
