import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {allTransforms, shuffle, transformTile} from "../logic/helpers"
import type {Position, TileString} from "../logic/types"

// Runs: 100, score: 46.5, duration: 6152.1ms

type Move = {
  index: number
  special: boolean
  p: Position
  tTile: TileString
}

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    gs = solveRound(gs)
    gs = gs.endRound()
  }

  return gs
}

function solveRound(gs: GameState) {
  while (!gs.canEndRound) {
    const possibleOpeningMoveLog = getPossibleMoves(gs).reduce(
      (acc, move) => {
        acc[encodeMove(move)] = {count: 0, averageScore: -1000}
        return acc
      },
      {} as Record<
        string,
        {
          count: number
          averageScore: number
        }
      >,
    )

    const simulationResults: Array<{moves: Move[]; score: number}> = []

    for (let i = 0; i < 1000; i++) {
      const simulationResult = simulate(gs)
      simulationResults.push(simulationResult)
      for (const move of simulationResult.moves) {
        const logItem = possibleOpeningMoveLog[encodeMove(move)]
        if (logItem) {
          const newCount = logItem.count + 1
          logItem.averageScore =
            (logItem.averageScore * logItem.count + simulationResult.score) /
            newCount
          logItem.count = newCount
        }
      }
    }

    const bestOpeningMoveString = Object.keys(possibleOpeningMoveLog).reduce(
      (a, b) =>
        possibleOpeningMoveLog[a].averageScore >
        possibleOpeningMoveLog[b].averageScore
          ? a
          : b,
    )

    gs = makeMove(gs, bestOpeningMoveString)
  }

  return gs
}

function simulate(
  gs: GameState,
  moves: Move[] = [],
): {moves: Move[]; score: number} {
  if (gs.gameEnded) {
    const score = calculateScore(gs.board).total
    return {moves, score}
  }

  const openPositions = shuffle(gs.board.openPositions)
  const availableTiles = shuffle(gs.availableTiles)
  // TODO optimise tile transform finding so dont have to go through
  // 8 transforms for no reason
  const transforms = shuffle(allTransforms.slice(0, 4))

  for (const p of openPositions) {
    for (const {tile, index, special} of availableTiles) {
      // TODO account for choosing not to use a special tile sometimes
      if (special && Math.random() > 0.1) continue
      // if (special) continue

      for (const transform of transforms) {
        const tTile = transformTile(tile, transform)
        if (gs.board.isValid(p, tTile)) {
          const move = {index, special, p, tTile}
          const nextGs = gs.placeTile(index, special, p, tTile)
          return simulate(nextGs, [...moves, move])
        }
      }
    }
  }

  return simulate(gs.endRound(), moves)
}

function getPossibleMoves(gs: GameState) {
  const moves: Move[] = []

  const openPositions = gs.board.openPositions
  const availableTiles = gs.availableTiles

  for (const {special, index, tile} of availableTiles) {
    for (const p of openPositions) {
      const validTransformedTiles = gs.board.getAllValidTransformedTiles(
        p,
        tile,
      )

      for (const tTile of validTransformedTiles) {
        moves.push({index, special, p, tTile})
      }
    }
  }

  return moves
}

function encodeMove(move: Move) {
  return `${move.p.y}${move.p.x}${move.tTile}`
}

function makeMove(gs: GameState, moveString: string) {
  const moveTTile = moveString.slice(2) as TileString
  const allTransformedTiles = new Set(
    allTransforms.map((t) => transformTile(moveTTile, t)),
  )
  const chosenTile = gs.availableTiles.find(({tile}) =>
    allTransformedTiles.has(tile),
  )

  if (!chosenTile) {
    throw new Error("Cannot make move")
  }

  const y = parseInt(moveString[0], 10)
  const x = parseInt(moveString[1], 10)

  return gs.placeTile(chosenTile.index, chosenTile.special, {y, x}, moveTTile)
}
