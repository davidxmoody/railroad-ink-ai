<script lang="ts">
  import DiceSelection from "./DiceSelection.svelte"
  import DrawnTile from "./DrawnTile.svelte"
  import ScoreTable from "./ScoreTable.svelte"
  import {Board} from "../logic/Board"
  import {specialRouteTiles} from "../logic/dice"
  import {addRotation, isCenterSquare, transformTile} from "../logic/helpers"
  import type {Position, Transform} from "../logic/types"
  import gameState from "../stores/gameState"
  import DrawnExit from "./DrawnExit.svelte"

  type SelectionState =
    | {type: "noSelection"}
    | {type: "tileSelected"; special: boolean; index: number}
    | {
        type: "tileAndPositionSelected"
        special: boolean
        index: number
        position: Position
        transform: Transform
      }

  let selectionState: SelectionState = {type: "noSelection"}

  $: selectedTile =
    selectionState.type !== "noSelection"
      ? transformTile(
          selectionState.special
            ? specialRouteTiles[selectionState.index]
            : $gameState.availableTiles[selectionState.index],
          selectionState.type === "tileAndPositionSelected"
            ? selectionState.transform
            : {},
        )
      : undefined
</script>

<div class="container">
  <DiceSelection
    tiles={specialRouteTiles}
    usedTileIndexes={$gameState.usedSpecialTileIndexes}
    selectedTileIndex={selectionState.type !== "noSelection" &&
    selectionState.special
      ? selectionState.index
      : undefined}
    onSelectTile={(index) =>
      (selectionState = {type: "tileSelected", special: true, index})}
  />

  <DiceSelection
    tiles={$gameState.availableTiles}
    usedTileIndexes={$gameState.usedTileIndexes}
    selectedTileIndex={selectionState.type !== "noSelection" &&
    !selectionState.special
      ? selectionState.index
      : undefined}
    onSelectTile={(index) =>
      (selectionState = {type: "tileSelected", special: false, index})}
  />

  <div style:margin-bottom="16px">
    <ScoreTable board={$gameState.board} />
  </div>

  <div class="board">
    {#each {length: Board.size} as _, y}
      <div class="boardRow">
        {#each {length: Board.size} as _, x}
          <button
            class="cell"
            class:centerSquare={isCenterSquare({y, x})}
            class:validPlacement={selectedTile &&
              $gameState.board.isValidWithTransform({y, x}, selectedTile)}
            class:pending={selectionState.type === "tileAndPositionSelected" &&
              selectionState.position.y === y &&
              selectionState.position.x === x}
            on:click={() => {
              if (selectionState.type !== "noSelection") {
                selectionState = {
                  type: "tileAndPositionSelected",
                  special: selectionState.special,
                  index: selectionState.index,
                  position: {y, x},
                  transform: {rotation: 0},
                }
              }
            }}
          >
            <DrawnTile
              tile={selectionState.type === "tileAndPositionSelected" &&
              selectionState.position.y === y &&
              selectionState.position.x === x
                ? selectedTile
                : $gameState.board.get({y, x})}
              size={60}
            />
          </button>
        {/each}
      </div>
    {/each}

    {#each Board.exits as exit}
      <DrawnExit {exit} cellSize={60} cellBorderSize={1} />
    {/each}
  </div>

  <div style:margin-top="24px">
    <button
      on:click={() => {
        if (selectionState.type === "tileAndPositionSelected") {
          selectionState = {
            ...selectionState,
            transform: {
              ...selectionState.transform,
              rotation: addRotation(selectionState.transform.rotation ?? 0, 1),
            },
          }
        }
      }}>Rotate</button
    >
    <button
      style:margin-left="8px"
      on:click={() => {
        if (selectionState.type === "tileAndPositionSelected") {
          selectionState = {
            ...selectionState,
            transform: {
              ...selectionState.transform,
              flip: !selectionState.transform.flip,
            },
          }
        }
      }}>Flip</button
    >
    <button
      style:margin-left="8px"
      on:click={() => {
        if (
          selectedTile &&
          selectionState.type === "tileAndPositionSelected" &&
          $gameState.board.isValid(selectionState.position, selectedTile)
        ) {
          gameState.placeTile(
            selectionState.index,
            selectionState.special,
            $gameState.board.set(selectionState.position, selectedTile),
          )
          selectionState = {type: "noSelection"}
        }
      }}>Confirm</button
    >
    <button
      style:margin-left="8px"
      on:click={() => {
        gameState.endRound()
      }}>End round</button
    >
  </div>
</div>

<style>
  .container {
    margin: 24px;
    width: 448px;
  }

  .board {
    width: calc(62px * 7);
    position: relative;
    border: 3px solid black;
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .boardRow {
    display: flex;
  }

  .cell {
    display: inline-block;
    box-sizing: content-box;
    width: 60px;
    height: 60px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    cursor: pointer;
    background-color: transparent;
    padding: 0;
  }

  .centerSquare {
    background: lightgrey;
  }

  .validPlacement {
    background-color: rgba(0, 200, 0, 0.3);
  }

  .pending {
    opacity: 0.5;
  }
</style>
