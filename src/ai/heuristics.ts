import {Board} from "../logic/Board"
import type GameState from "../logic/GameState"
import {
  flipRotation,
  getAllTransformedTiles,
  isCenterSquare,
  rotations,
  step,
} from "../logic/helpers"
import type {OpenSlot, Position, TileString} from "../logic/types"

export function solveRound(gs: GameState) {
  while (!gs.canEndRound) {
    const moves = [...getPossibleMoves(gs)]
    if (moves.length) {
      const bestMove = moves.reduce((a, b) => (a.score > b.score ? a : b))
      gs = gs.placeTile(bestMove.p, bestMove.tTile)
    }
  }
  return gs
}

function* getPossibleMoves(gs: GameState) {
  // TODO change to be board.openSlots
  const openPositions = gs.board.openPositions
  const availableTiles = gs.availableTiles

  for (const p of openPositions) {
    const slot = gs.board.getOpenSlot(p)!

    for (const {tile, special} of availableTiles) {
      if (special && gs.roundNumber <= 4) continue

      for (const tTile of getAllTransformedTiles(tile)) {
        if (gs.board.isValid(p, tTile)) {
          const score = scoreMove(gs, p, tTile, slot)
          yield {p, tTile, score}
        }
      }
    }
  }
}

// TODO try to track networks and prioritise merging of networks?
// TODO try to track longest routes and prioritise extending them?

export function scoreMove(
  gs: GameState,
  p: Position,
  tile: TileString,
  slot: OpenSlot,
) {
  let score = 0

  if (isCenterSquare(p)) {
    score += 0.5
  }

  for (const r of rotations) {
    const adjacentP = step(p, r)

    if (!adjacentP) {
      // Off the edge of the board
      score += 0.5
      continue
    }

    const adjacentTile = gs.board.get(adjacentP)

    if (!adjacentTile) {
      // No adjacent, both leaving connections or closing off are acceptable
      // Prefer closing off in later rounds but leaving open earlier
      if (tile[r] !== "_") {
        // Closing off
        score += gs.roundNumber / 7 - 0.2
      } else {
        // Leaving open
        score += 0.5 - gs.roundNumber / 7
      }
      continue
    }

    const connection = adjacentTile[flipRotation(r)]

    if (
      (connection === "_" && tile[r] !== "_") ||
      (connection !== "_" && tile[r] === "_")
    ) {
      // Permanent error
      score -= 1
    }

    if (connection !== tile[r]) {
      // Invalid, placement cannot be made but already filtered out
      return 0
    }

    if (slot[r] === connection) {
      score += 3
      continue
    }
  }

  if (Board.exitSlots.get(p)) {
    score *= 2
  }

  return score
}
