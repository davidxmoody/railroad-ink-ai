<script lang="ts">
  import type {TileString} from "../logic/types"
  import DrawnTile from "./DrawnTile.svelte"

  export let tiles: TileString[]
  export let usedTileIndexes: number[]
  export let selectedTileIndex: number | undefined
  export let onSelectTile: (index: number) => void
</script>

<div class="container">
  {#each tiles as tile, index}
    <button
      class="tileContainer"
      class:selected={selectedTileIndex === index}
      disabled={usedTileIndexes.includes(index)}
      on:click={() => usedTileIndexes.includes(index) || onSelectTile(index)}
    >
      <DrawnTile {tile} size={60} />
    </button>
  {/each}
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
  }

  .tileContainer {
    border: 2px solid black;
    border-radius: 10px;
    cursor: pointer;
    background: transparent;
    padding: 0;
    margin: 1px;
  }

  .tileContainer:disabled {
    opacity: 0.2;
    cursor: unset;
  }

  .tileContainer.selected {
    background-color: rgba(0, 200, 0, 0.3);
  }
</style>
