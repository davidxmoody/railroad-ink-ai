<script lang="ts">
  import type {TileString} from "../logic/types"
  import DrawnTile from "./DrawnTile.svelte"

  export let tiles: TileString[]
  export let usedTileIndexes: number[]
  export let selectedTileIndex: number | undefined
  export let onSelectTile: (index: number) => void
</script>

<div style:display="flex">
  {#each tiles as tile, index}
    <div style:opacity={usedTileIndexes.includes(index) ? 0.2 : 1}>
      <button
        class="tile-container"
        class:selected={selectedTileIndex === index}
        disabled={usedTileIndexes.includes(index)}
        on:click={() => usedTileIndexes.includes(index) || onSelectTile(index)}
      >
        <DrawnTile {tile} size={60} />
      </button>
    </div>
  {/each}
</div>

<style>
  .tile-container {
    margin-right: 16px;
    margin-bottom: 16px;
    border: 1px solid lightgrey;
    cursor: pointer;
    background: transparent;
    padding: 0;
  }

  .selected {
    background-color: rgba(0, 200, 0, 0.3);
  }
</style>
