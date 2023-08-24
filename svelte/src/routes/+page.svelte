<script>
  import DrawnTile from "../components/DrawnTile.svelte"
  import {routeDieA, routeDieB, specialRouteTiles} from "../logic/dice"
</script>

<div>
  {#each [...routeDieA, ...routeDieB, ...specialRouteTiles] as tile}
    <DrawnTile {tile} />
  {/each}
</div>
