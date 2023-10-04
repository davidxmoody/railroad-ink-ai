import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
// import {isSpecial} from "../logic/helpers"
// import type {TileString} from "../logic/types"

// Stats from 100 runs (seeds 0-24, 4 runs each)
// {
//  total: 100,
//  noSpecialNeeded: 4,
//  latest: [ 0, 0, 4, 15, 77 ],
//  earliest: [ 86, 7, 1, 2, 0 ]
//}

// Stats from 300 runs with different limits on when special tiles can be used
// {
//   numRuns: 300,
//   avgScoreNoLimits: 54.49666666666667,
//   avgScoreLimited: [
//     54.37000000000002,
//     54.49666666666667,
//     54.48333333333333,
//     54.46333333333333,
//     54.23666666666666,
//     50.940000000000005
//   ]
// }

const stats = {
  numRuns: 0,
  avgScoreNoLimits: 0,
  avgScoreLimited: [0, 0, 0, 0, 0, 0],
}

export default function exhaustiveSearch(gs: GameState) {
  for (let forceSpecialIndex = 0; forceSpecialIndex <= 5; forceSpecialIndex++) {
    let bestScore = -Infinity

    for (const [endGs] of visitAllStates(
      gs,
      [],
      new Set(),
      (gs) => gs.usedTileIndexes.length === forceSpecialIndex,
    )) {
      const endScore = calculateScore(endGs.board).total
      if (endScore > bestScore) {
        bestScore = endScore
      }
    }

    stats.avgScoreLimited[forceSpecialIndex] =
      (stats.numRuns * stats.avgScoreLimited[forceSpecialIndex] + bestScore) /
      (stats.numRuns + 1)
  }

  let bestMoves: string[] = []
  let bestScore = -Infinity

  for (const [endGs, endMoves] of visitAllStates(
    gs,
    [],
    new Set(),
    () => true,
  )) {
    const endScore = calculateScore(endGs.board).total
    if (endScore > bestScore) {
      bestScore = endScore
      bestMoves = endMoves
    }
  }

  stats.avgScoreNoLimits =
    (stats.numRuns * stats.avgScoreNoLimits + bestScore) / (stats.numRuns + 1)

  stats.numRuns++

  console.log(stats)

  return bestMoves

  // stats.total++

  // const noSpecialNeeded = bestMoves.some((moves) =>
  //   moves.every((move) => !isSpecialMove(move)),
  // )

  // if (noSpecialNeeded) {
  //   stats.noSpecialNeeded++
  // } else {
  //   const latestSpecialIndexes = bestMoves.map((moves) =>
  //     latestSpecialIndex(gs, moves),
  //   )
  //   const veryLatestSpecialIndex = Math.max(...latestSpecialIndexes)
  //   stats.latest[veryLatestSpecialIndex]++

  //   const earliestSpecialIndexes = bestMoves.map((moves) =>
  //     earliestSpecialIndex(gs, moves),
  //   )
  //   const veryEarliestSpecialIndex = Math.min(...earliestSpecialIndexes)
  //   stats.earliest[veryEarliestSpecialIndex]++
  // }

  // console.log(stats)

  // return (bestMoves)
}

// function isSpecialMove(move: string) {
//   return isSpecial(move.slice(2) as TileString)
// }

// function latestSpecialIndex(gs: GameState, moves: string[]) {
//   const specialIndex = moves.findIndex((move) =>
//     isSpecial(move.slice(2) as TileString),
//   )
//   const movesWithoutSpecial = [
//     ...moves.slice(0, specialIndex),
//     ...moves.slice(specialIndex + 1),
//   ]

//   for (let i = 4; i >= 0; i--) {
//     const newMoves = [...movesWithoutSpecial]
//     newMoves.splice(i, 0, moves[specialIndex])
//     try {
//       gs.makeMoves(newMoves)
//       return i
//     } catch (e) {
//       continue
//     }
//   }

//   return 0
// }

// function earliestSpecialIndex(gs: GameState, moves: string[]) {
//   const specialIndex = moves.findIndex((move) =>
//     isSpecial(move.slice(2) as TileString),
//   )
//   const movesWithoutSpecial = [
//     ...moves.slice(0, specialIndex),
//     ...moves.slice(specialIndex + 1),
//   ]

//   for (let i = 0; i <= 4; i++) {
//     const newMoves = [...movesWithoutSpecial]
//     newMoves.splice(i, 0, moves[specialIndex])
//     try {
//       gs.makeMoves(newMoves)
//       return i
//     } catch (e) {
//       continue
//     }
//   }

//   return 4
// }

function* visitAllStates(
  gs: GameState,
  moves: string[],
  encounteredStates: Set<string>,
  canUseSpecial: (gs: GameState) => boolean,
): Generator<[GameState, string[]]> {
  if (gs.canEndRound) {
    yield [gs, moves]
  }

  for (const move of getPossibleMoves(gs, canUseSpecial)) {
    const newMoves = [...moves, move]
    const key = [...newMoves].sort().join("")
    if (encounteredStates.has(key)) continue
    encounteredStates.add(key)
    yield* visitAllStates(
      gs.makeMoves([move]),
      newMoves,
      encounteredStates,
      canUseSpecial,
    )
  }
}

function* getPossibleMoves(
  gs: GameState,
  canUseSpecial: (gs: GameState) => boolean,
): Generator<string> {
  for (const {tile, special} of gs.availableTiles) {
    if (special && !canUseSpecial(gs)) continue
    for (const [p, slot] of gs.board.openSlotEntries()) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
}
