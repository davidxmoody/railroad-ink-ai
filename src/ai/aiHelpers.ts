import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"

export function* getPossibleMoves(gs: GameState) {
  for (const {tile} of gs.availableTiles) {
    for (const p of gs.board.openPositions) {
      const validTransformedTiles = gs.board.getAllValidTransformedTiles(
        p,
        tile,
      )

      for (const tTile of validTransformedTiles) {
        yield gs.placeTile(p, tTile)
      }
    }
  }
}

export function pickHighestScoringGameState(
  gameStates: Iterable<GameState>,
): GameState {
  let nextGs: GameState | undefined = undefined
  let highestScore = -Infinity

  for (const candidateNextGs of gameStates) {
    const score = calculateScore(candidateNextGs.board)
    if (score.total > highestScore) {
      nextGs = candidateNextGs
      highestScore = score.total
    }
  }

  if (!nextGs) throw new Error("Could not calculate")

  return nextGs
}
