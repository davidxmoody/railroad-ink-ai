import type {Tile} from "./types"

export const routeDieA: Tile[] = [
  {1: "D", 3: "D"},
  {1: "L", 3: "L"},
  {1: "D", 2: "D"},
  {1: "L", 2: "L"},
  {1: "D", 2: "D", 3: "D"},
  {1: "L", 2: "L", 3: "L"},
]

export const routeDieB: Tile[] = [
  {0: "D", 1: "L", 2: "D", 3: "L", overpass: true},
  {1: "D", 3: "L"},
  {2: "D", 3: "L"},
]

export const specialRouteTiles: Tile[] = [
  {0: "D", 1: "D", 2: "L", 3: "D"},
  {0: "D", 1: "L", 2: "L", 3: "L"},
  {0: "D", 1: "D", 2: "D", 3: "D"},
  {0: "L", 1: "L", 2: "L", 3: "L"},
  {0: "D", 1: "L", 2: "L", 3: "D"},
  {0: "D", 1: "L", 2: "D", 3: "L"},
]
