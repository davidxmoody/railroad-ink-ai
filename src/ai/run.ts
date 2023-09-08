import GameState from "../logic/GameState"
import {solve} from "./optimiseNextTileScore"
import calculateScore from "../logic/calculateScore"

function runOne(solveFn: (gs: GameState) => GameState, seed: number) {
  const gs = new GameState(undefined, seed)
  const startTime = performance.now()
  const score = calculateScore(solveFn(gs).board).total
  const duration = performance.now() - startTime
  return {score, duration}
}

function runMany(solveFn: (gs: GameState) => GameState, numTests = 1000) {
  const results: Array<ReturnType<typeof runOne>> = []
  for (let seed = 0; seed < numTests; seed++) {
    results.push(runOne(solveFn, seed))

    const avgScore = (
      results.reduce((acc, {score}) => acc + score, 0) / results.length
    ).toFixed(1)

    const avgDuration = (
      results.reduce((acc, {duration}) => acc + duration, 0) / results.length
    ).toFixed(1)

    process.stdout.write(
      `\rRuns: ${results.length}, score: ${avgScore}, duration: ${avgDuration}ms    `,
    )
  }
  console.log("")
}

runMany(solve)
