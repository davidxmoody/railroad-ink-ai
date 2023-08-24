export type TrackType = "d" | "l"

export const rotations = [0, 1, 2, 3] as const

export type Rotation = (typeof rotations)[number]

export interface Tile {
  0?: TrackType // North
  1?: TrackType // East
  2?: TrackType // South
  3?: TrackType // West
  overpass?: boolean
}

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
