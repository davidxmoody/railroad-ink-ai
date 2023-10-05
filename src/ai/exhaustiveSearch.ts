import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {encodeMove} from "../logic/helpers"

export default function exhaustiveSearch(gs: GameState) {
  let bestMoves: string[] = []
  let bestScore = -Infinity

  for (const [endGs, endMoves] of visitAllStates(gs, [], new Set())) {
    const endScore = calculateScore(endGs.board).total
    if (endScore > bestScore) {
      bestScore = endScore
      bestMoves = endMoves
    }
  }

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
    yield* visitAllStates(gs.makeMove(move), newMoves, encounteredStates)
  }
}

function* getPossibleMoves(gs: GameState): Generator<string> {
  const tiles = gs.availableTiles

  if (gs.usedTileIndexes.length === 1 && gs.canUseSpecialTile) {
    tiles.push(...gs.availableSpecialTiles)
  }

  for (const [p, slot] of gs.board.openSlotEntries()) {
    for (const tile of tiles) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        yield encodeMove(p, tTile)
      }
    }
  }
}
