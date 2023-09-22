import GameState from "../logic/GameState"
import {solveRound} from "./monteCarlo"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"
import {getMean, getStandardDeviation} from "../logic/helpers"

function runOne(solveRoundFn: (gs: GameState) => GameState, seed: number) {
  const gameTiles = rollGameDice(seed)
  let gs = new GameState({...new GameState(), roundTiles: gameTiles[0]})
  const startTime = performance.now()
  while (!gs.gameEnded) {
    gs = solveRoundFn(gs)
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
  const score = calculateScore(gs.board).total
  const duration = (performance.now() - startTime) / 1000
  return {score, duration}
}

function runMany(solveRoundFn: (gs: GameState) => GameState, numTests: number) {
  const results: Array<ReturnType<typeof runOne>> = []
  for (let i = 0; i < numTests; i++) {
    const seed = Math.floor(i / 8)
    const result = runOne(solveRoundFn, seed)
    results.push(result)

    const scores = results.map((r) => r.score)
    const avgScore = getMean(scores).toFixed(1)
    const stdScore = getStandardDeviation(scores).toFixed(1)

    const durations = results.map((r) => r.duration)
    const avgDuration = getMean(durations).toFixed(1)

    console.log(
      `Last: ${result.score}, seed: ${seed}, avg: ${avgScore}, std: ${stdScore}, avg time: ${avgDuration}s`,
    )
  }
}

runMany(solveRound, 16 * 8)
