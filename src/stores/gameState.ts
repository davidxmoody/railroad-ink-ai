import {writable} from "svelte/store"
import type {TileString} from "../logic/types"
import {Board} from "../logic/Board"
import {rollDice} from "../logic/dice"

interface GameState {
  roundIndex: number
  availableTiles: TileString[]
  usedTileIndexes: number[]
  usedSpecialTileIndexes: number[]
  board: Board
}

function createEmptyGameState(): GameState {
  return {
    roundIndex: 0,
    availableTiles: rollDice(),
    usedTileIndexes: [],
    usedSpecialTileIndexes: [],
    board: new Board(),
  }
}

const {subscribe, set, update} = writable<GameState>(createEmptyGameState())

export default {
  subscribe,
  reset() {
    set(createEmptyGameState())
  },
  placeTile(tileIndex: number, isSpecial: boolean, board: Board) {
    if (isSpecial) {
      update((gs) => ({
        ...gs,
        usedSpecialTileIndexes: [...gs.usedSpecialTileIndexes, tileIndex],
        board,
      }))
    } else {
      update((gs) => ({
        ...gs,
        usedTileIndexes: [...gs.usedTileIndexes, tileIndex],
        board,
      }))
    }
  },
  endRound() {
    update((gs) => {
      if (gs.roundIndex >= 6) return gs

      return {
        ...gs,
        roundIndex: gs.roundIndex + 1,
        availableTiles: rollDice(),
        usedTileIndexes: [],
      }
    })
  },
}
