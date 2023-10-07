import type {OpenSlot, Position, TileString} from "../../logic/types"
import getFeatures from "./getFeatures"
import data from "./data.json" assert {type: "json"}

export default function getScore(p: Position, t: TileString, s: OpenSlot) {
  const features = getFeatures(p, t, s)

  const probs = {yes: 0, no: 0}

  for (const chosen of ["yes", "no"] as const) {
    const prior =
      data.totalCounts[chosen] / (data.totalCounts.yes + data.totalCounts.no)
    probs[chosen] = Object.entries(features).reduce(
      (prob, [feature, value]) =>
        value
          ? ((data.featureCounts[chosen] as Record<string, number>)[feature] /
              data.totalCounts[chosen]) *
            prob
          : prob,
      prior,
    )
  }

  return probs.yes / (probs.yes + probs.no)
}
