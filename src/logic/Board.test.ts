import {describe, test, expect} from "vitest"
import {Board} from "./Board"
import type {TileString} from "./types"

describe("tile placement", () => {
  function tryPlacement(
    placements: Array<{y: number; x: number; tile: TileString}>,
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
    tryPlacement([{y: 3, x: 6, tile: "_D_D"}], true)
  })

  test("exit connection invalid track type", () => {
    tryPlacement([{y: 3, x: 6, tile: "_L_L"}], false)
  })

  test("exit connection invalid rotation", () => {
    tryPlacement([{y: 3, x: 6, tile: "D_D_"}], false)
  })

  test("not connected to anything", () => {
    tryPlacement([{y: 3, x: 3, tile: "_D_D"}], false)
  })

  test("space already filled", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: "_D_D"},
        {y: 3, x: 6, tile: "_D_D"},
      ],
      false,
    )
  })

  test("existing tile connection", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: "_DD_"},
        {y: 4, x: 6, tile: "D__D"},
      ],
      true,
    )
  })

  test("existing tile connection invalid track type", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: "_DD_"},
        {y: 4, x: 6, tile: "L__L"},
      ],
      false,
    )
  })

  test("existing tile invalid rotation", () => {
    tryPlacement(
      [
        {y: 3, x: 6, tile: "_DD_"},
        {y: 4, x: 6, tile: "_D_D"},
      ],
      false,
    )
  })

  test("existing tile no connection", () => {
    tryPlacement(
      [
        {y: 5, x: 0, tile: "_L_L"},
        {y: 6, x: 0, tile: "_D_D"},
      ],
      false,
    )
  })

  test("existing tile ignoring exit", () => {
    tryPlacement(
      [
        {y: 5, x: 0, tile: "__DL"},
        {y: 6, x: 0, tile: "DD__"},
        {y: 6, x: 1, tile: "D__D"},
      ],
      true,
    )
  })
})
