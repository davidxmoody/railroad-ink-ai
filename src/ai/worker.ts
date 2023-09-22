import {parentPort, workerData} from "node:worker_threads"
import GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"
import {solveRound} from "./monteCarlo"

const seeds = workerData as string[]

for (const seed of seeds) {
  const gameTiles = rollGameDice(seed)

  let gs = new GameState({...new GameState(), roundTiles: gameTiles[0]})

  const startTime = performance.now()

  while (!gs.gameEnded) {
    gs = solveRound(gs)
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }

  const score = calculateScore(gs.board).total

  const duration = (performance.now() - startTime) / 1000

  parentPort?.postMessage({score, duration, seed})
}
