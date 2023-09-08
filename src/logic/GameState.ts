import {Board} from "./Board"
import {rollGameDice, rollRoundDice, specialRouteTiles} from "./dice"
import type {Position, TileString} from "./types"

export default class GameState {
  public static numRounds = 7

  public readonly gameEnded: boolean
  public readonly roundNumber: number
  public readonly usedTileIndexes: number[]
  public readonly usedSpecialTileIndexes: number[]
  public readonly usedSpecialTileThisRound: boolean
  public readonly board: Board

  private readonly diceRolls: TileString[][]

  public constructor(
    data?: {
      gameEnded: boolean
      roundNumber: number
      diceRolls: TileString[][]
      usedTileIndexes: number[]
      usedSpecialTileIndexes: number[]
      usedSpecialTileThisRound: boolean
      board: Board
    },
    seed?: string | number,
  ) {
    // TODO track if special tile has been used in the current round
    this.gameEnded = data?.gameEnded ?? false
    this.roundNumber = data?.roundNumber ?? 1
    this.diceRolls = data?.diceRolls ?? rollGameDice(seed)
    this.usedTileIndexes = data?.usedTileIndexes ?? []
    this.usedSpecialTileIndexes = data?.usedSpecialTileIndexes ?? []
    this.usedSpecialTileThisRound = data?.usedSpecialTileThisRound ?? false
    this.board = data?.board ?? new Board()
  }

  public get roundTiles() {
    return this.diceRolls[this.roundNumber - 1]
  }

  public get canUseSpecialTile() {
    return (
      this.usedSpecialTileIndexes.length < 3 && !this.usedSpecialTileThisRound
    )
  }

  public get availableTiles() {
    return [
      ...this.roundTiles
        .map((tile, index) => ({special: false, index, tile}))
        .filter(({index}) => !this.usedTileIndexes.includes(index)),
      ...specialRouteTiles
        .map((tile, index) => ({special: true, index, tile}))
        .filter(
          ({index}) =>
            this.canUseSpecialTile &&
            !this.usedSpecialTileIndexes.includes(index),
        ),
    ]
  }

  public placeTile(
    tileIndex: number,
    special: boolean,
    position: Position,
    tile: TileString,
  ) {
    const board = this.board.set(position, tile)

    if (special) {
      if (this.usedSpecialTileThisRound)
        throw new Error("Already used special tile this round")

      return new GameState({
        ...this,
        diceRolls: this.diceRolls,
        usedSpecialTileIndexes: [...this.usedSpecialTileIndexes, tileIndex],
        usedSpecialTileThisRound: true,
        board,
      })
    }

    return new GameState({
      ...this,
      diceRolls: this.diceRolls,
      usedTileIndexes: [...this.usedTileIndexes, tileIndex],
      board,
    })
  }

  public get canEndRound() {
    if (this.gameEnded) return false

    return this.roundTiles.every((tile, index) => {
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
        diceRolls: this.diceRolls,
        gameEnded: true,
      })
    }

    return new GameState({
      ...this,
      diceRolls: this.diceRolls,
      roundNumber: this.roundNumber + 1,
      roundTiles: rollRoundDice(),
      usedTileIndexes: [],
      usedSpecialTileThisRound: false,
    })
  }
}
