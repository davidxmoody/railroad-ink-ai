import {describe, test, expect} from "vitest"
import getMeaningfulPlacements from "./getMeaningfulPlacements"

describe("meaningful placements", () => {
  describe("no pruning can be done", () => {
    test("no valid placements", () => {
      expect(getMeaningfulPlacements("D_D_", "L...")).toEqual([])
    })

    test("one valid placement", () => {
      expect(getMeaningfulPlacements("D_D_", "D...")).toEqual(["D_D_"])
    })

    test("two valid placements", () => {
      expect(getMeaningfulPlacements("DD__", "D...")).toEqual(["DD__", "D__D"])
    })
  })

  describe("pruning can be done", () => {
    test("corner should go off edge instead of leaving unfixable error", () => {
      expect(getMeaningfulPlacements("DD__", "EE_D")).toEqual(["D__D"])
    })

    test("corner should connect instead of leaving unfixable error", () => {
      expect(getMeaningfulPlacements("DD__", "EEDD")).toEqual(["__DD"])
      expect(getMeaningfulPlacements("DD__", "__DD")).toEqual(["__DD"])
    })

    test("junction should connect instead of leaving unfixable error", () => {
      expect(getMeaningfulPlacements("DDD_", "EDDD")).toEqual(["_DDD"])
      expect(getMeaningfulPlacements("DDD_", "_DDD")).toEqual(["_DDD"])
    })

    test("straight should connect two edges instead of just one", () => {
      expect(getMeaningfulPlacements("D_D_", "DDD_")).toEqual(["D_D_"])
      expect(getMeaningfulPlacements("D_D_", "DDDE")).toEqual(["D_D_"])
    })
  })
})
