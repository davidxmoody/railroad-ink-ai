<script lang="ts">
  import DrawnTile from "../components/DrawnTile.svelte"
  import InteractiveBoard from "../components/InteractiveBoard.svelte"
  import ScoreTable from "../components/ScoreTable.svelte"
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

  const placements = [
//    {y: 5, x: 0, tile: {2: "d", 3: "l"}},
//    {y: 6, x: 0, tile: {0: "d", 1: "d"}},
//    {y: 6, x: 1, tile: {0: "d", 3: "d"}},
//    {y: 5, x: 1, tile: {1: "d", 2: "d"}},
//    {y: 5, x: 2, tile: {1: "d", 3: "d"}},
//    {y: 5, x: 3, tile: {0: "l", 1: "d", 2: "l", 3: "d", overpass: true}},
//    {y: 5, x: 4, tile: {0: "d", 1: "d", 2: "d", 3: "d"}},
//    {y: 6, x: 4, tile: {0: "d", 1: "d", 2: "d"}},
//    {y: 6, x: 5, tile: {0: "d", 2: "d", 3: "d"}},
//    {y: 5, x: 5, tile: {0: "d", 1: "d", 2: "d", 3: "d"}},
//    {y: 6, x: 3, tile: {0: "l", 2: "l"}},
//    {y: 4, x: 3, tile: {0: "l", 2: "l"}},
//    {y: 3, x: 3, tile: {0: "l", 2: "l"}},
//    {y: 2, x: 3, tile: {0: "l", 1: "d", 2: "l", 3: "d", overpass: true}},
//    {y: 0, x: 3, tile: {0: "l", 1: "d", 2: "l", 3: "d", overpass: true}},
//    {y: 1, x: 3, tile: {0: "l", 2: "l"}},
//    {y: 5, x: 6, tile: {1: "l", 3: "d"}},
//    {y: 4, x: 4, tile: {1: "d", 2: "d"}},
//    {y: 4, x: 5, tile: {2: "d", 3: "d"}},
//    {y: 3, x: 0, tile: {2: "d", 3: "d"}},
//    {y: 4, x: 0, tile: {0: "d", 1: "d"}},
//    {y: 4, x: 1, tile: {2: "d", 3: "d"}},
//    {y: 0, x: 4, tile: {0: "d", 1: "d", 3: "d"}},
//    {y: 0, x: 5, tile: {0: "d", 1: "d", 3: "d"}},
//    {y: 0, x: 6, tile: {0: "d", 1: "d", 3: "d"}},
//    {y: 0, x: 2, tile: {0: "d", 1: "d", 3: "d"}},
//    {y: 0, x: 1, tile: {0: "d", 1: "d", 3: "d"}},
//    {y: 0, x: 0, tile: {0: "d", 1: "d", 3: "d"}},
  ] as const

  for (const {y, x, tile} of placements) {
    board = board.set(y, x, tile)
  }

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
