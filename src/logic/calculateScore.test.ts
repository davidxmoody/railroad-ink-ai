import {describe, test, expect} from "vitest"
import {Board} from "./Board"
import calculateScore from "./calculateScore"
import type {Tile} from "./types"

function generateBoard(placements: Array<{y: number; x: number; tile: Tile}>) {
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
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 6, tile: {1: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 0,
      })
    })

    test("two exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {0: "D", 3: "D"}},
        {y: 2, x: 0, tile: {0: "L", 2: "D"}},
        {y: 1, x: 0, tile: {2: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 4,
      })
    })

    test("four exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {0: "D", 3: "D"}},
        {y: 2, x: 0, tile: {0: "L", 2: "D"}},
        {y: 1, x: 0, tile: {0: "L", 2: "L", 3: "L"}},
        {y: 0, x: 0, tile: {1: "L", 2: "L"}},
        {y: 0, x: 1, tile: {0: "D", 1: "L", 2: "L", 3: "L"}},
        {y: 0, x: 2, tile: {1: "L", 3: "L"}},
        {y: 0, x: 3, tile: {0: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 12,
      })
    })

    test("two groups of two exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 1, tile: {1: "D", 3: "D"}},
        {y: 3, x: 2, tile: {1: "D", 3: "D"}},
        {y: 3, x: 3, tile: {1: "D", 3: "D"}},
        {y: 3, x: 4, tile: {1: "D", 3: "D"}},
        {y: 3, x: 5, tile: {1: "D", 3: "D"}},
        {y: 3, x: 6, tile: {1: "D", 3: "D"}},
        {y: 1, x: 0, tile: {1: "L", 3: "L"}},
        {y: 1, x: 1, tile: {1: "L", 3: "L"}},
        {y: 1, x: 2, tile: {1: "L", 3: "L"}},
        {y: 0, x: 3, tile: {0: "L", 2: "L"}},
        {y: 1, x: 3, tile: {0: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 8,
      })
    })

    test("two exits connected with overpass not connected", () => {
      const board = generateBoard([
        {y: 0, x: 1, tile: {0: "D", 2: "D"}},
        {y: 1, x: 1, tile: {0: "D", 2: "D"}},
        {y: 2, x: 1, tile: {0: "D", 2: "D"}},
        {y: 3, x: 1, tile: {0: "D", 2: "D"}},
        {y: 4, x: 1, tile: {0: "D", 2: "D"}},
        {y: 6, x: 1, tile: {0: "D", 2: "D"}},
        {y: 5, x: 0, tile: {1: "L", 3: "L"}},
        {y: 5, x: 1, tile: {0: "D", 1: "L", 2: "D", 3: "L", overpass: true}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 4,
      })
    })

    test("two groups of two exits connected with overpass", () => {
      const board = generateBoard([
        {y: 0, x: 1, tile: {0: "D", 2: "D"}},
        {y: 1, x: 1, tile: {0: "D", 2: "D"}},
        {y: 2, x: 1, tile: {0: "D", 2: "D"}},
        {y: 3, x: 1, tile: {0: "D", 2: "D"}},
        {y: 4, x: 1, tile: {0: "D", 2: "D"}},
        {y: 6, x: 1, tile: {0: "D", 2: "D"}},
        {y: 5, x: 0, tile: {1: "L", 3: "L"}},
        {y: 5, x: 1, tile: {0: "D", 1: "L", 2: "D", 3: "L", overpass: true}},
        {y: 5, x: 2, tile: {1: "L", 3: "L"}},
        {y: 5, x: 3, tile: {1: "L", 3: "L"}},
        {y: 5, x: 4, tile: {1: "L", 3: "L"}},
        {y: 5, x: 5, tile: {1: "L", 3: "L"}},
        {y: 5, x: 6, tile: {1: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 8,
      })
    })

    test("all twelve exits connected", () => {
      const board = generateBoard([
        {y: 3, x: 6, tile: {0: "L", 1: "D", 2: "L", 3: "L"}},
        {y: 3, x: 0, tile: {0: "L", 1: "L", 2: "L", 3: "D"}},
        {y: 4, x: 0, tile: {0: "L", 2: "L"}},
        {y: 2, x: 0, tile: {0: "L", 2: "L"}},
        {y: 2, x: 6, tile: {0: "L", 2: "L"}},
        {y: 4, x: 6, tile: {0: "L", 2: "L"}},
        {y: 1, x: 6, tile: {0: "L", 1: "L", 2: "L"}},
        {y: 5, x: 6, tile: {0: "L", 1: "L", 2: "L"}},
        {y: 5, x: 0, tile: {0: "L", 2: "L", 3: "L"}},
        {y: 1, x: 0, tile: {0: "L", 2: "L", 3: "L"}},
        {y: 6, x: 6, tile: {0: "L", 3: "L"}},
        {y: 6, x: 0, tile: {0: "L", 1: "L"}},
        {y: 0, x: 0, tile: {1: "L", 2: "L"}},
        {y: 0, x: 6, tile: {2: "L", 3: "L"}},
        {y: 0, x: 5, tile: {0: "D", 1: "L", 2: "L", 3: "L"}},
        {y: 0, x: 1, tile: {0: "D", 1: "L", 2: "L", 3: "L"}},
        {y: 6, x: 1, tile: {0: "L", 1: "L", 2: "D", 3: "L"}},
        {y: 6, x: 5, tile: {0: "L", 1: "L", 2: "D", 3: "L"}},
        {y: 6, x: 2, tile: {1: "L", 3: "L"}},
        {y: 6, x: 4, tile: {1: "L", 3: "L"}},
        {y: 0, x: 2, tile: {1: "L", 3: "L"}},
        {y: 0, x: 4, tile: {1: "L", 3: "L"}},
        {y: 0, x: 3, tile: {0: "L", 1: "L", 3: "L"}},
        {y: 6, x: 3, tile: {1: "L", 2: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 45,
      })
    })

    test("three groups of exits connected", () => {
      const board = generateBoard([
        {y: 5, x: 0, tile: {2: "D", 3: "L"}},
        {y: 6, x: 0, tile: {0: "D", 1: "D"}},
        {y: 6, x: 1, tile: {0: "D", 3: "D"}},
        {y: 5, x: 1, tile: {1: "D", 2: "D"}},
        {y: 5, x: 2, tile: {1: "D", 3: "D"}},
        {y: 5, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
        {y: 5, x: 4, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 6, x: 4, tile: {0: "D", 1: "D", 2: "D"}},
        {y: 6, x: 5, tile: {0: "D", 2: "D", 3: "D"}},
        {y: 5, x: 5, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 6, x: 3, tile: {0: "L", 2: "L"}},
        {y: 4, x: 3, tile: {0: "L", 2: "L"}},
        {y: 3, x: 3, tile: {0: "L", 2: "L"}},
        {y: 2, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
        {y: 0, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
        {y: 1, x: 3, tile: {0: "L", 2: "L"}},
        {y: 5, x: 6, tile: {1: "L", 3: "D"}},
        {y: 4, x: 4, tile: {1: "D", 2: "D"}},
        {y: 4, x: 5, tile: {2: "D", 3: "D"}},
        {y: 3, x: 0, tile: {2: "D", 3: "D"}},
        {y: 4, x: 0, tile: {0: "D", 1: "D"}},
        {y: 4, x: 1, tile: {2: "D", 3: "D"}},
        {y: 0, x: 4, tile: {0: "D", 1: "D", 3: "D"}},
        {y: 0, x: 5, tile: {0: "D", 1: "D", 3: "D"}},
        {y: 0, x: 6, tile: {0: "D", 1: "D", 3: "D"}},
        {y: 0, x: 2, tile: {0: "D", 1: "D", 3: "D"}},
        {y: 0, x: 1, tile: {0: "D", 1: "D", 3: "D"}},
        {y: 0, x: 0, tile: {0: "D", 1: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        exits: 16,
      })
    })
  })

  describe("center square", () => {
    test("one filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 1, tile: {1: "D", 3: "D"}},
        {y: 3, x: 2, tile: {1: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 1,
      })
    })

    test("four filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 1, tile: {1: "D", 3: "D"}},
        {y: 3, x: 2, tile: {1: "D", 3: "D"}},
        {y: 3, x: 3, tile: {2: "D", 3: "D"}},
        {y: 4, x: 3, tile: {0: "D", 1: "D"}},
        {y: 4, x: 4, tile: {2: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 4,
      })
    })

    test("nine filled", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 1, tile: {1: "D", 3: "D"}},
        {y: 3, x: 2, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 2, x: 2, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 3, x: 3, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 4, x: 2, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 4, x: 3, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 4, x: 4, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 3, x: 4, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 2, x: 4, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
        {y: 2, x: 3, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        center: 9,
      })
    })
  })

  describe("errors", () => {
    test("one error", () => {
      const board = generateBoard([{y: 3, x: 0, tile: {1: "D", 3: "D"}}])

      expect(calculateScore(board)).toMatchObject({
        errors: -1,
      })
    })

    test("many errors", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 6, tile: {1: "D", 2: "D"}},
        {y: 6, x: 5, tile: {1: "D", 2: "D"}},
        {y: 6, x: 6, tile: {1: "D", 3: "D"}},
        {y: 6, x: 3, tile: {1: "L", 2: "L"}},
        {y: 6, x: 4, tile: {0: "D", 1: "L", 2: "D", 3: "L", overpass: true}},
        {y: 3, x: 1, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
        {y: 4, x: 1, tile: {0: "L", 1: "L", 2: "L", 3: "L"}},
        {y: 4, x: 0, tile: {1: "L", 3: "L"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        errors: -7,
      })
    })
  })

  describe("longest road/rail", () => {
    test("one segment long", () => {
      const board = generateBoard([{y: 3, x: 0, tile: {1: "D", 3: "D"}}])

      expect(calculateScore(board)).toMatchObject({
        road: 1,
        rail: 0,
      })
    })

    test("several segments long", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 3: "D"}},
        {y: 3, x: 1, tile: {2: "D", 3: "D"}},
        {y: 4, x: 1, tile: {0: "D", 1: "D"}},
        {y: 4, x: 2, tile: {0: "D", 3: "D"}},
        {y: 3, x: 2, tile: {1: "D", 2: "D"}},
        {y: 3, x: 3, tile: {1: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 6,
        rail: 0,
      })
    })

    test("simple loop", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {1: "D", 2: "D", 3: "D"}},
        {y: 3, x: 1, tile: {2: "D", 3: "D"}},
        {y: 4, x: 1, tile: {0: "D", 3: "D"}},
        {y: 4, x: 0, tile: {0: "D", 1: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 5,
        rail: 0,
      })
    })

    test("tricky loop with rail", () => {
      const board = generateBoard([
        {y: 3, x: 0, tile: {0: "D", 1: "D", 2: "L", 3: "D"}},
        {y: 4, x: 0, tile: {0: "L", 2: "L"}},
        {y: 5, x: 0, tile: {0: "L", 2: "L"}},
        {y: 6, x: 0, tile: {0: "L", 1: "L"}},
        {y: 3, x: 1, tile: {0: "D", 1: "D", 2: "L", 3: "D"}},
        {y: 4, x: 1, tile: {0: "L", 2: "L"}},
        {y: 5, x: 1, tile: {0: "L", 2: "L"}},
        {y: 6, x: 1, tile: {0: "L", 3: "L"}},
        {y: 3, x: 2, tile: {1: "L", 3: "D"}},
        {y: 2, x: 0, tile: {1: "D", 2: "D"}},
        {y: 2, x: 1, tile: {2: "D", 3: "D"}},
      ])

      expect(calculateScore(board)).toMatchObject({
        road: 6,
        rail: 8,
      })
    })
  })
})
