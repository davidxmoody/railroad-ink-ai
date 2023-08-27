<script lang="ts">
  import {rotations} from "../logic/helpers"
  import type {Rotation, Tile} from "../logic/types"

  export let tile: Tile | undefined
  export let size = 100

  function hasStation(tile: Tile) {
    if (tile.overpass) return false

    const hasRoad =
      tile[0] === "d" || tile[1] === "d" || tile[2] === "d" || tile[3] === "d"
    const hasRail =
      tile[0] === "l" || tile[1] === "l" || tile[2] === "l" || tile[3] === "l"

    return hasRoad && hasRail
  }

  function shouldDrawMiddleRoadEdge(tile: Tile, r: Rotation) {
    return (
      (tile[r] === undefined || (tile[r] === "l" && tile.overpass)) &&
      (tile[((r + 3) % 4) as Rotation] === "d" ||
        tile[((r + 1) % 4) as Rotation] === "d")
    )
  }

  function countTrackTypes(tile: Tile) {
    const counts = {d: 0, l: 0, e: 0}
    counts[tile[0] ?? "e"]++
    counts[tile[1] ?? "e"]++
    counts[tile[2] ?? "e"]++
    counts[tile[3] ?? "e"]++
    return counts
  }

  function hasRailCross(tile: Tile) {
    const counts = countTrackTypes(tile)
    return counts.l === 4 || (counts.l === 3 && counts.e === 1)
  }

  function hasHorizontalStraightRail(tile: Tile) {
    return (
      tile[0] === undefined &&
      tile[1] === "l" &&
      tile[2] === undefined &&
      tile[3] === "l"
    )
  }

  function hasVerticalStraightRail(tile: Tile) {
    return (
      tile[0] === "l" &&
      tile[1] === undefined &&
      tile[2] === "l" &&
      tile[3] === undefined
    )
  }
</script>

{#if tile}
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    stroke="black"
    display="block"
    stroke-width={3}
  >
    {#each rotations as r}
      <g transform={`rotate(${r * 90}, 50, 50)`}>
        {#if tile[r] === "d"}
          <path d="M40,0 v41 M60,0 v41" />
          <path stroke-width={2} d="M50,4 v9 m0,6 v9 m0,6 v9" />
        {:else if tile[r] === "l" && tile.overpass}
          <path
            fill="transparent"
            d="M50,0 v31 M41,8 h18 m-18,12 h18 M30,28 q20,6 40,0"
          />
        {:else if tile[r] === "l"}
          <path d="M50,0 v51 M41,8 h18 m-18,12 h18 m-18,12 h18" />
        {/if}

        {#if shouldDrawMiddleRoadEdge(tile, r)}
          <path d="M39,40 h22" />
        {/if}
      </g>
      ))}

      {#if hasStation(tile)}
        <rect x={39} y={39} width={22} height={22} />
      {/if}

      {#if hasRailCross(tile)}
        <path d="M43,43 l14,14 m0,-14 l-14,14" />
      {/if}

      {#if hasHorizontalStraightRail(tile)}
        <path d="M50,41 v18" />
      {/if}

      {#if hasVerticalStraightRail(tile)}
        <path d="M41,50 h18" />
      {/if}
    {/each}
  </svg>
{/if}
