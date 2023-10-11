import GameState from "../logic/GameState"
import {getMean, getStandardDeviation} from "../logic/helpers"
import {simulate} from "./monteCarlo"

const numSimulations = 1000

for (let numMoves = 1; numMoves <= 64; numMoves *= 2) {
  const results: number[] = []

  const startTime = performance.now()

  for (let i = 1; i <= numSimulations; i++) {
    results.push(simulate(new GameState(), undefined, numMoves).realScore)
  }

  const duration = ((performance.now() - startTime) / numSimulations)
    .toFixed(2)
    .padStart(4, " ")
  const numMovesStr = numMoves.toString().padStart(2, " ")
  const mean = getMean(results).toFixed(2).padStart(5, " ")
  const std = getStandardDeviation(results).toFixed(2).padStart(5, " ")

  console.log(
    `Num moves: ${numMovesStr}, mean: ${mean}, std: ${std}, duration: ${duration}ms`,
  )
}
