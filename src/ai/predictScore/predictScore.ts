import * as tf from "@tensorflow/tfjs-node"
import type GameState from "../../logic/GameState"
import {getFeatures} from "./getFeatures"

const modelPromise = tf.loadLayersModel(
  "file://./src/ai/predictScore/model/model.json",
)

export default async function (gs: GameState) {
  const model = await modelPromise

  const features = getFeatures(gs)

  const result = model.predict(
    tf.tensor2d(features, [1, features.length]),
  ) as tf.Tensor

  return (await result.data())[0]
}
