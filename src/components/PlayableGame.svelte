<script lang="ts">
  import DiceSelection from "./DiceSelection.svelte"
  import DrawnTile from "./DrawnTile.svelte"
  import ScoreTable from "./ScoreTable.svelte"
  import {Board} from "../logic/Board"
  import {rollGameDice, specialRouteTiles} from "../logic/dice"
  import {isCenterSquare} from "../logic/helpers"
  import {ConnectionType, type Position, type TileString} from "../logic/types"
  import DrawnExit from "./DrawnExit.svelte"
  import GameState from "../logic/GameState"
  import {solveRound} from "../ai/monteCarlo"
  import calculateScore, {printNodes} from "../logic/calculateScore"

  // TODO add an undo button

  // const seed = "16"
  const seed = `${Math.random()}`
  const gameDice = rollGameDice(seed)
  let gameState = new GameState(undefined, gameDice[0])

  const placements: string[] = []

  type SelectionState =
    | {type: "noSelection"}
    | {
        type: "tileSelected"
        special: boolean
        index: number
        selectedTile: TileString
      }
    | {
        type: "tileAndPositionSelected"
        special: boolean
        index: number
        position: Position
        validTransformedTiles: TileString[]
        transformedTileIndex: number
        transformedTile: TileString
      }

  let selectionState: SelectionState = {type: "noSelection"}

  function selectTile(special: boolean, index: number) {
    selectionState = {
      type: "tileSelected",
      special,
      index,
      selectedTile: special
        ? specialRouteTiles[index]
        : gameState.roundTiles[index],
    }
  }

  function selectPosition(position: Position) {
    if (selectionState.type === "tileSelected") {
      const validTransformedTiles = gameState.board.getAllValidTransformedTiles(
        position,
        selectionState.selectedTile,
      )
      if (validTransformedTiles.length) {
        selectionState = {
          type: "tileAndPositionSelected",
          special: selectionState.special,
          index: selectionState.index,
          position,
          validTransformedTiles,
          transformedTileIndex: 0,
          transformedTile: validTransformedTiles[0],
        }
      }
    }
  }

  function transformPendingTile() {
    if (selectionState.type === "tileAndPositionSelected") {
      const transformedTileIndex =
        (selectionState.transformedTileIndex + 1) %
        selectionState.validTransformedTiles.length

      selectionState = {
        ...selectionState,
        transformedTileIndex,
        transformedTile:
          selectionState.validTransformedTiles[transformedTileIndex],
      }
    }
  }

  function commitPendingTile() {
    if (selectionState.type === "tileAndPositionSelected") {
      placements.push(
        `${selectionState.position.y}${selectionState.position.x}${
          selectionState.validTransformedTiles[
            selectionState.transformedTileIndex
          ]
        }`,
      )

      gameState = gameState.placeTile(
        selectionState.position,
        selectionState.validTransformedTiles[
          selectionState.transformedTileIndex
        ],
        selectionState,
      )
      selectionState = {type: "noSelection"}
    }
  }

  function endRound() {
    gameState = gameState.endRound(gameDice[gameState.roundNumber])
    if (gameState.gameEnded) {
      console.log({
        seed,
        score: calculateScore(gameState.board).total,
        moves: placements,
      })
    }
  }

  async function solveRoundNow() {
    const moves = solveRound(gameState)
    gameState = gameState
      .makeMoves(moves)
      .endRound(gameDice[gameState.roundNumber])
    printNodes(gameState.board, ConnectionType.ROAD)
    printNodes(gameState.board, ConnectionType.RAIL)
  }
</script>

<div class="container">
  <DiceSelection
    disabled={!gameState.canUseSpecialTile || gameState.gameEnded}
    tiles={specialRouteTiles}
    usedTileIndexes={gameState.usedSpecialTileIndexes}
    selectedTileIndex={selectionState.type !== "noSelection" &&
    selectionState.special
      ? selectionState.index
      : undefined}
    onSelectTile={(index) => selectTile(true, index)}
  />

  <div style:height="20px" />

  <div style:display="flex" style:align-items="center">
    <DiceSelection
      disabled={gameState.gameEnded}
      tiles={gameState.roundTiles}
      usedTileIndexes={gameState.usedTileIndexes}
      selectedTileIndex={selectionState.type !== "noSelection" &&
      !selectionState.special
        ? selectionState.index
        : undefined}
      onSelectTile={(index) => selectTile(false, index)}
    />

    <div class="endRoundButtonContainer">
      {#if gameState.gameEnded}
        <div>Game ended</div>
      {:else}
        <div>Round {gameState.roundNumber}/{GameState.numRounds}</div>
      {/if}
      <button
        class="endRoundButton"
        disabled={!gameState.canEndRound}
        on:click={endRound}>Next round</button
      >
      <button
        class="endRoundButton"
        disabled={gameState.gameEnded}
        on:click={solveRoundNow}>Solve round</button
      >
    </div>
  </div>

  <div style:height="20px" />

  <ScoreTable board={gameState.board} />

  <div style:height="40px" />

  <div class="board">
    {#each {length: Board.size} as _, y}
      <div style:display="flex">
        {#each {length: Board.size} as _, x}
          <div class="cell" class:centerSquare={isCenterSquare({y, x})}>
            {#if gameState.board.get({y, x})}
              <DrawnTile tile={gameState.board.get({y, x})} />
              {#if gameState.board.railNetwork.get({y, x})}
                <div class="networkOverlay">
                  {#each gameState.board.railNetwork.get({y, x}) ?? [] as c, r}
                    {#if c}
                      <div
                        style:position="absolute"
                        style:top="0"
                        style:left="25px"
                        style:width="10px"
                        style:height="30px"
                        style:border-radius="3px"
                        style:background={c.type === "link" ? "red" : "purple"}
                        style:transform-origin="bottom"
                        style:transform={`rotate(${r * 90}deg)`}
                        style:color="white"
                        style:text-align="center"
                      >
                        {c.type === "link" ? c.d : ""}
                      </div>
                    {/if}
                  {/each}
                  <div
                    style:position="absolute"
                    style:top="20px"
                    style:left="20px"
                    style:width="20px"
                    style:height="20px"
                    style:border-radius="100%"
                    style:background="red"
                  />
                </div>
              {/if}
            {:else if selectionState.type === "tileSelected"}
              {#if gameState.board.isValidWithTransform({y, x}, selectionState.selectedTile)}
                <button
                  class="cellSelectionHighlight"
                  on:click={() => selectPosition({y, x})}
                />
              {/if}
            {:else if selectionState.type === "tileAndPositionSelected" && selectionState.position.y === y && selectionState.position.x === x}
              <div class="pending">
                <DrawnTile tile={selectionState.transformedTile} />
              </div>

              <div class="cellButtonContainer">
                <div style:background="white">
                  <button
                    class="cellButton"
                    disabled={selectionState.validTransformedTiles.length <= 1}
                    on:click={transformPendingTile}>↻</button
                  >
                </div>
                <button class="cellButton" on:click={commitPendingTile}
                  >✓</button
                >
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}

    {#each Board.exitSlots.entries() as [position, exitSlot]}
      <DrawnExit {position} {exitSlot} cellSize={60} cellBorderSize={1} />
    {/each}
  </div>
</div>

<style>
  .container {
    margin: 32px;
    width: 440px;
    font-size: 14px;
    font-family: sans-serif;
  }

  .board {
    width: calc(62px * 7);
    position: relative;
    border: 3px solid black;
  }

  .cell {
    display: inline-block;
    box-sizing: content-box;
    width: 60px;
    height: 60px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    background-color: transparent;
    padding: 0;
    position: relative;
  }

  .centerSquare {
    background: lightgrey;
  }

  .pending {
    opacity: 0.5;
  }

  .cellSelectionHighlight {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border: 0;
    background-color: rgba(0, 200, 0, 0.3);
  }

  .networkOverlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.7;
  }

  .cellButtonContainer {
    position: absolute;
    display: flex;
    justify-content: space-around;
    top: 70px;
    display: flex;
    left: -20px;
    right: -20px;
    z-index: 100;
  }

  .cellButton {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }

  .endRoundButtonContainer {
    flex: 1;
    margin-left: 11px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .endRoundButton {
    padding: 4px;
    margin-top: 4px;
    font-size: inherit;
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: unset;
  }
</style>
