<script lang="ts">
  import type {Node} from "../ai/visualTreeWalk"

  export let node: Node
</script>

<div style:font-size="6px">
  <div>
    {node.gs.board.toString()}
  </div>

  <div style:margin-left="16px">
    {#each node.children ?? [] as child}
      <svelte:self node={child} />
    {/each}
  </div>
</div>
