import {Board} from "../logic/Board"
import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"

export function* getPossibleMoves(gs: GameState) {
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

export function pickHighestScoringGameState(
  gameStates: Iterable<GameState>,
): GameState {
  let count = 0
  let nextGs: GameState | undefined = undefined
  let highestScore = -Infinity

  for (const candidateNextGs of gameStates) {
    count++
    const score = calculateScore(candidateNextGs.board)
    if (score.total > highestScore) {
      nextGs = candidateNextGs
      highestScore = score.total
    }
  }

  if (!nextGs) throw new Error("Could not calculate")

  console.log({count})

  return nextGs
}
