import {describe, test, expect} from "vitest"
import {Board} from "./board"
import type {Tile} from "./dice"

describe("tile placement", () => {
  function tryPlacement(
    placements: Array<{y: number; x: number; tile: Tile}>,
    finalExpectation: boolean,
  ) {
    let board = new Board()

    for (const {y, x, tile} of placements.slice(0, placements.length - 1)) {
      board = board.set({y, x}, tile)
    }

    const {y, x, tile} = placements[placements.length - 1]
    const finalIsValid = board.isValid({y, x}, tile)

    expect(finalIsValid).toEqual(finalExpectation)
  }

  test("exit connection", () => {
    tryPlacement([{y: 3, x: 6, tile: {1: "d", 3: "d"}}], true)
  })

  test("exit connection invalid track type", () => {
    tryPlacement([{y: 3, x: 6, tile: {1: "l", 3: "l"}}], false)
  })

  test("exit connection invalid rotation", () => {
    tryPlacement([{y: 3, x: 6, tile: {0: "d", 2: "d"}}], false)
  })

  test("not connected to anything", () => {
    tryPlacement([{y: 3, x: 3, tile: {1: "d", 3: "d"}}], false)
  })

  test("space already filled", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: {1: "d", 3: "d"}},
        {y: 3, x: 6, tile: {1: "d", 3: "d"}},
      ],
      false,
    )
  })

  test("existing tile connection", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: {1: "d", 2: "d"}},
        {y: 4, x: 6, tile: {0: "d", 3: "d"}},
      ],
      true,
    )
  })

  test("existing tile connection invalid track type", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: {1: "d", 2: "d"}},
        {y: 4, x: 6, tile: {0: "l", 3: "l"}},
      ],
      false,
    )
  })

  test("existing tile invalid rotation", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: {1: "d", 2: "d"}},
        {y: 4, x: 6, tile: {1: "d", 3: "d"}},
      ],
      false,
    )
  })

  test("existing tile no connection", () => {
    tryPlacement(
      [
        {y: 5, x: 0, tile: {1: "l", 3: "l"}},
        {y: 6, x: 0, tile: {1: "d", 3: "d"}},
      ],
      false,
    )
  })

  test("existing tile ignoring exit", () => {
    tryPlacement(
      [
        {y: 5, x: 0, tile: {2: "d", 3: "l"}},
        {y: 6, x: 0, tile: {0: "d", 1: "d"}},
        {y: 6, x: 1, tile: {0: "d", 3: "d"}},
      ],
      true,
    )
  })
})
