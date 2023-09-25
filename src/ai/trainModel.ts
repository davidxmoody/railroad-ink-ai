import * as tf from "@tensorflow/tfjs-node"
import readJsonl from "./readJsonl"

const NUM_EPOCHS = 200
const BATCH_SIZE = 40
const LEARNING_RATE = 0.01

const data = readJsonl<{score: number; features: number[]}>(
  "./src/data/processedTrainingData.jsonl",
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
  const trainTarget = tf.tensor2d(data.slice(0, 9000).map((x) => [x.score]))

  const testFeatures = tf.tensor2d(data.slice(9000).map((x) => x.features))
  const testTarget = tf.tensor2d(data.slice(9000).map((x) => [x.score]))

  await model.fit(trainFeatures, trainTarget, {
    batchSize: BATCH_SIZE,
    epochs: NUM_EPOCHS,
    validationSplit: 0.2,
  })

  const result = model.evaluate(testFeatures, testTarget, {
    batchSize: BATCH_SIZE,
  }) as tf.Scalar

  result.print()

  await model.save("file://./src/data/model")

  // console.log(model.predict(tf.tensor2d([[0, 4, 1, 0, 4, 1]])).toString())
  // console.log(model.predict(tf.tensor2d([[20, 6, 6, 4, 8, 5]])).toString())

  // const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1])
  // const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1])

  // await model.fit(xs, ys, {epochs: 250})

  // console.log(model.predict(tf.tensor2d([20], [1, 1])).toString())
}

train()
