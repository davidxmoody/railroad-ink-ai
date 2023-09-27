import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {shuffle} from "../logic/helpers"
import exhaustiveSearch from "./exhaustiveSearch"

type SimulationResult = {moves: string[]; score: number}

export function solveRound(gs: GameState) {
  if (gs.roundNumber === 7) {
    return exhaustiveSearch(gs)
  }

  const moves: string[] = []

  let simulationResults: SimulationResult[] = []

  while (!gs.canEndRound) {
    for (let i = 0; i < 1000; i++) {
      simulationResults.push(simulate(gs))
    }

    const openingMoves = [...getPossibleMoves(gs)]
    const openingMoveMeans = calculateOpeningMoveMeans(
      openingMoves,
      simulationResults,
    )
    const bestOpeningMove = Object.keys(openingMoveMeans).reduce((a, b) =>
      openingMoveMeans[a].mean > openingMoveMeans[b].mean ? a : b,
    )

    moves.push(bestOpeningMove)
    gs = gs.makeMoves([bestOpeningMove])
    simulationResults = simulationResults.filter((r) =>
      r.moves.includes(bestOpeningMove),
    )
  }

  return moves
}

function calculateOpeningMoveMeans(
  openingMoves: string[],
  simulationResults: SimulationResult[],
) {
  const means = openingMoves.reduce(
    (acc, move) => ({...acc, [move]: {count: 0, mean: 0}}),
    {} as Record<string, {count: number; mean: number}>,
  )

  for (const result of simulationResults) {
    for (const move of result.moves) {
      if (means[move]) {
        const oldCount = means[move].count
        const newCount = means[move].count + 1
        const oldMean = means[move].mean
        const newMean = (oldMean * oldCount + result.score) / newCount
        means[move].mean = newMean
        means[move].count = newCount
      }
    }
  }

  return means
}

function scoreSimulationResult(gs: GameState) {
  const s = calculateScore(gs.board)
  return 1.5 * s.exits + s.rail + s.road + s.center
}

function pickSimulationMove(gs: GameState) {
  return getPossibleMoves(gs).next().value
}

function simulate(
  gs: GameState,
  moves: string[] = [],
  roundEndedOnce = false,
): SimulationResult {
  if (gs.gameEnded) {
    return {moves, score: scoreSimulationResult(gs)}
  }

  const move = pickSimulationMove(gs)

  if (move) {
    const newMoves = roundEndedOnce ? moves : [...moves, move]
    return simulate(gs.makeMoves([move]), newMoves, roundEndedOnce)
  }

  return simulate(gs.endRound(), moves, true)
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
