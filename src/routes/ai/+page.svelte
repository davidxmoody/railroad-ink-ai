<script lang="ts">
  import {solve as basic} from "../../ai/basic"
  import {solve as optimiseNextTileScore} from "../../ai/optimiseNextTileScore"
  import {solve as randomTreeWalkV1} from "../../ai/randomTreeWalkV1"
  import {solve as visualTreeWalk, type Node} from "../../ai/visualTreeWalk"
  import TreeNode from "../../components/TreeNode.svelte"
  import GameState from "../../logic/GameState"
  import calculateScore from "../../logic/calculateScore"

  const algorithms = [
    {name: "Visual tree walk", fn: visualTreeWalk},
    {name: "Basic", fn: basic},
    {name: "Optimise next tile score", fn: optimiseNextTileScore},
    {name: "Random tree walk V1", fn: randomTreeWalkV1},
  ]

  let selectedAlgorithmIndex = 0
  let startSeed = 0
  let endSeed = 0

  let running = false
  let results: Array<{
    seed: number
    duration: number
    score: number
    gameState: GameState
  }> = []

  let root: Node | undefined = undefined
  let nextStep: ((value: unknown) => void) | undefined = undefined

  async function run() {
    running = true
    try {
      const solve = algorithms[selectedAlgorithmIndex].fn
      const opts = {
        async step(newRoot: Node) {
          root = newRoot
          return new Promise((resolve) => (nextStep = resolve))
        },
      }

      for (let seed = startSeed; seed <= endSeed; seed++) {
        const startTime = performance.now()
        const gameState = await solve(new GameState(undefined, seed), opts)
        const duration = performance.now() - startTime
        const score = calculateScore(gameState.board).total
        results = [...results, {seed, duration, score, gameState}]
      }
    } finally {
      running = false
    }
  }
</script>

<div class="settings">
  <div class="row">
    <label for="algorithm-select">Algorithm:</label>
    <select id="algorithm-select" bind:value={selectedAlgorithmIndex}>
      {#each algorithms as { name }, index}
        <option value={index}>{name}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label for="start-seed">Start seed:</label>
    <input id="start-seed" type="number" bind:value={startSeed} />
  </div>

  <div class="row">
    <label for="end-seed">End seed:</label>
    <input id="end-seed" type="number" bind:value={endSeed} />
  </div>

  <button on:click={run} disabled={running}>Run</button>

  <button on:click={nextStep} disabled={!nextStep}>Next step</button>
</div>

{#if results.length}
  <div class="results">
    {#each results as result}
      <div class="result">
        Seed: {result.seed}, duration: {result.duration.toFixed(1)}ms, score: {result.score}
      </div>
    {/each}
  </div>
{/if}

{#if root}
  <TreeNode node={root} />
{/if}

<style>
  .settings {
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .row {
    display: flex;
    margin-bottom: 8px;
  }

  label {
    width: 80px;
    text-align: right;
    margin-right: 8px;
  }

  select,
  input {
    flex: 1;
  }

  button {
    margin-top: 8px;
    font-size: 16px;
    padding: 8px 24px;
    cursor: pointer;
  }

  button:disabled {
    cursor: unset;
  }

  .results {
    margin: 16px;
  }
</style>
