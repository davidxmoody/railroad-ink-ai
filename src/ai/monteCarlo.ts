import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import {getAllTransformedTiles, shuffle, tileFitsInSlot} from "../logic/helpers"
import type {OpenSlot, Position, TileString} from "../logic/types"
import {scoreMove} from "./heuristics"

// Runs: 20, score: 49.8, duration: 39612.0ms

type Move = {
  p: Position
  tTile: TileString
}

export function solveRound(gs: GameState) {
  let simulationResults: Array<{moveStrings: string[]; score: number}> = []

  // TODO need to account for possibility of using special tile on last move
  while (!gs.canEndRound) {
    for (let i = 0; i < 1000; i++) {
      simulationResults.push(simulate(gs))
    }

    const openingMoveLog = [...getPossibleMoves(gs)].reduce((acc, move) => {
      acc[encodeMove(move)] = {count: 0, averageScore: -1000}
      return acc
    }, {} as Record<string, {count: number; averageScore: number}>)

    for (const simulationResult of simulationResults) {
      for (const moveString of simulationResult.moveStrings) {
        const logItem = openingMoveLog[moveString]
        if (logItem) {
          const newCount = logItem.count + 1
          logItem.averageScore =
            (logItem.averageScore * logItem.count + simulationResult.score) /
            newCount
          logItem.count = newCount
        }
      }
    }

    const bestOpeningMoveString = Object.keys(openingMoveLog).reduce((a, b) =>
      openingMoveLog[a].averageScore > openingMoveLog[b].averageScore ? a : b,
    )

    const bestOpeningMove = parseMove(bestOpeningMoveString)

    gs = gs.placeTile(bestOpeningMove.p, bestOpeningMove.tTile)
    simulationResults = simulationResults.filter((r) =>
      r.moveStrings.includes(bestOpeningMoveString),
    )
    // console.log("kept num results", simulationResults.length)
  }

  return gs
}

function simulate(
  gs: GameState,
  moveStrings: string[] = [],
  roundEndedOnce = false,
) {
  if (gs.gameEnded) {
    const score = calculateScore(gs.board).total
    return {moveStrings, score}
  }

  const move = getPossibleMoves(gs).next().value

  if (move) {
    const newMoveStrings = roundEndedOnce
      ? moveStrings
      : [...moveStrings, encodeMove(move)]
    return simulate(
      gs.placeTile(move.p, move.tTile),
      newMoveStrings,
      roundEndedOnce,
    )
  }

  return simulate(gs.endRound(), moveStrings, true)
}

function* getPossibleMoves(gs: GameState): Generator<Move> {
  const openPositions = shuffle(gs.board.openPositions)
  const availableTiles = shuffle(gs.availableTiles)

  for (const p of openPositions) {
    for (const {tile, special} of availableTiles) {
      if (special && gs.roundNumber <= 4) continue

      const slot = gs.board.getOpenSlot(p)!
      for (const {tTile} of getOrderedTransformedTiles(gs, p, tile, slot)) {
        yield {p, tTile}
      }
    }
  }
}

function encodeMove(move: Move) {
  return `${move.p.y}${move.p.x}${move.tTile}`
}

function parseMove(moveString: string): Move {
  const tTile = moveString.slice(2) as TileString
  const y = parseInt(moveString[0], 10)
  const x = parseInt(moveString[1], 10)

  return {p: {y, x}, tTile}
}

function getOrderedTransformedTiles(
  gs: GameState,
  p: Position,
  tile: TileString,
  slot: OpenSlot,
) {
  const results: Array<{score: number; tTile: TileString}> = []

  for (const tTile of getAllTransformedTiles(tile)) {
    if (tileFitsInSlot(tTile, slot)) {
      const score = scoreMove(gs, p, tTile, slot)
      results.push({score, tTile})
    }
  }

  return weightedRandomSort(results)
}

// function scorePlacement(tile: TileString, slot: OpenSlot) {
//   let numMatches = 0

//   for (const r of rotations) {
//     if (tile[r] === "_" || slot[r] === "_") continue
//     if (tile[r] !== slot[r]) return 0
//     numMatches++
//   }

//   return numMatches
// }

function weightedRandomSort(list: Array<{score: number; tTile: TileString}>) {
  if (list.length <= 1) return list

  const totalWeight = list.reduce((acc, {score}) => acc + score, 0)

  let pickPoint = Math.random() * totalWeight

  const firstIndex = list.findIndex(({score}) => {
    pickPoint -= score
    if (pickPoint <= 0) return true
  })

  ;[list[0], list[firstIndex]] = [list[firstIndex], list[0]]

  return list
}
