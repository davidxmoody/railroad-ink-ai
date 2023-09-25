import {parentPort, workerData, Worker, isMainThread} from "node:worker_threads"
import GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {rollGameDice} from "../logic/dice"
import {solveRound} from "./monteCarlo"
import type {GameRecord} from "./types"
// import {getMean, getStandardDeviation} from "../logic/helpers"

async function runOne(seed: string) {
  const gameTiles = rollGameDice(seed)

  const moves: string[][] = []
  let gs = new GameState(undefined, gameTiles[0])

  while (!gs.gameEnded) {
    const roundMoves = await solveRound(gs)
    moves.push(roundMoves)
    gs = gs.makeMoves(roundMoves).endRound(gameTiles[gs.roundNumber])
  }

  const score = calculateScore(gs.board).total

  const record: GameRecord = {seed, score, moves}

  parentPort?.postMessage(record)

  return record
}

async function runMany(seeds: string[]) {
  for (const seed of seeds) {
    await runOne(seed)
  }
}

const numThreads = 1 as number

const seedPrefix = "training-"
const seedStart = 0
const seedEnd = 10
const runsPerSeed = 1

const threadSeeds: string[][] = Array.from({length: numThreads}, () => [])
let nextThreadIndex = 0
for (let seedIndex = seedStart; seedIndex <= seedEnd; seedIndex++) {
  for (let runIndex = 0; runIndex < runsPerSeed; runIndex++) {
    threadSeeds[nextThreadIndex].push(`${seedPrefix}${seedIndex}`)
    nextThreadIndex = (nextThreadIndex + 1) % numThreads
  }
}

// const records: Array<{score: number}> = []

// for (let i = 0; i < numThreads; i++) {
//   const worker = new Worker("./src/ai/worker.ts", {workerData: threadSeeds[i]})

//   worker.on("error", console.error)

//   worker.on("message", (record) => {
//     records.push(record)

//     //     const scores = records.map((r) => r.score)
//     //     const avgScore = getMean(scores).toFixed(1)
//     //     const stdScore = getStandardDeviation(scores).toFixed(1)

//     // console.log(
//     //   `Score: ${record.score}, seed: ${record.seed}, avg: ${avgScore}, std: ${stdScore}`,
//     // )

//     console.log(JSON.stringify(record))
//   })
// }

if (isMainThread && numThreads === 1) {
  runMany(threadSeeds[0])
} else if (isMainThread) {
  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker("./src/ai/run.ts", {workerData: threadSeeds[i]})
    worker.on("error", console.error)
  }
} else {
  runMany(workerData)
}
