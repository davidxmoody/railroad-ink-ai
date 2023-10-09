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
    const openingMoves = getPossibleMoves(gs, shouldUseSpecial(gs))
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

export function simulate(gs: GameState, openingMove: string) {
  const moves = [openingMove]
  gs = gs.makeMove(openingMove)

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
    // const {p, tile} = parseMove(move)
    // const slot = gs.board.getOpenSlot(p)!
    // let numMatches = 0
    // for (const r of rotations) {
    //   if ((tile[r] === "D" || tile[r] === "L") && tile[r] === slot[r])
    //     numMatches++
    // }
    // return numMatches
  })
}

export function getPossibleMoves(gs: GameState, useSpecial: boolean) {
  const moves: string[] = []

  const openSlots = gs.board.openSlotEntries()
  const tiles = useSpecial ? gs.availableSpecialTiles : gs.availableTiles

  for (const [p, slot] of openSlots) {
    for (const tile of tiles) {
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        moves.push(encodeMove(p, tTile))
      }
    }
  }

  if (useSpecial && moves.length === 0) return getPossibleMoves(gs, false)

  return moves
}

// const getGoodPlacement = memo2(
//   (tile: TileString, slot: OpenSlot): TileString | undefined => {
//     const placements = getMeaningfulPlacements(tile, slot)
//     if (placements.length === 0) return undefined
//     return argmax(placements, (tTile) => getScore({y: 0, x: 0}, tTile, slot))
//   },
// )

export function getRandomMove(gs: GameState, useSpecial: boolean) {
  const openSlots = shuffle(gs.board.openSlotEntries())
  const tiles = shuffle(
    useSpecial ? gs.availableSpecialTiles : gs.availableTiles,
  )

  for (const [p, slot] of openSlots) {
    for (const tile of tiles) {
      const tTile = randomPick(getMeaningfulPlacements(tile, slot))
      if (tTile) return encodeMove(p, tTile)
    }
  }

  if (useSpecial) return getRandomMove(gs, false)
}

export function shouldUseSpecial(gs: GameState) {
  return (
    gs.roundNumber >= 5 &&
    gs.usedTileIndexes.length === 1 &&
    gs.canUseSpecialTile
  )
}
