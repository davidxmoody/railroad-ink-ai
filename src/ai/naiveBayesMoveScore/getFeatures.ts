import {rotations} from "../../logic/helpers"
import {
  ConnectionType,
  type OpenSlot,
  type Position,
  type TileString,
} from "../../logic/types"

export default function getFeatures(
  p: Position,
  t: TileString,
  s: OpenSlot,
): Record<string, boolean> {
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

  return {
    match1: numMatches === 1,
    match2: numMatches === 2,
    match3: numMatches === 3,
    match4: numMatches === 4,
    open1: numOpen === 1,
    open2: numOpen === 2,
    open3: numOpen === 3,
    errors1: numErrors === 1,
    errors2: numErrors === 2,
    errors3: numErrors === 3,
  }
}
