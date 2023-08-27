<script lang="ts">
  import {Board} from "../logic/Board"
  import type {Tile} from "../logic/types"
  import DrawnTile from "./DrawnTile.svelte"

  export let board: Board
  export let selectedTile: Tile | undefined
  export let onClickSquare: (y: number, x: number) => void

  function isCenterSquare(y: number, x: number) {
    return y >= 2 && y <= 4 && x >= 2 && x <= 4
  }
</script>

<div>
  {#each {length: Board.size} as _, y}
    <div style:display="flex">
      {#each {length: Board.size} as _, x}
        <div
          class="cell"
          class:center-square={isCenterSquare(y, x)}
          class:valid-placement={selectedTile &&
            board.isValid({y, x}, selectedTile)}
          on:click={() => onClickSquare(y, x)}
          on:keypress={() => onClickSquare(y, x)}
          role="button"
          tabindex="0"
        >
          <DrawnTile tile={board.get({y, x})} size={60} />

          {#each Board.exits.filter((e) => e.y === y && e.x === x) as exit}
            <div
              class="exit"
              style:background={exit.t === "L" ? "red" : "blue"}
              style:transform={`rotate(${90 * exit.r}deg)`}
            />
          {/each}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .cell {
    width: 60px;
    height: 60px;
    border-width: 1px;
    border-style: solid;
    border-color: lightgrey;
    color: lightgrey;
    margin: 1px;
    cursor: pointer;
    position: relative;
  }

  .center-square {
    border-color: grey;
  }

  .valid-placement {
    background-color: rgba(0, 200, 0, 0.3);
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
