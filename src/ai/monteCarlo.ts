import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {randomPick} from "../logic/helpers"
import {getPossibleMoves} from "./aiHelpers"

// Runs: 10, score: 28.3, duration: 35155.2ms

type Node = {gs: GameState; bestScore?: number; children?: Node[]}

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    gs = solveRound(gs)
    gs = gs.endRound()
  }

  return gs
}

function solveRound(gs: GameState) {
  // TODO this will ignore the possibility of using a special tile on last move
  while (!gs.canEndRound) {
    let root: Node = {gs}

    for (let i = 0; i < 1000; i++) {
      iterate(root)
    }

    const bestChild = root.children!.reduce((a, b) =>
      (a.bestScore ?? 0) > (b.bestScore ?? 0) ? a : b,
    )

    root = bestChild
    gs = bestChild.gs
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
    const simulatedScore = calculateScore(simulate(node.gs).board).total
    const score = Math.max(node.bestScore ?? -Infinity, simulatedScore)
    node.bestScore = score
  }

  return node.bestScore
}

function simulate(gs: GameState) {
  if (gs.gameEnded) return gs

  const possibleNextGameStates = [
    ...getPossibleMoves(gs),
    // TODO this "cheats" and knows what seeded tiles will come up
    ...(gs.canEndRound ? [gs.endRound()] : []),
  ]

  return simulate(randomPick(possibleNextGameStates))
}