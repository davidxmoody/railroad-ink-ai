<script lang="ts">
  import DiceSelection from "./DiceSelection.svelte"
  import DrawnTile from "./DrawnTile.svelte"
  import ScoreTable from "./ScoreTable.svelte"
  import {Board} from "../logic/Board"
  import {specialRouteTiles} from "../logic/dice"
  import {addRotation, isCenterSquare, transformTile} from "../logic/helpers"
  import type {Position, Transform} from "../logic/types"
  import gameState from "../stores/gameState"

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

  <div style:display="flex">
    <div>
      {#each {length: Board.size} as _, y}
        <div style:display="flex">
          {#each {length: Board.size} as _, x}
            <button
              class="cell"
              class:center-square={isCenterSquare({y, x})}
              class:valid-placement={selectedTile &&
                $gameState.board.isValidWithTransform({y, x}, selectedTile)}
              class:pending={selectionState.type ===
                "tileAndPositionSelected" &&
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

              {#each Board.exits.filter((e) => e.y === y && e.x === x) as exit}
                <div
                  class="exit"
                  style:background={exit.t === "L" ? "red" : "blue"}
                  style:transform={`rotate(${90 * exit.r}deg)`}
                />
              {/each}
            </button>
          {/each}
        </div>
      {/each}

      <div style:margin-top="24px">
        <button
          on:click={() => {
            if (selectionState.type === "tileAndPositionSelected") {
              selectionState = {
                ...selectionState,
                transform: {
                  ...selectionState.transform,
                  rotation: addRotation(
                    selectionState.transform.rotation ?? 0,
                    1,
                  ),
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
  </div>
</div>

<style>
  .container {
    margin: 24px;
    width: 448px;
  }

  .cell {
    box-sizing: content-box;
    width: 60px;
    height: 60px;
    border-width: 1px;
    border-style: solid;
    border-color: lightgrey;
    color: lightgrey;
    margin: 1px;
    cursor: pointer;
    position: relative;
    background-color: transparent;
    padding: 0;
  }

  .center-square {
    border-color: grey;
  }

  .valid-placement {
    background-color: rgba(0, 200, 0, 0.3);
  }

  .pending {
    opacity: 0.5;
  }

  .exit {
    position: absolute;
    width: 20px;
    height: 5px;
    top: 0;
    left: 20px;
    transform-origin: center 30px;
  }
</style>
