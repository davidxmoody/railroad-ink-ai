import * as tf from "@tensorflow/tfjs-node"
import readJsonl from "../readJsonl"

const NUM_EPOCHS = 200
const BATCH_SIZE = 40
const LEARNING_RATE = 0.01

const data = readJsonl<{scoreDiff: number; features: number[]}>(
  "./src/ai/orderMoves/data.jsonl",
)

async function train() {
  const model = tf.sequential()
  model.add(
    tf.layers.dense({
      inputShape: [data[0].features.length],
      units: 50,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal",
    }),
  )
  model.add(
    tf.layers.dense({
      units: 50,
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

  const trainFeatures = tf.tensor2d(data.slice(0, 9000).map((x) => x.features))
  const trainTarget = tf.tensor2d(data.slice(0, 9000).map((x) => [x.scoreDiff]))

  const testFeatures = tf.tensor2d(data.slice(9000).map((x) => x.features))
  const testTarget = tf.tensor2d(data.slice(9000).map((x) => [x.scoreDiff]))

  // const trainFeatures = data.slice(0, 9000).map((x) => tf.tensor1d(x.features))
  // const trainTarget = data.slice(0, 9000).map((x) => tf.tensor1d([x.scoreDiff]))

  // const testFeatures = data.slice(9000).map((x) => tf.tensor1d(x.features))
  // const testTarget = data.slice(9000).map((x) => tf.tensor1d([x.scoreDiff]))

  await model.fit(trainFeatures, trainTarget, {
    batchSize: BATCH_SIZE,
    epochs: NUM_EPOCHS,
    validationSplit: 0.2,
  })

  const result = model.evaluate(testFeatures, testTarget, {
    batchSize: BATCH_SIZE,
  }) as tf.Scalar

  result.print()

  await model.save("file://./src/ai/orderMoves/model")
}

train()
