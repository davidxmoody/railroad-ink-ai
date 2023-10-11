import getFeatures from "./getFeatures"
import data from "./data.json" assert {type: "json"}
import type GameState from "../../logic/GameState"

export default function getScore(gs: GameState, move: string) {
  const features = getFeatures(gs, move)

  const probs = {yes: 0, no: 0}

  for (const chosen of ["yes", "no"] as const) {
    const prior = data[chosen].count / (data.yes.count + data.no.count)
    probs[chosen] = Object.entries(features).reduce(
      (prob, [feature, value]) =>
        value
          ? ((data[chosen].features as Record<string, Record<number, number>>)[
              feature
            ][value] /
              data[chosen].count) *
            prob
          : prob,
      prior,
    )
  }

  return probs.yes / (probs.yes + probs.no)
}
