import type {GameRecord} from "../types"
import GameState from "../../logic/GameState"
import {rollGameDice} from "../../logic/dice"
import readJsonl from "../readJsonl"
import calculateScore from "../../logic/calculateScore"
import getFeatures from "./getFeatures"

const gameRecords = readJsonl<GameRecord>("./src/data/training.jsonl")

// function* getPossibleMoves(gs: GameState): Generator<string> {
//   const openPositions = gs.board.openPositions
//   const availableTiles = gs.availableTiles

//   if (availableTiles.every(({special}) => special)) {
//     yield "END_ROUND"
//   }

//   for (const p of openPositions) {
//     for (const {tile} of availableTiles) {
//       const slot = gs.board.getOpenSlot(p)!
//       for (const tTile of getMeaningfulPlacements(tile, slot)) {
//         yield `${p.y}${p.x}${tTile}`
//       }
//     }
//   }
// }

// function* findScores(gs: GameState): Generator<number> {
//   for (const move of getPossibleMoves(gs)) {
//     if (move === "END_ROUND") {
//       yield calculateScore(gs.board).total
//     } else {
//       yield* findScores(gs.makeMoves([move]))
//     }
//   }
// }

// function findBestScore(gs: GameState) {
//   let bestScore = -Infinity
//   for (const score of findScores(gs)) {
//     if (score > bestScore) {
//       bestScore = score
//     }
//   }
//   return bestScore
// }

for (const game of gameRecords) {
  const gameTiles = rollGameDice(game.seed)

  let finalGs = new GameState(undefined, gameTiles[0])
  while (!finalGs.gameEnded) {
    finalGs = finalGs.makeMoves(game.moves[finalGs.roundNumber - 1])
    finalGs = finalGs.endRound(gameTiles[finalGs.roundNumber])
  }

  let gs = new GameState(undefined, gameTiles[0])
  for (const roundMoves of game.moves) {
    for (const move of roundMoves) {
      const p = {y: parseInt(move[0], 10), x: parseInt(move[1], 10)}
      const finalBoardWithoutMove = finalGs.board.erase(p)
      const finalScoreWithoutMove = calculateScore(finalBoardWithoutMove).total
      const scoreDiff = game.score - finalScoreWithoutMove
      const features = getFeatures(gs, move)
      console.log(JSON.stringify({scoreDiff, features}))
      gs = gs.makeMoves([move])
    }
    gs = gs.endRound(gameTiles[gs.roundNumber])
  }

  // for (const realMove of game.moves[6]) {
  //   for (const move of getPossibleMoves(gs)) {
  //     const features = getFeatures(gs, move)
  //     const bestScore = findBestScore(gs.makeMoves([move]))
  //     const scoreDiff = bestScore - game.score
  //     console.log(JSON.stringify({scoreDiff, features}))
  //   }

  //   gs = gs.makeMoves([realMove])
  // }
}
