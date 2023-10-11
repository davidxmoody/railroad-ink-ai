import {Board} from "./Board"
import {rollRoundDice, specialRouteTiles} from "./dice"
import {getAllTransformedTiles, parseMove} from "./helpers"
import type {Position, TileString} from "./types"

export default class GameState {
  public static numRounds = 7

  public readonly gameEnded: boolean
  public readonly roundNumber: number
  public readonly roundTiles: TileString[]
  public readonly usedTileIndexes: number[]
  public readonly usedSpecialTileIndexes: number[]
  public readonly usedSpecialTileThisRound: boolean
  public readonly board: Board

  public constructor(
    data?: {
      gameEnded: boolean
      roundNumber: number
      roundTiles: TileString[]
      usedTileIndexes: number[]
      usedSpecialTileIndexes: number[]
      usedSpecialTileThisRound: boolean
      board: Board
    },
    roundTilesOverride?: TileString[],
  ) {
    this.gameEnded = data?.gameEnded ?? false
    this.roundNumber = data?.roundNumber ?? 1
    this.roundTiles = roundTilesOverride ?? data?.roundTiles ?? rollRoundDice()
    this.usedTileIndexes = data?.usedTileIndexes ?? []
    this.usedSpecialTileIndexes = data?.usedSpecialTileIndexes ?? []
    this.usedSpecialTileThisRound = data?.usedSpecialTileThisRound ?? false
    this.board = data?.board ?? new Board()
  }

  public get canUseSpecialTile() {
    return (
      this.usedSpecialTileIndexes.length < 3 && !this.usedSpecialTileThisRound
    )
  }

  public get availableSpecialTiles() {
    if (!this.canUseSpecialTile) return []
    return specialRouteTiles.filter(
      (_, i) => !this.usedSpecialTileIndexes.includes(i),
    )
  }

  public get availableTiles() {
    return this.roundTiles
      .filter((_, i) => !this.usedTileIndexes.includes(i))
      .filter((tile, i, list) => i === list.indexOf(tile))
  }

  public placeTile(
    position: Position,
    transformedTile: TileString,
    tileIndexHintForUI?: {index: number; special: boolean},
  ) {
    const allTransformedTiles = new Set(getAllTransformedTiles(transformedTile))

    const regularTileIndex =
      tileIndexHintForUI && tileIndexHintForUI.special === false
        ? tileIndexHintForUI.index
        : this.roundTiles.findIndex((roundTile, index) => {
            if (this.usedTileIndexes.includes(index)) return false
            return allTransformedTiles.has(roundTile)
          })

    if (regularTileIndex !== -1) {
      return new GameState({
        ...this,
        usedTileIndexes: [...this.usedTileIndexes, regularTileIndex],
        board: this.board.set(position, transformedTile),
      })
    }

    const specialTileIndex = specialRouteTiles.findIndex(
      (specialTile, index) => {
        if (this.usedSpecialTileIndexes.includes(index)) return false
        return allTransformedTiles.has(specialTile)
      },
    )

    if (specialTileIndex !== -1) {
      if (!this.canUseSpecialTile)
        throw new Error("Cannot place special tile this round")

      return new GameState({
        ...this,
        usedSpecialTileIndexes: [
          ...this.usedSpecialTileIndexes,
          specialTileIndex,
        ],
        usedSpecialTileThisRound: true,
        board: this.board.set(position, transformedTile),
      })
    }

    throw new Error("Could not find tile to place")
  }

  public makeMove(move: string) {
    const {p, t} = parseMove(move)
    return this.placeTile(p, t)
  }

  public makeMoves(moves: string[]) {
    return moves.reduce((gs, move) => gs.makeMove(move), this as GameState)
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

  public endRound(newRoundDice?: TileString[]) {
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
      roundTiles: newRoundDice ?? rollRoundDice(),
      usedTileIndexes: [],
      usedSpecialTileThisRound: false,
    })
  }
}
