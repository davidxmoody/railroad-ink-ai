import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {argmax, shuffle} from "../logic/helpers"
import exhaustiveSearch from "./exhaustiveSearch"

type SimulationResult = {moves: string[]; score: number}

type OpeningMoveMeans = Record<string, {count: number; mean: number}>

export function solveRound(gs: GameState) {
  if (gs.roundNumber === 7) {
    return exhaustiveSearch(gs)
  }

  const moves: string[] = []

  let simulationResults: SimulationResult[] = []

  while (!gs.canEndRound) {
    const openingMoves = [...getPossibleMoves(gs)]
    const openingMoveMeans = calculateOpeningMoveMeans(
      openingMoves,
      simulationResults,
    )

    // TODO try visualising distributions of scores from simulating a single
    // end round state, see what distribution it falls into in different rounds

    for (const openingMove of openingMoves) {
      const result = simulateWithOpeningMove(gs, openingMove)
      simulationResults.push(result)
      updateOpeningMoveMeans(openingMoveMeans, result)
    }

    for (let i = 0; i < 4000; i++) {
      const openingMove = selectNextOpeningMove(openingMoves, openingMoveMeans)
      const result = simulateWithOpeningMove(gs, openingMove)
      simulationResults.push(result)
      updateOpeningMoveMeans(openingMoveMeans, result)
      // console.log(openingMoves.map(move => openingMoveMeans[move].mean).join("	"))
    }

    const bestOpeningMove = argmax(
      openingMoves,
      (move) => openingMoveMeans[move].mean,
    )

    moves.push(bestOpeningMove)
    gs = gs.makeMoves([bestOpeningMove])
    simulationResults = simulationResults.filter((r) =>
      r.moves.includes(bestOpeningMove),
    )

    // throw new Error("End")
  }

  return moves
}

function selectNextOpeningMove(moves: string[], means: OpeningMoveMeans) {
  const explorationConstant = 1
  const logTotalCount = Math.log2(
    Object.values(means).reduce((acc, {count}) => acc + count, 0) + 1,
  )

  return argmax(
    moves,
    (move) =>
      means[move].mean +
      explorationConstant * Math.sqrt(logTotalCount / means[move].count),
  )
}

function updateOpeningMoveMeans(
  means: OpeningMoveMeans,
  result: SimulationResult,
) {
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

function calculateOpeningMoveMeans(
  openingMoves: string[],
  simulationResults: SimulationResult[],
) {
  const means = openingMoves.reduce(
    (acc, move) => ({...acc, [move]: {count: 0, mean: 0}}),
    {} as OpeningMoveMeans,
  )

  for (const result of simulationResults) {
    updateOpeningMoveMeans(means, result)
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

function simulateWithOpeningMove(gs: GameState, openingMove: string) {
  return simulate(gs.makeMoves([openingMove]), [openingMove])
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
