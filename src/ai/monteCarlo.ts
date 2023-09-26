import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {getMean, shuffle, weightedRandomIterate} from "../logic/helpers"
import type {OpenSlot, Position, TileString} from "../logic/types"
import exhaustiveSearch from "./exhaustiveSearch"
// import predictScore from "./predictScore/predictScore"
import {scoreMove} from "./heuristics"
import prioritise from "./prioritisePositions/prioritise"
// import orderMoves from "./orderMoves/orderMoves"

export async function solveRound(gs: GameState): Promise<string[]> {
  if (gs.roundNumber === 7) {
    return exhaustiveSearch(gs)
  }

  const moves: string[] = []

  let simulationResults: Array<{moveStrings: string[]; score: number}> = []

  // TODO need to account for possibility of using special tile on last move
  while (!gs.canEndRound) {
    for (let i = 0; i < 1000; i++) {
      // console.time("simulate")
      simulationResults.push(await simulate(gs, gs.roundNumber))
      // console.timeEnd("simulate")
    }

    const openingMoveScores = [...getPossibleMoves(gs)].reduce(
      (acc, move) => ({...acc, [move]: []}),
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

      if (mean > bestScore) {
        bestOpeningMoveString = openingMoveString
        bestScore = mean
      }
    }

    if (!bestOpeningMoveString) throw new Error("Could not find opening move")

    moves.push(bestOpeningMoveString)
    gs = gs.makeMoves([bestOpeningMoveString])
    simulationResults = simulationResults.filter((r) =>
      r.moveStrings.includes(bestOpeningMoveString!),
    )
  }

  return moves
}

async function pickRandomGoodMove(gs: GameState): Promise<string | null> {
  return getPossibleMoves(gs).next().value
  // const ordered = await orderMoves(gs, [...getPossibleMoves(gs)])
  // return ordered[Math.floor(Math.random() * Math.random() * ordered.length)]
}

async function simulate(
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

  const move = await pickRandomGoodMove(gs)

  if (move) {
    const newMoveStrings = roundEndedOnce ? moveStrings : [...moveStrings, move]
    return simulate(
      gs.makeMoves([move]),
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

  // const score = await predictScore(gs)
  // return {moveStrings, score}
}

function* getPossibleMoves(gs: GameState): Generator<string> {
  const openPositions = weightedRandomIterate(
    prioritise(gs.board.openPositions),
  )
  const availableTiles = shuffle(gs.availableTiles)

  for (const p of openPositions) {
    for (const {tile, special} of availableTiles) {
      if (special && gs.roundNumber <= 4) continue

      const slot = gs.board.getOpenSlot(p)!
      for (const {tTile} of getOrderedTransformedTiles(gs, p, tile, slot)) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
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

// function weightedRandomSort(list: Array<{score: number; tTile: TileString}>) {
//   if (list.length <= 1) return list

//   const totalWeight = list.reduce((acc, {score}) => acc + score, 0)

//   let pickPoint = Math.random() * totalWeight

//   const firstIndex = list.findIndex(({score}) => {
//     pickPoint -= score
//     if (pickPoint <= 0) return true
//   })

//   ;[list[0], list[firstIndex]] = [list[firstIndex], list[0]]

//   return list
// }
