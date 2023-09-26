import {isSpecial, parseMove} from "../../logic/helpers"

export default function getKey(roundNumber: number, move: string) {
  const {p, tile} = parseMove(move)

  const yDiff = [0, 1, 2, 3, 2, 1, 0][p.y]
  const xDiff = [0, 1, 2, 3, 2, 1, 0][p.x]
  const pKey = [yDiff, xDiff].sort().join("")

  if (isSpecial(tile)) return `${roundNumber}${pKey}S`

  const numConnections =
    (tile[0] === "_" ? 0 : 1) +
    (tile[1] === "_" ? 0 : 1) +
    (tile[2] === "_" ? 0 : 1) +
    (tile[3] === "_" ? 0 : 1)

  return `${roundNumber}${pKey}${numConnections}`
}
