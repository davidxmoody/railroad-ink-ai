import {readFileSync} from "node:fs"
import type {GameRecord} from "./types"
import GameState from "../logic/GameState"
import {rollGameDice} from "../logic/dice"
import calculateScore from "../logic/calculateScore"

const gameRecords: GameRecord[] = readFileSync(
  "./src/data/training.jsonl",
  "utf-8",
)
  .split("\n")
  .filter((x) => x)
  .map((x) => JSON.parse(x))

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
