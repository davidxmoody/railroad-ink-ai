import getFeatures from "./getFeatures"
import type GameState from "../../logic/GameState"

import {createRequire} from "module"
const require = createRequire(import.meta.url)

const data = require("./data.json")

export default function getScore(gs: GameState, move: string) {
  const features = getFeatures(gs, move)

  const probs = {yes: 0, no: 0}

  const rData = data[gs.roundNumber - 1]

  for (const chosen of ["yes", "no"] as const) {
    const prior = rData[chosen].count / (rData.yes.count + rData.no.count)
    const featureProbs = Object.entries(features).map(([feature, value]) => {
      if (value === 0) return 1
      const featureCount = (
        rData[chosen].features as Record<string, Record<number, number>>
      )[feature][value]
      return featureCount / rData[chosen].count
    })
    probs[chosen] = featureProbs.reduce((a, b) => a * b, prior)
  }

  return probs.yes / (probs.yes + probs.no)
}
