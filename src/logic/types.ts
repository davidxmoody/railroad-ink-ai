export type TrackType = "D" | "L"

export type Rotation = 0 | 1 | 2 | 3

export interface Tile {
  0?: TrackType // North
  1?: TrackType // East
  2?: TrackType // South
  3?: TrackType // West
  overpass?: boolean
}

export type Position = {y: number; x: number}

export type TrackPosition = Position & {t: TrackType}

export type Exit = TrackPosition & {r: Rotation}
