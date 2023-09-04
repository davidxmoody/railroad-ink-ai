import {Board} from "./Board"
import {rollDice} from "./dice"
import type {Position, TileString} from "./types"

export default class GameState {
  public static numRounds = 7

  public readonly roundNumber: number | null
  public readonly availableTiles: TileString[]
  public readonly usedTileIndexes: number[]
  public readonly usedSpecialTileIndexes: number[]
  public readonly board: Board

  public constructor(data?: {
    roundNumber: number | null
    availableTiles: TileString[]
    usedTileIndexes: number[]
    usedSpecialTileIndexes: number[]
    board: Board
  }) {
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

  public endRound() {
    // TODO check for unused available tiles (unless no valid positions remain)

    if (this.roundNumber === null) throw new Error("Game already ended")

    if (this.roundNumber === GameState.numRounds) {
      return new GameState({
        ...this,
        roundNumber: null,
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
