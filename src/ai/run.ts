import GameState from "../logic/GameState"
import {solveRound} from "./monteCarlo"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"

function runOne(solveRoundFn: (gs: GameState) => GameState, seed: number) {
  const gameTiles = rollGameDice(seed)
  let gs = new GameState({...new GameState(), roundTiles: gameTiles[0]})
  const startTime = performance.now()
  while (!gs.gameEnded) {
    gs = solveRoundFn(gs)
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
  const score = calculateScore(gs.board).total
  const duration = performance.now() - startTime
  return {score, duration}
}

function runMany(solveRoundFn: (gs: GameState) => GameState, numTests: number) {
  const results: Array<ReturnType<typeof runOne>> = []
  for (let seed = 0; seed < numTests; seed++) {
    results.push(runOne(solveRoundFn, seed))

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

runMany(solveRound, 100)
