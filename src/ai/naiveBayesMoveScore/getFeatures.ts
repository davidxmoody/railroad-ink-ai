import type GameState from "../../logic/GameState"
import {parseMove, rotations} from "../../logic/helpers"
import {ConnectionType} from "../../logic/types"

export default function getFeatures(
  gs: GameState,
  move: string,
): Record<string, number> {
  const {p, t} = parseMove(move)
  const s = gs.board.getOpenSlot(p)
  if (!s) throw new Error("Could not get slot for move")

  const numMatches = rotations.filter(
    (r) => t[r] !== ConnectionType.NONE && t[r] === s[r],
  ).length

  const numOpen = rotations.filter(
    (r) => t[r] !== ConnectionType.NONE && s[r] === ConnectionType.UNFILLED,
  ).length

  const numErrors = rotations.filter(
    (r) =>
      (t[r] !== ConnectionType.NONE && s[r] === ConnectionType.NONE) ||
      (t[r] === ConnectionType.NONE &&
        (s[r] === ConnectionType.ROAD || s[r] === ConnectionType.RAIL)),
  ).length

  const dedupedY = p.y <= 3 ? p.y : 6 - p.y
  const dedupedX = p.x <= 3 ? p.x : 6 - p.x
  const squashedCoords = [dedupedY, dedupedX].sort()
  const positionKey = 1 + squashedCoords[0] + 4 * squashedCoords[1]

  return {
    numMatches,
    numOpen,
    numErrors,
    positionKey,
  }
}
