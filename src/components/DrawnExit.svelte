<script lang="ts">
  import type {Exit} from "../logic/types"

  export let exit: Exit
  export let cellSize: number
  export let cellBorderSize: number
</script>

<div
  class="exit"
  class:road={exit.t === "D"}
  class:rail={exit.t === "L"}
  style:transform={`translate(${
    (cellSize + 2 * cellBorderSize) * exit.x + cellBorderSize
  }px, ${(cellSize + 2 * cellBorderSize) * exit.y + cellBorderSize}px) rotate(${
    90 * exit.r
  }deg)`}
/>

<style>
  .exit {
    position: absolute;
    width: 20px;
    height: 5px;
    top: 0;
    left: 20px;
    transform-origin: center 30px;
  }

  .road {
    background: blue;
  }

  .rail {
    background: red;
  }
</style>
