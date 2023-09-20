export enum ConnectionType {
  ROAD = "D",
  RAIL = "L",
  NONE = "_",
  EDGE = "E",
  UNFILLED = ".",
}

export type TrackType = ConnectionType.ROAD | ConnectionType.RAIL

export type MaybeTrackType = TrackType | ConnectionType.NONE

export type TileString =
  `${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${MaybeTrackType}${
    | "o"
    | ""}`

export type OpenSlot =
  `${ConnectionType}${ConnectionType}${ConnectionType}${ConnectionType}`

export type Rotation = 0 | 1 | 2 | 3

export type Transform = {flip?: boolean; rotation?: Rotation}

export type Position = {y: number; x: number}

export type TrackPosition = Position & {t: TrackType}
