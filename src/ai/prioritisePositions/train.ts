import readJsonl from "../readJsonl"
import type {GameRecord} from "../types"
import {parseMove} from "../../logic/helpers"
import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"

const gameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

const counts = Array.from({length: 7 * 7}, () => ({
  count: 0,
  availablePositions: Array.from({length: 7 * 7}, () => 0),
}))

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)

  let gs = new GameState(undefined, gameTiles[0])

  for (const roundMoves of game.moves) {
    for (const move of roundMoves) {
      const {p} = parseMove(move)
      counts[p.y * 7 + p.x].count++
      for (const p2 of gs.board.openPositions) {
        counts[p.y * 7 + p.x].availablePositions[p2.y * 7 + p2.x]++
      }
      gs = gs.makeMoves([move])
    }
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }

  // for (const roundMoves of game.moves) {
  //   for (const move of roundMoves) {
  //     const {p} = parseMove(move)
  //     counts[p.y][p.x]++
  //   }
  // }
}

console.log(JSON.stringify(counts))
