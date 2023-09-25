import type {GameRecord} from "./types"
import GameState from "../logic/GameState"
import {rollGameDice} from "../logic/dice"
import calculateScore from "../logic/calculateScore"
import readJsonl from "./readJsonl"

const gameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)

  let gs = new GameState(undefined, gameTiles[0])

  while (!gs.gameEnded) {
    gs = gs.makeMoves(game.moves[gs.roundNumber - 1])
    console.log(JSON.stringify({score: game.score, features: getFeatures(gs)}))
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
}

function getFeatures(gs: GameState) {
  const score = calculateScore(gs.board)

  return [
    score.exits,
    score.road,
    score.rail,
    score.center,
    gs.board.countErrors(),
    gs.roundNumber,
  ]
}
