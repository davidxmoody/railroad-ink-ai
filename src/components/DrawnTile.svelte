<script lang="ts">
  import {rotations, hasOverpass, hasTrackType} from "../logic/helpers"
  import {
    type Rotation,
    type TileString,
    type MaybeTrackType,
    ConnectionType,
  } from "../logic/types"

  export let tile: TileString | undefined
  export let size = 60

  function hasStation(tile: TileString) {
    return (
      !hasOverpass(tile) &&
      hasTrackType(tile, ConnectionType.ROAD) &&
      hasTrackType(tile, ConnectionType.RAIL)
    )
  }

  function shouldDrawMiddleRoadEdge(tile: TileString, r: Rotation) {
    return (
      (tile[r] === "_" || (tile[r] === "L" && hasOverpass(tile))) &&
      (tile[((r + 3) % 4) as Rotation] === "D" ||
        tile[((r + 1) % 4) as Rotation] === "D")
    )
  }

  function countTrackTypes(tile: TileString) {
    const counts = {D: 0, L: 0, _: 0}
    counts[tile[0] as MaybeTrackType]++
    counts[tile[1] as MaybeTrackType]++
    counts[tile[2] as MaybeTrackType]++
    counts[tile[3] as MaybeTrackType]++
    return counts
  }

  function hasRailCross(tile: TileString) {
    const counts = countTrackTypes(tile)
    return counts.L === 4 || (counts.L === 3 && counts._ === 1)
  }

  function hasHorizontalStraightRail(tile: TileString) {
    return (
      tile[0] === "_" && tile[1] === "L" && tile[2] === "_" && tile[3] === "L"
    )
  }

  function hasVerticalStraightRail(tile: TileString) {
    return (
      tile[0] === "L" && tile[1] === "_" && tile[2] === "L" && tile[3] === "_"
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
        {#if tile[r] === "D"}
          <path d="M40,0 v41 M60,0 v41" />
          <path stroke-width={2} d="M50,4 v9 m0,6 v9 m0,6 v9" />
        {:else if tile[r] === "L" && hasOverpass(tile)}
          <path
            fill="transparent"
            d="M50,0 v31 M41,8 h18 m-18,12 h18 M30,28 q20,6 40,0"
          />
        {:else if tile[r] === "L"}
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
