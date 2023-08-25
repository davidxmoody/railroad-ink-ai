<script lang="ts">
  import DrawnTile from "../components/DrawnTile.svelte"
  import InteractiveBoard from "../components/InteractiveBoard.svelte"
  import {Board} from "../logic/board"
  import {
    routeDieA,
    routeDieB,
    specialRouteTiles,
    type Tile,
  } from "../logic/dice"

  let allTiles = [...routeDieA, ...routeDieB, ...specialRouteTiles]
  let selectedTileIndex = 0
  let board = new Board()

  function onClickSquare(y: number, x: number) {
    if (
      allTiles[selectedTileIndex] &&
      board.isValid(y, x, allTiles[selectedTileIndex])
    ) {
      board = board.set(y, x, allTiles[selectedTileIndex])
    }
  }

  function rotateTile(tile: Tile): Tile {
    return {
      0: tile[3],
      1: tile[0],
      2: tile[1],
      3: tile[2],
      overpass: tile.overpass,
    }
  }

  function flipTile(tile: Tile): Tile {
    return {
      0: tile[0],
      1: tile[3],
      2: tile[2],
      3: tile[1],
      overpass: tile.overpass,
    }
  }
</script>

<div style:margin="24px">
  <InteractiveBoard
    {board}
    selectedTile={allTiles[selectedTileIndex]}
    {onClickSquare}
  />

  <div style:margin-top="24px">
    <button
      on:click={() => {
        allTiles = allTiles.map(rotateTile)
      }}>Rotate</button
    >
    <button
      style:margin-left="8px"
      on:click={() => {
        allTiles = allTiles.map(flipTile)
      }}>Flip</button
    >
  </div>

  <div style:display="flex" style:flex-wrap="wrap" style:margin-top="24px">
    {#each allTiles as tile, i}
      <div
        class="tile-container"
        class:selected={selectedTileIndex === i}
        on:click={() => (selectedTileIndex = i)}
        on:keypress={() => (selectedTileIndex = i)}
        role="button"
        tabindex="0"
      >
        <DrawnTile {tile} />
      </div>
    {/each}
  </div>
</div>

<style>
  .tile-container {
    margin-right: 16px;
    margin-bottom: 16px;
    border: 1px solid lightgrey;
    cursor: pointer;
  }

  .selected {
    background-color: rgba(0, 200, 0, 0.3);
  }
</style>
