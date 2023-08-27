import type {Tile} from "./types"

export const routeDieA: Tile[] = [
  {1: "d", 3: "d"},
  {1: "l", 3: "l"},
  {1: "d", 2: "d"},
  {1: "l", 2: "l"},
  {1: "d", 2: "d", 3: "d"},
  {1: "l", 2: "l", 3: "l"},
]

export const routeDieB: Tile[] = [
  {0: "d", 1: "l", 2: "d", 3: "l", overpass: true},
  {1: "d", 3: "l"},
  {2: "d", 3: "l"},
]

export const specialRouteTiles: Tile[] = [
  {0: "d", 1: "d", 2: "l", 3: "d"},
  {0: "d", 1: "l", 2: "l", 3: "l"},
  {0: "d", 1: "d", 2: "d", 3: "d"},
  {0: "l", 1: "l", 2: "l", 3: "l"},
  {0: "d", 1: "l", 2: "l", 3: "d"},
  {0: "d", 1: "l", 2: "d", 3: "l"},
]
