import {Worker} from "node:worker_threads"
// import {getMean, getStandardDeviation} from "../logic/helpers"

const numThreads = 6

const seedPrefix = "training-"
const seedStart = 0
const seedEnd = 999
const runsPerSeed = 1

const threadSeeds: string[][] = Array.from({length: numThreads}, () => [])
let nextThreadIndex = 0

for (let seedIndex = seedStart; seedIndex <= seedEnd; seedIndex++) {
  for (let runIndex = 0; runIndex < runsPerSeed; runIndex++) {
    threadSeeds[nextThreadIndex].push(`${seedPrefix}${seedIndex}`)
    nextThreadIndex = (nextThreadIndex + 1) % numThreads
  }
}

const records: Array<{score: number}> = []

for (let i = 0; i < numThreads; i++) {
  const worker = new Worker("./src/ai/worker.ts", {workerData: threadSeeds[i]})

  worker.on("error", console.error)

  worker.on("message", (record) => {
    records.push(record)

    //     const scores = records.map((r) => r.score)
    //     const avgScore = getMean(scores).toFixed(1)
    //     const stdScore = getStandardDeviation(scores).toFixed(1)

    // console.log(
    //   `Score: ${record.score}, seed: ${record.seed}, avg: ${avgScore}, std: ${stdScore}`,
    // )

    console.log(JSON.stringify(record))
  })
}
