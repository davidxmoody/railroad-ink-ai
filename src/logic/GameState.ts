import {Board} from "./Board"
import {rollDice} from "./dice"
import type {Position, TileString} from "./types"

export default class GameState {
  public static numRounds = 7

  public readonly gameEnded: boolean
  public readonly roundNumber: number
  public readonly availableTiles: TileString[]
  public readonly usedTileIndexes: number[]
  public readonly usedSpecialTileIndexes: number[]
  public readonly board: Board

  public constructor(data?: {
    gameEnded: boolean
    roundNumber: number
    availableTiles: TileString[]
    usedTileIndexes: number[]
    usedSpecialTileIndexes: number[]
    board: Board
  }) {
    this.gameEnded = data?.gameEnded ?? false
    this.roundNumber = data?.roundNumber ?? 1
    this.availableTiles = data?.availableTiles ?? rollDice()
    this.usedTileIndexes = data?.usedTileIndexes ?? []
    this.usedSpecialTileIndexes = data?.usedSpecialTileIndexes ?? []
    this.board = data?.board ?? new Board()
  }

  public placeTile(
    tileIndex: number,
    special: boolean,
    position: Position,
    tile: TileString,
  ) {
    const board = this.board.set(position, tile)

    if (special) {
      return new GameState({
        ...this,
        usedSpecialTileIndexes: [...this.usedSpecialTileIndexes, tileIndex],
        board,
      })
    }

    return new GameState({
      ...this,
      usedTileIndexes: [...this.usedTileIndexes, tileIndex],
      board,
    })
  }

  public get canEndRound() {
    if (this.gameEnded) return false

    return this.availableTiles.every((tile, index) => {
      if (this.usedTileIndexes.includes(index)) return true

      for (let y = 0; y < Board.size; y++) {
        for (let x = 0; x < Board.size; x++) {
          if (this.board.isValidWithTransform({y, x}, tile)) return false
        }
      }

      return true
    })
  }

  public endRound() {
    if (!this.canEndRound) throw new Error("Cannot end round")

    if (this.roundNumber === GameState.numRounds) {
      return new GameState({
        ...this,
        gameEnded: true,
      })
    }

    return new GameState({
      ...this,
      roundNumber: this.roundNumber + 1,
      availableTiles: rollDice(),
      usedTileIndexes: [],
    })
  }
}
