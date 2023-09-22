import {Worker} from "node:worker_threads"
import {getMean, getStandardDeviation} from "../logic/helpers"

const numThreads = 8

const seedStart = 0
const seedEnd = 16
const runsPerSeed = 8

const threadSeeds: string[][] = Array.from({length: numThreads}, () => [])
let nextThreadIndex = 0

for (let seed = seedStart; seed <= seedEnd; seed++) {
  for (let i = 0; i < runsPerSeed; i++) {
    threadSeeds[nextThreadIndex].push(seed.toString())
    nextThreadIndex = (nextThreadIndex + 1) % numThreads
  }
}

const results: Array<{score: number; duration: number}> = []

for (let i = 0; i < numThreads; i++) {
  const worker = new Worker("./src/ai/worker.ts", {workerData: threadSeeds[i]})

  worker.on("error", console.error)

  worker.on("message", (result) => {
    results.push(result)

    const scores = results.map((r) => r.score)
    const avgScore = getMean(scores).toFixed(1)
    const stdScore = getStandardDeviation(scores).toFixed(1)

    const durations = results.map((r) => r.duration)
    const avgDuration = getMean(durations).toFixed(1)

    console.log(
      `Last: ${result.score}, seed: ${result.seed}, avg: ${avgScore}, std: ${stdScore}, avg time: ${avgDuration}s`,
    )
  })
}
