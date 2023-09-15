import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {shuffle} from "../logic/helpers"
import type {Position, TileString} from "../logic/types"

// Runs: 20, score: 47.3, duration: 4015.7ms

type Move = {
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
    const possibleOpeningMoveLog = [...getPossibleMoves(gs)].reduce(
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

  const move = getPossibleMoves(gs).next().value

  if (move) {
    return simulate(gs.placeTile(move.p, move.tTile), [...moves, move])
  }

  return simulate(gs.endRound(), moves)
}

function* getPossibleMoves(gs: GameState) {
  const openPositions = shuffle(gs.board.openPositions)
  const availableTiles = shuffle(gs.availableTiles)

  for (const p of openPositions) {
    for (const {tile} of availableTiles) {
      const validTransformedTiles = shuffle(
        gs.board.getAllValidTransformedTiles(p, tile),
      )

      for (const tTile of validTransformedTiles) {
        yield {p, tTile}
      }
    }
  }
}

function encodeMove(move: Move) {
  return `${move.p.y}${move.p.x}${move.tTile}`
}

function makeMove(gs: GameState, moveString: string) {
  const moveTTile = moveString.slice(2) as TileString
  const y = parseInt(moveString[0], 10)
  const x = parseInt(moveString[1], 10)

  return gs.placeTile({y, x}, moveTTile)
}
