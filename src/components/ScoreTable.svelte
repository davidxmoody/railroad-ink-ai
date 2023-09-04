<script lang="ts">
  import type {Board} from "../logic/Board"
  import calculateScore from "../logic/calculateScore"

  export let board: Board
  $: score = calculateScore(board)
  $: totalScore =
    score.exits + score.rail + score.road + score.center + score.errors
</script>

<div class="container">
  <span class="item">Exits: {score.exits}</span>
  <span class="item">Road: {score.road}</span>
  <span class="item">Rail: {score.rail}</span>
  <span class="item">Center: {score.center}</span>
  <span class="item">Errors: {score.errors}</span>
  <span class="item"><strong>Total: {totalScore}</strong></span>
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
    border: 1px solid grey;
    margin: 1px;
    padding: 1px;
  }
</style>
