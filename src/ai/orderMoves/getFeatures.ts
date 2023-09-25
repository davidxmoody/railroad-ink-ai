import {Board} from "../../logic/Board"
import type GameState from "../../logic/GameState"
import {isCenterSquare, parseMove, rotations} from "../../logic/helpers"
import {ConnectionType, type MaybeTrackType} from "../../logic/types"

export default function getFeatures(gs: GameState, move: string) {
  const {p, tile} = parseMove(move)
  const slot = gs.board.getOpenSlot(p)!

  let numMatches = 0
  let numOpen = 0
  let numEdge = 0
  let numErrors = 0

  for (const r of rotations) {
    const tileC = tile[r] as MaybeTrackType
    const slotC = slot[r] as ConnectionType

    if (tileC === ConnectionType.NONE) {
      if (slotC === ConnectionType.ROAD || slotC === ConnectionType.RAIL) {
        // May not be accurate for exits but probably good enough
        numErrors++
      }
    } else if (slotC === ConnectionType.UNFILLED) {
      numOpen++
    } else if (slotC === ConnectionType.EDGE) {
      numEdge++
    } else if (slotC === ConnectionType.ROAD || slotC === ConnectionType.RAIL) {
      numMatches++
    } else {
      numErrors++
    }
  }

  return [
    gs.roundNumber,
    gs.usedTileIndexes.length,
    gs.usedSpecialTileThisRound ? 1 : 0,
    isCenterSquare(p) ? 1 : 0,
    Board.exitSlots.get(p) ? 1 : 0,
    move.includes("_") || move.includes("o") ? 0 : 1,
    numMatches,
    numOpen,
    numEdge,
    numErrors,
  ]
}
