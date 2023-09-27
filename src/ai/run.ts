import {parentPort, workerData, Worker, isMainThread} from "node:worker_threads"
import GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"
import {solveRound} from "./monteCarlo"
import type {GameRecord} from "./types"
import {getMean, getStandardDeviation} from "../logic/helpers"

const numThreads = 6 as number
// const seedPrefix = "training-"
const seedPrefix = ""
const seedStart = 0
const seedEnd = 200
const runsPerSeed = 4

function run(seeds: string[], callback: (record: GameRecord) => void) {
  for (const seed of seeds) {
    const gameTiles = rollGameDice(seed)

    const moves: string[][] = []
    let gs = new GameState(undefined, gameTiles[0])

    while (!gs.gameEnded) {
      const roundMoves = solveRound(gs)
      moves.push(roundMoves)
      gs = gs.makeMoves(roundMoves).endRound(gameTiles[gs.roundNumber])
    }

    const score = calculateScore(gs.board).total

    callback({seed, score, moves})
  }
}

const threadSeeds: string[][] = Array.from({length: numThreads}, () => [])
let nextThreadIndex = 0
for (let seedIndex = seedStart; seedIndex <= seedEnd; seedIndex++) {
  for (let runIndex = 0; runIndex < runsPerSeed; runIndex++) {
    threadSeeds[nextThreadIndex].push(`${seedPrefix}${seedIndex}`)
    nextThreadIndex = (nextThreadIndex + 1) % numThreads
  }
}

const records: Array<{score: number}> = []

function onRecord(record: GameRecord) {
  records.push(record)

  const scores = records.map((r) => r.score)
  const avgScore = getMean(scores).toFixed(1)
  const stdScore = getStandardDeviation(scores).toFixed(1)

  console.log(
    `Score: ${record.score}, seed: ${record.seed}, avg: ${avgScore}, std: ${stdScore}`,
  )

  // console.log(JSON.stringify(record))
}

if (isMainThread) {
  if (numThreads === 1) {
    // This is faster and prevents console logs from being silenced
    run(threadSeeds[0], onRecord)
  } else {
    for (let i = 0; i < numThreads; i++) {
      const worker = new Worker("./src/ai/run.ts", {workerData: threadSeeds[i]})
      worker.on("error", console.error)
      worker.on("message", onRecord)
    }
  }
} else {
  run(workerData, (record) => parentPort?.postMessage(record))
}
