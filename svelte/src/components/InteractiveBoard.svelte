<script lang="ts">
  import {Board} from "../logic/board"
  import type {Tile} from "../logic/dice"
  import DrawnTile from "./DrawnTile.svelte"

  let board: Board
  let selectedTile: Tile | null
  let onClickSquare: (y: number, x: number) => void

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
            board.isValid(y, x, selectedTile)}
          on:click={() => onClickSquare(y, x)}
        >
          <DrawnTile tile={board.get(y, x)} />

          {#each board.getOpenConnections(y, x) as c}
            <div
              class="connection"
              style:background={c.t === "l" ? "red" : "blue"}
              style:transform={`rotate(${90 * c.r}deg)`}
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
  }

  .center-square {
    border-color: grey;
  }

  .valid-placement {
    background-color: rgba(0, 200, 0, 0.3);
  }

  .connection {
    position: absolute;
    width: 10px;
    height: 10px;
    top: 0;
  }
</style>
