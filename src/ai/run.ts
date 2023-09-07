import GameState from "../logic/GameState"
import {solve} from "./basic"
import calculateScore from "../logic/calculateScore"

function run(solveFn: (gs: GameState) => GameState, numTests = 1000) {
  const scores = Array.from({length: numTests}, (_, seed) => {
    const gs = new GameState(undefined, seed)
    return calculateScore(solveFn(gs).board).total
  })

  const average = scores.reduce((a, b) => a + b, 0) / scores.length
  return {average, scores}
}

console.log(run(solve))
