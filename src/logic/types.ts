import type {TrackType} from "./dice"

export type Position = {y: number; x: number}

export type TrackPosition = Position & {t: TrackType}
