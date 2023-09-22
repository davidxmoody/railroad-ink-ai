import {parentPort, workerData} from "node:worker_threads"
import GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"
import {solveRound} from "./monteCarlo"
import type {GameRecord} from "./types"

const seeds = workerData as string[]

for (const seed of seeds) {
  const gameTiles = rollGameDice(seed)

  const moves: string[][] = []
  let gs = new GameState(undefined, gameTiles[0])

  while (!gs.gameEnded) {
    const roundMoves = solveRound(gs)
    moves.push(roundMoves)
    gs = gs.makeMoves(roundMoves).endRound(gameTiles[gs.roundNumber])
  }

  const score = calculateScore(gs.board).total

  const record: GameRecord = {seed, score, moves}

  parentPort?.postMessage(record)
}
