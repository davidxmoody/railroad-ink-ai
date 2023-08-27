<script lang="ts">
  import DrawnTile from "../components/DrawnTile.svelte"
  import InteractiveBoard from "../components/InteractiveBoard.svelte"
  import ScoreTable from "../components/ScoreTable.svelte"
  import {Board} from "../logic/Board"
  import {routeDieA, routeDieB, specialRouteTiles} from "../logic/dice"
  import type {Tile} from "../logic/types"

  let allTiles = [...routeDieA, ...routeDieB, ...specialRouteTiles]
  let selectedTileIndex = 0
  let board = new Board()

  const placements = [
    //    {y: 5, x: 0, tile: {2: "D", 3: "L"}},
    //    {y: 6, x: 0, tile: {0: "D", 1: "D"}},
    //    {y: 6, x: 1, tile: {0: "D", 3: "D"}},
    //    {y: 5, x: 1, tile: {1: "D", 2: "D"}},
    //    {y: 5, x: 2, tile: {1: "D", 3: "D"}},
    //    {y: 5, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
    //    {y: 5, x: 4, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
    //    {y: 6, x: 4, tile: {0: "D", 1: "D", 2: "D"}},
    //    {y: 6, x: 5, tile: {0: "D", 2: "D", 3: "D"}},
    //    {y: 5, x: 5, tile: {0: "D", 1: "D", 2: "D", 3: "D"}},
    //    {y: 6, x: 3, tile: {0: "L", 2: "L"}},
    //    {y: 4, x: 3, tile: {0: "L", 2: "L"}},
    //    {y: 3, x: 3, tile: {0: "L", 2: "L"}},
    //    {y: 2, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
    //    {y: 0, x: 3, tile: {0: "L", 1: "D", 2: "L", 3: "D", overpass: true}},
    //    {y: 1, x: 3, tile: {0: "L", 2: "L"}},
    //    {y: 5, x: 6, tile: {1: "L", 3: "D"}},
    //    {y: 4, x: 4, tile: {1: "D", 2: "D"}},
    //    {y: 4, x: 5, tile: {2: "D", 3: "D"}},
    //    {y: 3, x: 0, tile: {2: "D", 3: "D"}},
    //    {y: 4, x: 0, tile: {0: "D", 1: "D"}},
    //    {y: 4, x: 1, tile: {2: "D", 3: "D"}},
    //    {y: 0, x: 4, tile: {0: "D", 1: "D", 3: "D"}},
    //    {y: 0, x: 5, tile: {0: "D", 1: "D", 3: "D"}},
    //    {y: 0, x: 6, tile: {0: "D", 1: "D", 3: "D"}},
    //    {y: 0, x: 2, tile: {0: "D", 1: "D", 3: "D"}},
    //    {y: 0, x: 1, tile: {0: "D", 1: "D", 3: "D"}},
    //    {y: 0, x: 0, tile: {0: "D", 1: "D", 3: "D"}},
  ] as const

  for (const {y, x, tile} of placements) {
    board = board.set({y, x}, tile)
  }

  function onClickSquare(y: number, x: number) {
    if (
      allTiles[selectedTileIndex] &&
      board.isValid({y, x}, allTiles[selectedTileIndex])
    ) {
      board = board.set({y, x}, allTiles[selectedTileIndex])
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
  <div style:display="flex">
    <InteractiveBoard
      {board}
      selectedTile={allTiles[selectedTileIndex]}
      {onClickSquare}
    />
    <div style:margin-left="24px">
      <ScoreTable {board} />
    </div>
  </div>

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
