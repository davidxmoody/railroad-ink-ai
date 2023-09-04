<script lang="ts">
  import type {Exit} from "../logic/types"

  export let exit: Exit
  export let cellSize: number
  export let cellBorderSize: number

  $: transform = `translate(${
    (cellSize + 2 * cellBorderSize) * exit.x + cellBorderSize
  }px, ${(cellSize + 2 * cellBorderSize) * exit.y + cellBorderSize}px) rotate(${
    90 * exit.r
  }deg) translate(0, -${cellSize + 2 * cellBorderSize}px)`
</script>

<svg
  class="exit"
  viewBox="0 0 100 100"
  width={cellSize}
  height={cellSize}
  style:transform
>
  {#if exit.t === "D"}
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
  }
</style>
