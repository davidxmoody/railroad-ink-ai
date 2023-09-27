import * as tf from "@tensorflow/tfjs-node"
import GameState from "../../logic/GameState"
import {hasOverpass, rotations, shuffle} from "../../logic/helpers"
import getMeaningfulPlacements from "../../logic/getMeaningfulPlacements"
import calculateScore from "../../logic/calculateScore"
import {Board} from "../../logic/Board"

const NUM_EPOCHS = 200
const BATCH_SIZE = 40
const LEARNING_RATE = 0.01

function getRandomNextState(gs: GameState) {
  const openPositions = shuffle(gs.board.openPositions)
  const availableTiles = shuffle(gs.availableTiles)

  // TODO account for not forcing it to use a special tile in rounds 5-7

  for (const p of openPositions) {
    for (const {tile, special} of availableTiles) {
      if (special && gs.roundNumber <= 4) continue

      const slot = gs.board.getOpenSlot(p)!
      for (const tTile of shuffle(getMeaningfulPlacements(tile, slot))) {
        return gs.placeTile(p, tTile)
      }
    }
  }
}

function simulateToEndOfRound(gs: GameState): GameState {
  while (!gs.canEndRound) {
    gs = getRandomNextState(gs)!
  }
  return gs
}

function simulateToEndOfGame(gs: GameState) {
  while (!gs.gameEnded) {
    gs = simulateToEndOfRound(gs)
    gs = gs.endRound()
  }
  return gs
}

function getAllBoardTransforms(board: Board) {
  return [
    board,
    board.flipV(),
    board.flipH(),
    board.flipV().flipH(),
    board.rotate(),
    board.rotate().flipV(),
    board.rotate().flipH(),
    board.rotate().flipV().flipH(),
  ]
}

function* generateTrainingData(num: number): Generator<[number[], number]> {
  for (let i = 0; i < num; i++) {
    let gs = new GameState()

    for (let roundNumber = 1; roundNumber <= 7; roundNumber++) {
      gs = simulateToEndOfRound(gs)

      // const output = calculateScore(simulateToEndOfGame(gs).board).exits
      const output = calculateScore(gs.board).exits

      for (const transformedBoard of getAllBoardTransforms(gs.board)) {
        const input: number[] = []

        for (let y = 0; y < Board.size; y++) {
          for (let x = 0; x < Board.size; x++) {
            for (const r1 of rotations) {
              for (const r2 of rotations) {
                if (r1 >= r2) continue
                const tile = transformedBoard.get({y, x})
                if (!tile) {
                  input.push(0)
                } else if (hasOverpass(tile) && r2 - r1 !== 2) {
                  input.push(-1)
                } else if (tile[r1] !== "_" && tile[r2] !== "_") {
                  input.push(1)
                } else {
                  input.push(-1)
                }
              }
            }
          }
        }

        // for (let y = 0; y < Board.size; y++) {
        //   for (let x = 0; x < Board.size; x++) {
        //     for (let r = 0; r < 5; r++) {
        //       const tile = transformedBoard.get({y, x})
        //       if (!tile) input.push(0)
        //       else input.push({D: 1, L: -1, o: 1}[tile[r]] ?? 0)
        //     }
        //   }
        // }

        yield [input, output]
      }

      gs = gs.endRound()
    }
  }
}

async function train() {
  const trainFeatures: number[][] = []
  const trainTargets: number[] = []
  for (const [train, target] of generateTrainingData(5000)) {
    trainFeatures.push(train)
    trainTargets.push(target)
  }

  const testFeatures: number[][] = []
  const testTargets: number[] = []
  for (const [test, target] of generateTrainingData(100)) {
    testFeatures.push(test)
    testTargets.push(target)
  }

  const featuresLength = trainFeatures[0].length

  const model = tf.sequential()
  model.add(
    tf.layers.dense({
      inputShape: [featuresLength],
      units: 7 * 7,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal",
    }),
  )
  model.add(
    tf.layers.dense({
      units: 7,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal",
    }),
  )
  model.add(tf.layers.dense({units: 1}))

  model.summary()

  model.compile({
    optimizer: tf.train.sgd(LEARNING_RATE),
    loss: "meanSquaredError",
  })

  await model.fit(
    tf.tensor2d(trainFeatures, [trainFeatures.length, featuresLength]),
    tf.tensor1d(trainTargets),
    {batchSize: BATCH_SIZE, epochs: NUM_EPOCHS, validationSplit: 0.2},
  )

  const result = model.evaluate(
    tf.tensor2d(testFeatures, [testFeatures.length, featuresLength]),
    tf.tensor1d(testTargets),
    {batchSize: BATCH_SIZE},
  ) as tf.Scalar

  result.print()

  await model.save("file://./src/ai/predictSimulation")
}

train()
