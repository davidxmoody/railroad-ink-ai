<script lang="ts">
  import type {Board} from "../logic/Board"
  import calculateScore from "../logic/calculateScore"

  export let board: Board
  $: score = calculateScore(board)
  $: totalScore =
    score.exits + score.rail + score.road + score.center + score.errors
</script>

<div>
  <div>Exits: {score.exits}</div>
  <div>Road: {score.road}</div>
  <div>Rail: {score.rail}</div>
  <div>Center: {score.center}</div>
  <div>Errors: {score.errors}</div>
  <div><strong>Total: {totalScore}</strong></div>
</div>
