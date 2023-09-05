import {describe, test, expect} from "vitest"
import GameState from "../logic/GameState"
import {solve} from "./basic"

describe("basic AI solver", () => {
  test("it reaches the end of a game", () => {
    const gs = new GameState()
    const solvedGs = solve(gs)
    expect(solvedGs.gameEnded).toBeTruthy()
  })
})
