import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"
import {parseMove} from "../../logic/helpers"
import type {GameRecord} from "../../logic/types"
import {getPossibleMoves, shouldUseSpecial} from "../monteCarlo"
import readJsonl from "../readJsonl"
import getFeatures from "./getFeatures"
import getScore from "./getScore"
import {shuffle} from "../../logic/helpers"

const gameRecords: GameRecord[] = readJsonl("./src/data/training.jsonl")

const totalCounts = {
  yes: 0,
  no: 0,
}

const featureCounts = {
  yes: {} as Record<string, number>,
  no: {} as Record<string, number>,
}

const scores = {
  yes: [] as number[],
  no: [] as number[],
}

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)
  let gs = new GameState(undefined, gameTiles[0])

  for (const roundMoves of game.moves) {
    for (const actualMove of roundMoves) {
      for (const possibleMove of getPossibleMoves(gs, shouldUseSpecial(gs))) {
        const {p, tile} = parseMove(possibleMove)
        const slot = gs.board.getOpenSlot(p)!

        const features = getFeatures(p, tile, slot)
        const chosen = actualMove === possibleMove ? "yes" : "no"

        totalCounts[chosen]++

        for (const [name, value] of Object.entries(features)) {
          if (value) {
            featureCounts[chosen][name] = (featureCounts[chosen][name] ?? 0) + 1
          }
        }

        scores[chosen].push(getScore(p, tile, slot))
      }

      gs = gs.makeMove(actualMove)
    }
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }
}

// for (const key of Object.keys(featureCounts.yes).sort()) {
//   console.log(
//     key.padStart(7, " "),
//     (featureCounts.yes[key] / featureCounts.no[key]).toFixed(3),
//   )
// }

// console.log(JSON.stringify({totalCounts, featureCounts}, null, 2))

// for (let i = 0; i < scores.no.length; i++) {
//   if (i % 10 !== 0) continue
//   console.log(`${scores.no[i].toFixed(4)}	${scores.yes[i]?.toFixed(4) ?? ""}`)
// }

scores.no = shuffle(scores.no)

for (let i = 0; i < scores.yes.length; i++) {
  console.log(`${scores.no[i].toFixed(5)}	${scores.yes[i]?.toFixed(5) ?? ""}`)
}
