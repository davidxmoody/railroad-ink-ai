export type TrackType = "D" | "L"

export type MaybeTrackType = TrackType | "_"

export type TileString =
  `${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${
    | "o"
    | ""}`

export type OpenSlot =
  `${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}`

export type Rotation = 0 | 1 | 2 | 3

export type Transform = {flip?: boolean; rotation?: Rotation}

export type Position = {y: number; x: number}

export type TrackPosition = Position & {t: TrackType}

export type Exit = TrackPosition & {r: Rotation}
