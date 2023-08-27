export type TrackType = "D" | "L"

export type MaybeTrackType = TrackType | "_"

export type TileString =
  `${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${
    | "o"
    | ""}`

export type Rotation = 0 | 1 | 2 | 3

export type Position = {y: number; x: number}

export type TrackPosition = Position & {t: TrackType}

export type Exit = TrackPosition & {r: Rotation}
