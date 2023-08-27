import {describe, test, expect} from "vitest"
import {Board} from "./Board"
import calculateScore from "./calculateScore"
import type {TileString} from "./types"

function generateBoard(
  placements: Array<{y: number; x: number; tile: TileString}>,
) {
  let board = new Board()
  for (const {y, x, tile} of placements) {
    board = board.set({y, x}, tile)
  }
  return board
}

describe("scoring", () => {
  test("empty board", () => {
    const board = generateBoard([])

    expect(calculateScore(board)).toEqual({
      exits: 0,
      road: 0,
      rail: 0,
      center: 0,
      errors: 0,
    })
  })

  describe("exits", () => {
    test("no exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 6, tile: "_D_D"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 0,
      })
    })

    test("two exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "D__D"},
        {y: 2, x: 0, tile: "L_D_"},
        {y: 1, x: 0, tile: "__LL"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 4,
      })
    })

    test("four exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "D__D"},
        {y: 2, x: 0, tile: "L_D_"},
        {y: 1, x: 0, tile: "L_LL"},
        {y: 0, x: 0, tile: "_LL_"},
        {y: 0, x: 1, tile: "DLLL"},
        {y: 0, x: 2, tile: "_L_L"},
        {y: 0, x: 3, tile: "L__L"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 12,
      })
    })

    test("two groups of two exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 1, tile: "_D_D"},
        {y: 3, x: 2, tile: "_D_D"},
        {y: 3, x: 3, tile: "_D_D"},
        {y: 3, x: 4, tile: "_D_D"},
        {y: 3, x: 5, tile: "_D_D"},
        {y: 3, x: 6, tile: "_D_D"},
        {y: 1, x: 0, tile: "_L_L"},
        {y: 1, x: 1, tile: "_L_L"},
        {y: 1, x: 2, tile: "_L_L"},
        {y: 0, x: 3, tile: "L_L_"},
        {y: 1, x: 3, tile: "L__L"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 8,
      })
    })

    test("two exits connected with overpass not connected", () => {
      const board = generateBoard([
        {y: 0, x: 1, tile: "D_D_"},
        {y: 1, x: 1, tile: "D_D_"},
        {y: 2, x: 1, tile: "D_D_"},
        {y: 3, x: 1, tile: "D_D_"},
        {y: 4, x: 1, tile: "D_D_"},
        {y: 6, x: 1, tile: "D_D_"},
        {y: 5, x: 0, tile: "_L_L"},
        {y: 5, x: 1, tile: "DLDLo"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 4,
      })
    })

    test("two groups of two exits connected with overpass", () => {
      const board = generateBoard([
        {y: 0, x: 1, tile: "D_D_"},
        {y: 1, x: 1, tile: "D_D_"},
        {y: 2, x: 1, tile: "D_D_"},
        {y: 3, x: 1, tile: "D_D_"},
        {y: 4, x: 1, tile: "D_D_"},
        {y: 6, x: 1, tile: "D_D_"},
        {y: 5, x: 0, tile: "_L_L"},
        {y: 5, x: 1, tile: "DLDLo"},
        {y: 5, x: 2, tile: "_L_L"},
        {y: 5, x: 3, tile: "_L_L"},
        {y: 5, x: 4, tile: "_L_L"},
        {y: 5, x: 5, tile: "_L_L"},
        {y: 5, x: 6, tile: "_L_L"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 8,
      })
    })

    test("all twelve exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 6, tile: "LDLL"},
        {y: 3, x: 0, tile: "LLLD"},
        {y: 4, x: 0, tile: "L_L_"},
        {y: 2, x: 0, tile: "L_L_"},
        {y: 2, x: 6, tile: "L_L_"},
        {y: 4, x: 6, tile: "L_L_"},
        {y: 1, x: 6, tile: "LLL_"},
        {y: 5, x: 6, tile: "LLL_"},
        {y: 5, x: 0, tile: "L_LL"},
        {y: 1, x: 0, tile: "L_LL"},
        {y: 6, x: 6, tile: "L__L"},
        {y: 6, x: 0, tile: "LL__"},
        {y: 0, x: 0, tile: "_LL_"},
        {y: 0, x: 6, tile: "__LL"},
        {y: 0, x: 5, tile: "DLLL"},
        {y: 0, x: 1, tile: "DLLL"},
        {y: 6, x: 1, tile: "LLDL"},
        {y: 6, x: 5, tile: "LLDL"},
        {y: 6, x: 2, tile: "_L_L"},
        {y: 6, x: 4, tile: "_L_L"},
        {y: 0, x: 2, tile: "_L_L"},
        {y: 0, x: 4, tile: "_L_L"},
        {y: 0, x: 3, tile: "LL_L"},
        {y: 6, x: 3, tile: "_LLL"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 45,
      })
    })

    test("three groups of exits connected", () => {
      const board = generateBoard([
        {y: 5, x: 0, tile: "__DL"},
        {y: 6, x: 0, tile: "DD__"},
        {y: 6, x: 1, tile: "D__D"},
        {y: 5, x: 1, tile: "_DD_"},
        {y: 5, x: 2, tile: "_D_D"},
        {y: 5, x: 3, tile: "LDLDo"},
        {y: 5, x: 4, tile: "DDDD"},
        {y: 6, x: 4, tile: "DDD_"},
        {y: 6, x: 5, tile: "D_DD"},
        {y: 5, x: 5, tile: "DDDD"},
        {y: 6, x: 3, tile: "L_L_"},
        {y: 4, x: 3, tile: "L_L_"},
        {y: 3, x: 3, tile: "L_L_"},
        {y: 2, x: 3, tile: "LDLDo"},
        {y: 0, x: 3, tile: "LDLDo"},
        {y: 1, x: 3, tile: "L_L_"},
        {y: 5, x: 6, tile: "_L_D"},
        {y: 4, x: 4, tile: "_DD_"},
        {y: 4, x: 5, tile: "__DD"},
        {y: 3, x: 0, tile: "__DD"},
        {y: 4, x: 0, tile: "DD__"},
        {y: 4, x: 1, tile: "__DD"},
        {y: 0, x: 4, tile: "DD_D"},
        {y: 0, x: 5, tile: "DD_D"},
        {y: 0, x: 6, tile: "DD_D"},
        {y: 0, x: 2, tile: "DD_D"},
        {y: 0, x: 1, tile: "DD_D"},
        {y: 0, x: 0, tile: "DD_D"},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 16,
      })
    })
  })

  describe("center square", () => {
    test("one filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 1, tile: "_D_D"},
        {y: 3, x: 2, tile: "_D_D"},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 1,
      })
    })

    test("four filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 1, tile: "_D_D"},
        {y: 3, x: 2, tile: "_D_D"},
        {y: 3, x: 3, tile: "__DD"},
        {y: 4, x: 3, tile: "DD__"},
        {y: 4, x: 4, tile: "__DD"},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 4,
      })
    })

    test("nine filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 1, tile: "_D_D"},
        {y: 3, x: 2, tile: "DDDD"},
        {y: 2, x: 2, tile: "DDDD"},
        {y: 3, x: 3, tile: "DDDD"},
        {y: 4, x: 2, tile: "DDDD"},
        {y: 4, x: 3, tile: "DDDD"},
        {y: 4, x: 4, tile: "DDDD"},
        {y: 3, x: 4, tile: "DDDD"},
        {y: 2, x: 4, tile: "DDDD"},
        {y: 2, x: 3, tile: "DDDD"},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 9,
      })
    })
  })

  describe("errors", () => {
    test("one error", () => {
      const board = generateBoard([{y: 3, x: 0, tile: "_D_D"}])

      expect(calculateScore(board)).toMatchObject({
        errors: -1,
      })
    })

    test("many errors", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 6, tile: "_DD_"},
        {y: 6, x: 5, tile: "_DD_"},
        {y: 6, x: 6, tile: "_D_D"},
        {y: 6, x: 3, tile: "_LL_"},
        {y: 6, x: 4, tile: "DLDLo"},
        {y: 3, x: 1, tile: "LDLDo"},
        {y: 4, x: 1, tile: "LLLL"},
        {y: 4, x: 0, tile: "_L_L"},
      ])

      expect(calculateScore(board)).toMatchObject({
        errors: -7,
      })
    })
  })

  describe("longest road/rail", () => {
    test("one segment long", () => {
      const board = generateBoard([{y: 3, x: 0, tile: "_D_D"}])

      expect(calculateScore(board)).toMatchObject({
        road: 1,
        rail: 0,
      })
    })

    test("several segments long", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_D_D"},
        {y: 3, x: 1, tile: "__DD"},
        {y: 4, x: 1, tile: "DD__"},
        {y: 4, x: 2, tile: "D__D"},
        {y: 3, x: 2, tile: "_DD_"},
        {y: 3, x: 3, tile: "_D_D"},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 6,
        rail: 0,
      })
    })

    test("simple loop", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "_DDD"},
        {y: 3, x: 1, tile: "__DD"},
        {y: 4, x: 1, tile: "D__D"},
        {y: 4, x: 0, tile: "DD__"},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 5,
        rail: 0,
      })
    })

    test("tricky loop with rail", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: "DDLD"},
        {y: 4, x: 0, tile: "L_L_"},
        {y: 5, x: 0, tile: "L_L_"},
        {y: 6, x: 0, tile: "LL__"},
        {y: 3, x: 1, tile: "DDLD"},
        {y: 4, x: 1, tile: "L_L_"},
        {y: 5, x: 1, tile: "L_L_"},
        {y: 6, x: 1, tile: "L__L"},
        {y: 3, x: 2, tile: "_L_D"},
        {y: 2, x: 0, tile: "_DD_"},
        {y: 2, x: 1, tile: "__DD"},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 6,
        rail: 8,
      })
    })
  })
})
