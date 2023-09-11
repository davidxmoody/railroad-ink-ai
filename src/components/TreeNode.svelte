<script lang="ts">
  import type {Node} from "../ai/visualTreeWalk"

  export let node: Node

  let open = false
</script>

<div>
  <button
    class="node"
    on:click={() => (open = !open)}
    disabled={!node.children}
  >
    {node.gs.board.toString()}
    {node.children?.length ?? ""}
  </button>

  {#if open}
    <div style:margin-left="16px">
      {#each node.children ?? [] as child}
        <svelte:self node={child} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .node {
    font-size: 8px;
    margin-bottom: 2px;
    padding: 1px;
  }

  .node:not(:disabled) {
    cursor: pointer;
  }
</style>
