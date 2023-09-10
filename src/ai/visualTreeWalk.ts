import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {getPossibleMoves} from "./aiHelpers"

export type Node = {gs: GameState; bestScore?: number; children?: Node[]}

export async function solve(
  gs: GameState,
  {step}: {step: (root: Node) => Promise<unknown>} = {
    step: () => Promise.resolve(),
  },
) {
  while (!gs.gameEnded) {
    let root: Node = {gs}

    await step(root)

    while (!gs.canEndRound) {
      for (let i = 0; i < 1000; i++) {
        iterate(root)
        await step(root)
      }

      const bestChild = root.children!.reduce((a, b) =>
        (a.bestScore ?? 0) > (b.bestScore ?? 0) ? a : b,
      )

      root = bestChild
      gs = bestChild.gs
    }

    gs = gs.endRound()
  }

  return gs
}

function iterate(node: Node): number {
  if (!node.children) {
    node.children = Array.from(getPossibleMoves(node.gs), (gs) => ({gs}))
  }

  const randomChild =
    node.children[Math.floor(Math.random() * node.children.length)]

  if (randomChild) {
    const bestChildScore = iterate(randomChild)
    node.bestScore =
      node.bestScore !== undefined && node.bestScore > bestChildScore
        ? node.bestScore
        : bestChildScore
  } else {
    const score = node.bestScore ?? calculateScore(node.gs.board).total
    node.bestScore = score
  }

  return node.bestScore
}
