import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {getPossibleMoves} from "./aiHelpers"

// Runs: 10, score: 42.3, duration: 3831.6ms

type Node = {gs: GameState; bestScore?: number; children?: Node[]}

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    let root: Node = {gs}

    while (!gs.canEndRound) {
      for (let i = 0; i < 1000; i++) {
        iterate(root)
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
