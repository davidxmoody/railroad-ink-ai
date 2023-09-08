<script lang="ts">
  import type {TileString} from "../logic/types"
  import DrawnTile from "./DrawnTile.svelte"

  export let disabled = false
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
      class:used={usedTileIndexes.includes(index)}
      disabled={usedTileIndexes.includes(index) || disabled}
      on:click={() => usedTileIndexes.includes(index) || onSelectTile(index)}
    >
      <DrawnTile {tile} size={60} />
    </button>
  {/each}
</div>

<style>
  .container {
    display: flex;
  }

  .tileContainer {
    border: 2px solid black;
    border-radius: 10px;
    cursor: pointer;
    background: transparent;
    padding: 0;
    margin-right: 11px;
  }

  .tileContainer:disabled {
    cursor: not-allowed;
  }

  .tileContainer.used {
    opacity: 0.2;
  }

  .tileContainer.selected {
    background-color: rgba(0, 200, 0, 0.3);
  }

  .tileContainer:last-child {
    margin-right: 0;
  }
</style>
