import type {Position} from "../../logic/types"
import untypedData from "./data2.json" assert {type: "json"}

const data: Array<{count: number; availablePositions: number[]}> = untypedData

export default function prioritise(ps: Position[]) {
  return ps.map((p) => {
    const item = data[p.y * 7 + p.x]
    const prior = item.count
    const posterior = ps.reduce(
      (acc, p2) =>
        (acc * item.availablePositions[p2.y * 7 + p2.x]) / item.count,
      1,
    )
    return {weight: prior * posterior, item: p}
  })
}
