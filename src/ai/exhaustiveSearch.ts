import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {isSpecial} from "../logic/helpers"
import type {TileString} from "../logic/types"

// { total: 300, neverUsedSpecial: 7, couldUseNoSpecial: 28 }

const stats = {
  total: 0,
  neverUsedSpecial: 0,
  couldUseNoSpecial: 0,
}

export default function exhaustiveSearch(gs: GameState) {
  let bestMoves: string[][] = []
  let bestScore = -Infinity

  for (const [endGs, endMoves] of visitAllStates(gs, [], new Set())) {
    const endScore = calculateScore(endGs.board).total
    if (endScore > bestScore) {
      bestScore = endScore
      bestMoves = [endMoves]
    } else if (endScore === bestScore) {
      bestMoves.push(endMoves)
    }
  }

  const specialUsage = bestMoves.map((moves) =>
    moves.some((move) => isSpecial(move.slice(2) as TileString)),
  )

  const neverUsedSpecial = specialUsage.every((x) => !x)
  const couldUseNoSpecial = specialUsage.some((x) => !x)

  stats.total++
  if (neverUsedSpecial) stats.neverUsedSpecial++
  if (couldUseNoSpecial) stats.couldUseNoSpecial++

  console.log(stats)

  return bestMoves[0]
}

function* visitAllStates(
  gs: GameState,
  moves: string[],
  encounteredStates: Set<string>,
): Generator<[GameState, string[]]> {
  if (gs.canEndRound) {
    yield [gs, moves]
  }

  for (const move of getPossibleMoves(gs)) {
    const newMoves = [...moves, move]
    const key = [...newMoves].sort().join("")
    if (encounteredStates.has(key)) continue
    encounteredStates.add(key)
    yield* visitAllStates(gs.makeMoves([move]), newMoves, encounteredStates)
  }
}

function* getPossibleMoves(gs: GameState): Generator<string> {
  for (const {tile, special} of gs.availableTiles) {
    if (special && gs.usedTileIndexes.length !== 1) continue

    for (const [p, slot] of gs.board.openSlotEntries()) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
}
