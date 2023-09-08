import {Board} from "../logic/Board"
import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"

// Runs: 100, score: 24.8, duration: 90.5ms

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    while (!gs.canEndRound) {
      gs = makeNextMove(gs)
    }
    gs = gs.endRound()
  }
  return gs
}

function* getPossibleMoves(gs: GameState) {
  for (const {special, index, tile} of gs.availableTiles) {
    for (let y = 0; y < Board.size; y++) {
      for (let x = 0; x < Board.size; x++) {
        const validTransformedTiles = gs.board.getAllValidTransformedTiles(
          {y, x},
          tile,
        )

        for (const tTile of validTransformedTiles) {
          yield gs.placeTile(index, special, {y, x}, tTile)
        }
      }
    }
  }
}

function makeNextMove(gs: GameState): GameState {
  let nextGs: GameState | undefined = undefined
  let highestScore = -Infinity

  for (const candidateNextGs of getPossibleMoves(gs)) {
    const score = calculateScore(candidateNextGs.board)
    if (score.total > highestScore) {
      nextGs = candidateNextGs
      highestScore = score.total
    }
  }

  if (!nextGs) throw new Error("Could not calculate")

  return nextGs
}
