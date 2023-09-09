import type GameState from "../logic/GameState"
import {getPossibleMoves, pickHighestScoringGameState} from "./aiHelpers"

// Runs: 100, score: 24.8, duration: 68.9ms

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    while (!gs.canEndRound) {
      gs = pickHighestScoringGameState(getPossibleMoves(gs))
    }
    gs = gs.endRound()
  }
  return gs
}
