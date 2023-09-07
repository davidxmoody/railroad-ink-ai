import {Board} from "../logic/Board"
import type GameState from "../logic/GameState"

// Scores 2.466 average over 1000 runs

export function solve(gs: GameState) {
  while (!gs.gameEnded) {
    while (!gs.canEndRound) {
      gs.availableTiles.forEach((tile, tileIndex) => {
        if (gs.usedTileIndexes.includes(tileIndex)) return

        for (let y = 0; y < Board.size; y++) {
          for (let x = 0; x < Board.size; x++) {
            const transformedTile = gs.board.getAllValidTransformedTiles(
              {y, x},
              tile,
            )[0]

            if (transformedTile) {
              gs = gs.placeTile(tileIndex, false, {y, x}, transformedTile)
              return
            }
          }
        }
      })
    }
    gs = gs.endRound()
  }
  return gs
}
