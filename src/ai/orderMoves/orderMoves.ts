import * as tf from "@tensorflow/tfjs-node"
import type GameState from "../../logic/GameState"
import getFeatures from "./getFeatures"

const modelPromise = tf.loadLayersModel(
  "file://./src/ai/orderMoves/model/model.json",
)

export default async function orderMoves(gs: GameState, moves: string[]) {
  if (moves.length === 0) return []

  const model = await modelPromise

  // console.time("predict")
  const featuresTensors = tf.tensor(moves.map((move) => getFeatures(gs, move)))
  const scoreDiffs = (model.predict(featuresTensors) as tf.Tensor).dataSync()

  const combined = moves.map((move, i) => ({move, scoreDiff: scoreDiffs[i]}))

  // for (const move of moves) {
  //   const features = getFeatures(gs, move)
  //   const featuresTensor = tf.tensor2d(features, [1, features.length])
  //   const result = model.predict(featuresTensor) as tf.Tensor
  //   results.push({move, scoreDiff: result.dataSync()[0]})
  // }
  // console.timeEnd("predict")

  return combined
    .sort((a, b) => b.scoreDiff - a.scoreDiff)
    .map(({move}) => move)
}
