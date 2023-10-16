import {writeFileSync} from "node:fs"
import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"
import type {GameRecord} from "../../logic/types"
import {getPossibleMoves} from "../monteCarlo"
import readJsonl from "../readJsonl"
import getFeatures from "./getFeatures"

const gameRecords: GameRecord[] = readJsonl("./src/data/training.jsonl")

type Chosen = "yes" | "no"

const observations: Array<{
  roundNumber: number
  chosen: Chosen
  features: Record<string, number>
}> = []

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)
  let gs = new GameState(undefined, gameTiles[0])

  for (const roundMoves of game.moves) {
    for (const actualMove of roundMoves) {
      for (const possibleMove of getPossibleMoves(gs)) {
        observations.push({
          roundNumber: gs.roundNumber,
          chosen: actualMove === possibleMove ? "yes" : "no",
          features: getFeatures(gs, possibleMove),
        })
      }
      gs = gs.makeMove(actualMove)
    }
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
}

const data: Record<
  number,
  Record<
    Chosen,
    {count: number; features: Record<string, Record<number, number>>}
  >
> = Array.from({length: 7}, () => ({
  yes: {count: 0, features: {}},
  no: {count: 0, features: {}},
}))

for (const {roundNumber, chosen, features} of observations) {
  const item = data[roundNumber - 1][chosen]
  item.count++

  for (const [feature, value] of Object.entries(features)) {
    item.features[feature] = item.features[feature] ?? {}
    item.features[feature][value] = (item.features[feature][value] ?? 0) + 1
  }
}

writeFileSync(
  "./src/ai/naiveBayesMoveScore/data.json",
  JSON.stringify(data, null, 2),
)
