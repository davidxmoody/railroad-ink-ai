<script lang="ts">
  import {rotations} from "../logic/helpers"
  import type {OpenSlot, Position} from "../logic/types"

  export let position: Position
  export let exitSlot: OpenSlot
  export let cellSize: number
  export let cellBorderSize: number

  $: rotation = rotations.find((r) => exitSlot[r] !== "_") ?? 0

  $: transform = `translate(${
    (cellSize + 2 * cellBorderSize) * position.x + cellBorderSize
  }px, ${
    (cellSize + 2 * cellBorderSize) * position.y + cellBorderSize
  }px) rotate(${90 * rotation}deg) translate(0, -${
    cellSize + 2 * cellBorderSize
  }px)`
</script>

<svg
  class="exit"
  viewBox="0 0 100 100"
  width={cellSize}
  height={cellSize}
  style:transform
>
  {#if exitSlot[rotation] === "D"}
    <path d="M40,60 v50 M60,60 v50" />
    <path stroke-width={2} d="M50,69 v9 m0,6 v9" />
  {:else}
    <path d="M50,60 v40 M41,69 h18 m-18,10 h18 m-18,10 h18" />
  {/if}
</svg>

<style>
  .exit {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    stroke: black;
    stroke-width: 3px;
    pointer-events: none;
  }
</style>
