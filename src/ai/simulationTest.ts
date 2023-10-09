import GameState from "../logic/GameState"
import {getMean, getStandardDeviation} from "../logic/helpers"
import {getRandomMove, simulate} from "./monteCarlo"

const results: number[] = []

for (let i = 1; i <= 10000; i++) {
  const emptyGs = new GameState()
  const {realScore} = simulate(emptyGs, getRandomMove(emptyGs, false)!)
  results.push(realScore)

  if (i % 1000 === 0) {
    const mean = getMean(results).toFixed(2)
    const std = getStandardDeviation(results).toFixed(2)
    console.log(`Mean: ${mean}, std: ${std}`)
  }
}
