import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {getMean, getStandardDeviation, shuffle} from "../logic/helpers"
import type {OpenSlot, Position, TileString} from "../logic/types"
import {scoreMove} from "./heuristics"

type Move = {
  p: Position
  tTile: TileString
}

export function solveRound(gs: GameState) {
  if (gs.roundNumber === 7) {
    let bestGs: GameState | null = null
    let bestScore = -Infinity

    for (const endGs of exhaustiveSearch(gs, [], new Set())) {
      const endScore = calculateScore(endGs.board).total
      if (endScore > bestScore) {
        bestScore = endScore
        bestGs = endGs
      }
    }

    if (!bestGs) throw new Error("Could not find best GameState")

    return bestGs
  }

  let simulationResults: Array<{moveStrings: string[]; score: number}> = []

  // TODO need to account for possibility of using special tile on last move
  while (!gs.canEndRound) {
    for (let i = 0; i < 1000; i++) {
      simulationResults.push(simulate(gs, gs.roundNumber))
    }

    const openingMoveScores = [...getPossibleMoves(gs)].reduce(
      (acc, move) => ({...acc, [encodeMove(move)]: []}),
      {} as Record<string, number[]>,
    )

    for (const {score, moveStrings} of simulationResults) {
      for (const moveString of moveStrings) {
        openingMoveScores[moveString]?.push(score)
      }
    }

    let bestOpeningMoveString: string | null = null
    let bestScore = -Infinity

    for (const [openingMoveString, scores] of Object.entries(
      openingMoveScores,
    )) {
      if (!scores.length) continue
      const mean = getMean(scores)
      const std = getStandardDeviation(scores)

      if (mean > bestScore) {
        bestOpeningMoveString = openingMoveString
        bestScore = mean
      }

      //       console.log(
      //         openingMoveString.padEnd(7, " "),
      //         scores.length.toString().padStart(4, " "),
      //         mean.toFixed(2).padStart(7, " "),
      //         std.toFixed(2).padStart(7, " "),
      //       )
    }

    if (!bestOpeningMoveString) throw new Error("Could not find opening move")

    const bestOpeningMove = parseMove(bestOpeningMoveString)

    // console.log("Chosen best opening move", bestOpeningMoveString)

    gs = gs.placeTile(bestOpeningMove.p, bestOpeningMove.tTile)
    simulationResults = simulationResults.filter((r) =>
      r.moveStrings.includes(bestOpeningMoveString!),
    )
    // simulationResults = []
  }

  // console.log("End round")

  return gs
}

function* exhaustiveSearch(
  gs: GameState,
  moves: string[],
  encounteredStates: Set<string>,
): Generator<GameState> {
  if (gs.canEndRound) {
    yield gs
    return
  }

  for (const move of getPossibleMoves(gs)) {
    const newMoves = [...moves, encodeMove(move)].sort()
    const key = newMoves.join("")
    if (encounteredStates.has(key)) continue
    encounteredStates.add(key)
    yield* exhaustiveSearch(
      gs.placeTile(move.p, move.tTile),
      newMoves,
      encounteredStates,
    )
  }
}

function simulate(
  gs: GameState,
  originalRoundNumber: number,
  moveStrings: string[] = [],
  roundEndedOnce = false,
) {
  if (gs.gameEnded) {
    const s = calculateScore(gs.board)
    // const score = s.total
    // TODO think about running multi-cored to speed up results gathering
    // the alternate scoring seems to consistently get 2.5 points more
    const score = 1.5 * s.exits + s.rail + s.road + s.center
    return {moveStrings, score}
  }

  const move = getPossibleMoves(gs).next().value

  if (move) {
    const newMoveStrings = roundEndedOnce
      ? moveStrings
      : [...moveStrings, encodeMove(move)]
    return simulate(
      gs.placeTile(move.p, move.tTile),
      originalRoundNumber,
      newMoveStrings,
      roundEndedOnce,
    )
  }

  // return {moveStrings, score: calculateScore(gs.board).total}

  //   return simulate(gs.endRound([
  //     "DLLL",
  //     "DDLL",
  //     "DDDL",
  //     "DLDL",
  //   ]), moveStrings, true)

  return simulate(gs.endRound(), originalRoundNumber, moveStrings, true)
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

  for (const tTile of getMeaningfulPlacements(tile, slot)) {
    const score = scoreMove(gs, p, tTile, slot)
    results.push({score, tTile})
  }

  // for (const tTile of getAllTransformedTiles(tile)) {
  //   if (tileFitsInSlot(tTile, slot)) {
  //     const score = scoreMove(gs, p, tTile, slot)
  //     results.push({score, tTile})
  //   }
  // }

  // return weightedRandomSort(results)
  return shuffle(results)
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
