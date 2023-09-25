import type {GameRecord} from "../types"
import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"
import readJsonl from "../readJsonl"
import calculateScore from "../../logic/calculateScore"
import getMeaningfulPlacements from "../../logic/getMeaningfulPlacements"
import {
  ConnectionType,
  type MaybeTrackType,
  type TileString,
} from "../../logic/types"
import {isCenterSquare, rotations} from "../../logic/helpers"
import {Board} from "../../logic/Board"

const gameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

function* getPossibleMoves(gs: GameState): Generator<string> {
  const openPositions = gs.board.openPositions
  const availableTiles = gs.availableTiles

  if (availableTiles.every(({special}) => special)) {
    yield "END_ROUND"
  }

  for (const p of openPositions) {
    for (const {tile} of availableTiles) {
      const slot = gs.board.getOpenSlot(p)!
      for (const tTile of getMeaningfulPlacements(tile, slot)) {
        yield `${p.y}${p.x}${tTile}`
      }
    }
  }
}

function* findScores(gs: GameState): Generator<number> {
  for (const move of getPossibleMoves(gs)) {
    if (move === "END_ROUND") {
      yield calculateScore(gs.board).total
    } else {
      yield* findScores(gs.makeMoves([move]))
    }
  }
}

function findBestScore(gs: GameState) {
  let bestScore = -Infinity
  for (const score of findScores(gs)) {
    if (score > bestScore) {
      bestScore = score
    }
  }
  return bestScore
}

function getFeatures(gs: GameState, move: string) {
  const p = {y: parseInt(move[0], 10), x: parseInt(move[1], 10)}
  const tile = move.slice(2) as TileString
  const slot = gs.board.getOpenSlot(p)!

  const inCenter = isCenterSquare(p) ? 1 : 0
  const atExit = Board.exitSlots.get(p) ? 1 : 0

  let numMatches = 0
  let numOpen = 0
  let numEdge = 0
  let numErrors = 0

  for (const r of rotations) {
    const tileC = tile[r] as MaybeTrackType
    const slotC = slot[r] as ConnectionType

    if (tileC === ConnectionType.NONE) {
      if (slotC === ConnectionType.ROAD || slotC === ConnectionType.RAIL) {
        // May not be accurate for exits but probably good enough
        numErrors++
      }
    } else if (slotC === ConnectionType.UNFILLED) {
      numOpen++
    } else if (slotC === ConnectionType.EDGE) {
      numEdge++
    } else if (slotC === ConnectionType.ROAD || slotC === ConnectionType.RAIL) {
      numMatches++
    } else {
      numErrors++
    }
  }

  return [inCenter, atExit, numMatches, numOpen, numEdge, numErrors]
}

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)

  let gs = new GameState(undefined, gameTiles[0])

  while (gs.roundNumber !== 7) {
    gs = gs.makeMoves(game.moves[gs.roundNumber - 1])
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }

  for (const realMove of game.moves[6]) {
    for (const move of getPossibleMoves(gs)) {
      const features = getFeatures(gs, move)
      const bestScore = findBestScore(gs.makeMoves([move]))
      const scoreDiff = bestScore - game.score
      console.log(JSON.stringify({scoreDiff, features}))
    }

    gs = gs.makeMoves([realMove])
  }
}
