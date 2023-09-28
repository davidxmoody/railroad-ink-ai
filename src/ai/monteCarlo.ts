import type GameState from "../logic/GameState"
import calculateScore from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {argmax, shuffle} from "../logic/helpers"
import exhaustiveSearch from "./exhaustiveSearch"

type SimulationResult = {moves: string[]; score: number}

type OpeningMoveMeans = Record<string, {count: number; mean: number}>

const regrets: number[] = []

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
      for (let i = 0; i < 10; i++) {
        const result = simulateWithOpeningMove(gs, openingMove)
        simulationResults.push(result)
        updateOpeningMoveMeans(openingMoveMeans, result)
      }
    }

    for (let i = 0; i < 4000; i++) {
      const openingMove = selectNextOpeningMove(openingMoves, openingMoveMeans)
      const result = simulateWithOpeningMove(gs, openingMove)
      simulationResults.push(result)
      updateOpeningMoveMeans(openingMoveMeans, result)
      // if (gs.roundNumber === 5)
      //   console.log(
      //     openingMoves.map((move) => openingMoveMeans[move].mean).join("	"),
      //   )
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

    // if (gs.roundNumber === 5) throw new Error("End")

    // console.log(
    //   "Regret",
    //   gs.roundNumber,
    //   moves.length,
    //   calculateRegret(openingMoveMeans).toFixed(3),
    // )
    regrets.push(calculateRegret(openingMoveMeans))
  }

  // if (gs.roundNumber === 6) console.log("Avg regret", getMean(regrets))

  return moves
}

function calculateRegret(means: OpeningMoveMeans) {
  const bestMean = argmax(Object.values(means), ({mean}) => mean).mean
  let totalCount = 0
  let totalRegret = 0
  for (const {count, mean} of Object.values(means)) {
    totalCount += count
    totalRegret += (bestMean - mean) * count
  }
  return totalRegret / totalCount
}

function selectNextOpeningMove(moves: string[], means: OpeningMoveMeans) {
  // constant=0, avg=54.4
  // constant=0.5, avg=54.6
  // constant=5, avg=54.4
  // constant=50, avg=54.1
  // constant=5 only first move, avg=54.3
  // constant=0 only first move, avg=47.5 (stopped early)
  // just mean, 0.1 errors but otherwise full score, avg=54.4
  // just mean, 0.1 errors but otherwise full score, 10 initial on every state, avg=54.6
  // just mean, 0.1 errors but otherwise full score, 10 initial on every state, using s.total instead of less for errors, avg=50.1

  // const explorationConstant = 0
  // const logTotalCount = Math.log2(
  //   Object.values(means).reduce((acc, {count}) => acc + count, 0) + 1,
  // )

  return argmax(
    moves,
    (move) => means[move].mean,
    // + explorationConstant * Math.sqrt(logTotalCount / means[move].count),
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
  return s.exits + s.rail + s.road + s.center + 0.1 * s.errors
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
