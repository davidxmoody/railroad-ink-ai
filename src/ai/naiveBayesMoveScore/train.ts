import {writeFileSync} from "node:fs"
import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"
import type {GameRecord} from "../../logic/types"
import {getPossibleMoves} from "../monteCarlo"
import readJsonl from "../readJsonl"
import getFeatures from "./getFeatures"

const gameRecords: GameRecord[] = readJsonl("./src/data/training.jsonl")

const totalCounts = {
  yes: 0,
  no: 0,
}

const featureCounts = {
  yes: {} as Record<string, Record<number, number>>,
  no: {} as Record<string, Record<number, number>>,
}

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)
  let gs = new GameState(undefined, gameTiles[0])

  for (const roundMoves of game.moves) {
    for (const actualMove of roundMoves) {
      for (const possibleMove of getPossibleMoves(gs)) {
        const features = getFeatures(gs, possibleMove)
        const chosen = actualMove === possibleMove ? "yes" : "no"

        totalCounts[chosen]++

        for (const [name, value] of Object.entries(features)) {
          featureCounts[chosen][name] = featureCounts[chosen][name] ?? {}
          featureCounts[chosen][name][value] =
            (featureCounts[chosen][name][value] ?? 0) + 1
        }
      }

      gs = gs.makeMove(actualMove)
    }
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
}

const data: Record<
  string,
  {count: number; features: Record<string, Record<number, number>>}
> = {}

for (const chosen of ["yes", "no"] as const) {
  data[chosen] = {
    count: totalCounts[chosen],
    features: featureCounts[chosen],
  }
}

writeFileSync(
  "./src/ai/naiveBayesMoveScore/data.json",
  JSON.stringify(data, null, 2),
)
