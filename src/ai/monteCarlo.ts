import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {getMean, shuffle} from "../logic/helpers"
import exhaustiveSearch from "./exhaustiveSearch"

export async function solveRound(gs: GameState): Promise<string[]> {
  if (gs.roundNumber === 7) {
    return exhaustiveSearch(gs)
  }

  const moves: string[] = []

  let simulationResults: Array<{moveStrings: string[]; score: number}> = []

  while (!gs.canEndRound) {
    for (let i = 0; i < 1000; i++) {
      simulationResults.push(await simulate(gs))
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

function scoreSimulationResult(gs: GameState) {
  const s = calculateScore(gs.board)
  return 1.5 * s.exits + s.rail + s.road + s.center
}

async function simulate(
  gs: GameState,
  moveStrings: string[] = [],
  roundEndedOnce = false,
) {
  if (gs.gameEnded) {
    return {moveStrings, score: scoreSimulationResult(gs)}
  }

  const move = getPossibleMoves(gs).next().value

  if (move) {
    const newMoveStrings = roundEndedOnce ? moveStrings : [...moveStrings, move]
    return simulate(gs.makeMoves([move]), newMoveStrings, roundEndedOnce)
  }

  return simulate(gs.endRound(), moveStrings, true)
}

function* getPossibleMoves(gs: GameState): Generator<string> {
  const openPositions = shuffle(gs.board.openPositions)
  const availableTiles = shuffle(gs.availableTiles)

  for (const p of openPositions) {
    for (const {tile, special} of availableTiles) {
      if (special && gs.roundNumber <= 4) continue

      const slot = gs.board.getOpenSlot(p)!
      for (const tTile of shuffle(getMeaningfulPlacements(tile, slot))) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
}
