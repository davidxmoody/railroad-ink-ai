import {Board} from "../logic/Board"
import type GameState from "../logic/GameState"
import {pickHighestScoringGameState} from "./aiHelpers"

// Runs: 10, score: 28.8, duration: 5070.1ms

type Node = {gs: GameState; leaf: boolean; children?: Node[]}

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    gs = solveRound(gs)
    gs = gs.endRound()
  }

  return gs
}

function solveRound(gs: GameState) {
  console.log()

  let skipCount = 0
  const visitedBoards = new Set<string>()

  const root: Node = {gs, leaf: false}

  function expand(node: Node) {
    node.children = []

    for (const nextGs of getPossibleMoves(node.gs)) {
      const key = nextGs.board.toString()
      if (visitedBoards.has(key)) {
        skipCount++
        continue
      }
      visitedBoards.add(key)

      const child: Node = {gs: nextGs, leaf: nextGs.canEndRound}
      node.children.push(child)
      expand(child)
    }

    process.stdout.write(
      `\rRound: ${gs.roundNumber}, skipped: ${skipCount}, length: ${visitedBoards.size}`,
    )
  }

  expand(root)

  gs = pickHighestScoringGameState(getLeafGameStates(root))

  console.log()

  return gs
}

function* getPossibleMoves(gs: GameState) {
  for (const {special, tile} of gs.availableTiles) {
    if (special) return

    for (let y = 0; y < Board.size; y++) {
      for (let x = 0; x < Board.size; x++) {
        const validTransformedTiles = gs.board.getAllValidTransformedTiles(
          {y, x},
          tile,
        )

        for (const tTile of validTransformedTiles) {
          yield gs.placeTile({y, x}, tTile)
        }
      }
    }
  }
}

function* getLeafGameStates(node: Node): Generator<GameState> {
  if (node.leaf) {
    yield node.gs
  } else {
    for (const child of node.children ?? []) {
      yield* getLeafGameStates(child)
    }
  }
}
