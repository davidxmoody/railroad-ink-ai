<script lang="ts">
  import type {Board} from "../logic/Board"
  import calculateScore from "../logic/calculateScore"

  export let board: Board
  $: score = calculateScore(board)
</script>

<div class="container">
  <span class="item">Exits: {score.exits}</span>
  <span class="item">Road: {score.road}</span>
  <span class="item">Rail: {score.rail}</span>
  <span class="item">Center: {score.center}</span>
  <span class="item">Errors: {score.errors}</span>
  <span class="item"><strong>Total: {score.total}</strong></span>
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
  }

  .item {
    flex-basis: 1px;
    flex: 1;
    text-align: center;
    border: 1px solid black;
    margin: 1px;
    padding: 1px;
  }
</style>
