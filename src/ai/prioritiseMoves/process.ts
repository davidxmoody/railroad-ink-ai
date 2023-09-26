import readJsonl from "../readJsonl"
import type {GameRecord} from "../types"
import getKey from "./getKey"

const gameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

const log: Record<string, number> = {}

for (const game of gameRecords) {
  for (let roundNumber = 1; roundNumber <= 7; roundNumber++) {
    for (const move of game.moves[roundNumber - 1]) {
      const key = getKey(roundNumber, move)
      log[key] = (log[key] ?? 0) + 1
    }
  }
}

console.log(JSON.stringify(log))
