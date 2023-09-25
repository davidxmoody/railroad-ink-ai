import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"

export function getFeatures(gs: GameState) {
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
