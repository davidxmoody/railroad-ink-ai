import GameState from "../logic/GameState"
import calculateScore, {calculateExitsScore} from "../logic/calculateScore"
import getMeaningfulPlacements from "../logic/getMeaningfulPlacements"
import {
  argmax,
  encodeMove,
  parseMove,
  shuffle,
  randomPick,
} from "../logic/helpers"
import exhaustiveSearch from "./exhaustiveSearch"
import getScore from "./naiveBayesMoveScore/getScore"

type SimulationResult = {moves: string[]; score: number}

type OpeningMoveMeans = Record<string, {count: number; mean: number}>

export function solveRound(gs: GameState) {
  if (gs.roundNumber === GameState.numRounds) {
    return exhaustiveSearch(gs)
  }

  const moves: string[] = []

  let simulationResults: SimulationResult[] = []

  while (!gs.canEndRound) {
    const openingMoves = getPossibleMoves(gs)
    const openingMoveMeans = calculateOpeningMoveMeans(
      openingMoves,
      simulationResults,
    )

    for (const openingMove of openingMoves) {
      for (let i = 0; i < 10; i++) {
        const result = simulate(gs, openingMove)
        simulationResults.push(result)
        updateOpeningMoveMeans(openingMoveMeans, result)
      }
    }

    for (let i = 0; i < 4000; i++) {
      const openingMove = argmax(
        openingMoves,
        (move) => openingMoveMeans[move].mean,
      )
      const result = simulate(gs, openingMove)
      simulationResults.push(result)
      updateOpeningMoveMeans(openingMoveMeans, result)
    }

    const bestOpeningMove = argmax(
      openingMoves,
      (move) => openingMoveMeans[move].mean,
    )

    moves.push(bestOpeningMove)
    gs = gs.makeMove(bestOpeningMove)
    simulationResults = simulationResults.filter((r) =>
      r.moves.includes(bestOpeningMove),
    )
  }

  return moves
}

function updateOpeningMoveMeans(
  means: OpeningMoveMeans,
  result: SimulationResult,
) {
  for (const move of result.moves) {
    if (means[move]) {
      const oldCount = means[move].count
      const newCount = oldCount + 1
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

export function simulate(gs: GameState, openingMove?: string) {
  const moves: string[] = []

  if (openingMove) {
    moves.push(openingMove)
    gs = gs.makeMove(openingMove)
  }

  while (!gs.canEndRound) {
    const move = getRandomMove(gs, shouldUseSpecial(gs))!
    moves.push(move)
    gs = gs.makeMove(move)
  }

  const firstRoundUnfixableErrors = gs.board.countErrors().unfixable
  const firstRoundMaxExitsScoreable = calculateExitsScore(gs.board, true)

  while (!gs.gameEnded) {
    while (!gs.canEndRound) {
      const move = pickBestMove(gs, [
        getRandomMove(gs, shouldUseSpecial(gs))!,
        getRandomMove(gs, shouldUseSpecial(gs))!,
        getRandomMove(gs, shouldUseSpecial(gs))!,
        getRandomMove(gs, shouldUseSpecial(gs))!,
        getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
        // getRandomMove(gs, shouldUseSpecial(gs))!,
      ])

      gs = gs.makeMove(move)
    }
    gs = gs.endRound()
  }

  const s = calculateScore(gs.board)
  const score =
    s.exits +
    s.rail +
    s.road +
    s.center -
    firstRoundUnfixableErrors +
    firstRoundMaxExitsScoreable / 2

  return {moves, score, realScore: s.total}
}

function pickBestMove(gs: GameState, moves: string[]) {
  return argmax(moves, (move) => {
    const {p, tile} = parseMove(move)
    const slot = gs.board.getOpenSlot(p)!
    return getScore(p, tile, slot)
  })
}

export function getPossibleMoves(gs: GameState, forceNoSpecial = false) {
  const moves: string[] = []

  const openSlots = gs.board.openSlotEntries()

  const useSpecial = forceNoSpecial ? false : shouldUseSpecial(gs)
  const tiles = useSpecial ? gs.availableSpecialTiles : gs.availableTiles

  for (const [p, slot] of openSlots) {
    for (const tile of tiles) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        moves.push(encodeMove(p, tTile))
      }
    }
  }

  if (useSpecial && moves.length === 0) return getPossibleMoves(gs, true)

  return moves
}

function getRandomMove(gs: GameState, forceNoSpecial = false) {
  const openSlots = shuffle(gs.board.openSlotEntries())

  const useSpecial = forceNoSpecial ? false : shouldUseSpecial(gs)
  const tiles = shuffle(
    useSpecial ? gs.availableSpecialTiles : gs.availableTiles,
  )

  for (const [p, slot] of openSlots) {
    for (const tile of tiles) {
      const tTile = randomPick(getMeaningfulPlacements(tile, slot))
      if (tTile) return encodeMove(p, tTile)
    }
  }

  if (useSpecial) return getRandomMove(gs, true)
}

function shouldUseSpecial(gs: GameState) {
  return (
    gs.roundNumber >= 5 &&
    gs.usedTileIndexes.length === 1 &&
    gs.canUseSpecialTile
  )
}
