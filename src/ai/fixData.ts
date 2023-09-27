import type {GameRecord} from "./types"
import GameState from "./../logic/GameState"
import {rollGameDice} from "./../logic/dice"
import readJsonl from "./readJsonl"
import calculateScore from "../logic/calculateScore"
import exhaustiveSearch from "./exhaustiveSearch"

const originalGameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

const newGameRecordSeeds = readJsonl<GameRecord>(
  "./src/data/trainingFixed.jsonl",
).reduce(
  (acc, ngr) => ({...acc, [ngr.seed]: true}),
  {} as Record<string, boolean>,
)

originalGameRecords.sort((a, b) => {
  const aSeed = parseInt(a.seed.replace("training-", ""), 10)
  const bSeed = parseInt(b.seed.replace("training-", ""), 10)
  return aSeed - bSeed
})

for (const game of originalGameRecords) {
  if (newGameRecordSeeds[game.seed]) {
    continue
  }

  const gameTiles = rollGameDice(game.seed)
  let gs = new GameState(undefined, gameTiles[0])
  while (gs.roundNumber <= 6) {
    gs = gs.makeMoves(game.moves[gs.roundNumber - 1])
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }

  const finalMoves = exhaustiveSearch(gs)
  gs = gs.makeMoves(finalMoves)

  const score = calculateScore(gs.board).total
  if (score < game.score)
    throw new Error(`New score lower than old score ${score}, ${game.score}`)

  const newGame: GameRecord = {
    seed: game.seed,
    score,
    moves: [...game.moves.slice(0, 6), finalMoves],
  }

  console.log(JSON.stringify(newGame))
}
