import untypedData from "./data.json" assert {type: "json"}
import getKey from "./getKey"

const data: Record<string, number> = untypedData

export default function prioritiseMoves(roundNumber: number, moves: string[]) {
  return moves.map((move) => ({
    weight: (data[getKey(roundNumber, move)] ?? 0) + 100,
    item: move,
  }))
}
