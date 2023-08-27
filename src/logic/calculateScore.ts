import {Board} from "./Board"
import {hasOverpass, rotations} from "./helpers"
import type {Exit, Position, TrackPosition, TrackType} from "./types"

export default function calculateScore(board: Board) {
  return {
    exits: calculateExitsScore(board),
    road: calculateLongestRouteScore(board, "D"),
    rail: calculateLongestRouteScore(board, "L"),
    center: calculateCenterScore(board),
    errors: calculateErrorsScore(board),
  }
}

function calculateErrorsScore(board: Board) {
  return -1 * board.countErrors() || 0
}

function calculateCenterScore(board: Board) {
  let centerScore = 0
  for (let y = 2; y <= 4; y++) {
    for (let x = 2; x <= 4; x++) {
      if (board.get({y, x})) centerScore++
    }
  }
  return centerScore
}

const exitScoringTable: Record<number, number | undefined> = {
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 28,
  9: 32,
  10: 36,
  11: 40,
  12: 45,
}

function calculateExitsScore(board: Board) {
  let exitsScore = 0

  const alreadyCheckedExits: Exit[] = []

  for (const exit of Board.exits) {
    if (alreadyCheckedExits.includes(exit)) continue

    const connectedExits = findConnectedExits(board, exit)
    alreadyCheckedExits.push(...connectedExits)

    exitsScore += exitScoringTable[connectedExits.length] ?? 0
  }

  return exitsScore
}

function findConnectedExits(board: Board, startingExit: Exit) {
  const tileAtExit = board.get(startingExit)
  if (!tileAtExit?.[startingExit.r]) return [startingExit]

  const visitedExits: Exit[] = []
  const visitedTileKeys: Record<string, boolean> = {}
  const unexploredTrackPositions: TrackPosition[] = [startingExit]

  while (unexploredTrackPositions.length) {
    const tp = unexploredTrackPositions.shift()!
    const tile = board.get(tp)!

    const key = `${tp.y},${tp.x}${hasOverpass(tile) ? tp.t : ""}`
    if (visitedTileKeys[key]) continue
    visitedTileKeys[key] = true

    const connectedExit = Board.exits.find(
      (e) =>
        e.y === tp.y &&
        e.x === tp.x &&
        tile[e.r] &&
        (!hasOverpass(tile) || tile[e.r] === tp.t),
    )
    if (connectedExit) visitedExits.push(connectedExit)

    unexploredTrackPositions.push(...board.getConnectedTiles(tp))
  }

  return visitedExits
}

function calculateLongestRouteScore(board: Board, trackType: TrackType) {
  let longestRoute = 0

  board.forEachTile(({y, x}, tile) => {
    if (rotations.some((r) => tile[r] === trackType)) {
      traverseAllRoutes(
        board,
        trackType,
        {y, x},
        [{y, x}],
        [],
        (routeLength) => {
          if (routeLength > longestRoute) longestRoute = routeLength
        },
      )
    }
  })

  return longestRoute
}

function traverseAllRoutes(
  board: Board,
  trackType: TrackType,
  p: Position,
  visitedPositions: Position[],
  visitedConnections: string[],
  onRouteLength: (routeLength: number) => void,
) {
  onRouteLength(visitedPositions.length)

  const connectedTiles = board.getConnectedTiles(
    {...p, t: trackType},
    trackType,
  )

  for (const p2 of connectedTiles) {
    const c = `${(p.y + p2.y) / 2},${(p.x + p2.x) / 2}`
    if (visitedConnections.includes(c)) continue

    traverseAllRoutes(
      board,
      trackType,
      p2,
      [...visitedPositions, p2],
      [...visitedConnections, c],
      onRouteLength,
    )
  }
}
