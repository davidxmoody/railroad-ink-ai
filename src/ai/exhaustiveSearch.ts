import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"

export default function exhaustiveSearch(gs: GameState) {
  let bestMoves: string[] | null = null
  let bestScore = -Infinity

  for (const [endGs, endMoves] of visitAllStates(gs, [], new Set())) {
    const endScore = calculateScore(endGs.board).total
    if (endScore > bestScore) {
      bestScore = endScore
      bestMoves = endMoves
    }
  }

  if (!bestMoves) throw new Error("Could not find best GameState")

  return bestMoves
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
  for (const {tile} of gs.availableTiles) {
    for (const [p, slot] of gs.board.openSlotEntries()) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
}
