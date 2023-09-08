import {Board} from "./Board"
import {hasOverpass, hasTrackType, isCenterSquare, pEqual} from "./helpers"
import type {Exit, Position, TrackPosition, TrackType} from "./types"

export default function calculateScore(board: Board) {
  const exits = calculateExitsScore(board)
  const road = calculateLongestRouteScore(board, "D")
  const rail = calculateLongestRouteScore(board, "L")
  const center = calculateCenterScore(board)
  const errors = calculateErrorsScore(board)
  const total = exits + road + rail + center + errors
  return {exits, road, rail, center, errors, total}
}

function calculateErrorsScore(board: Board) {
  return -1 * board.countErrors() || 0
}

function calculateCenterScore(board: Board) {
  let centerScore = 0
  for (let y = 0; y <= Board.size; y++) {
    for (let x = 0; x <= Board.size; x++) {
      if (isCenterSquare({y, x}) && board.get({y, x})) {
        centerScore++
      }
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
  if (!tileAtExit || tileAtExit[startingExit.r] === "_") return [startingExit]

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
        tile[e.r] !== "_" &&
        (!hasOverpass(tile) || tile[e.r] === tp.t),
    )
    if (connectedExit) visitedExits.push(connectedExit)

    unexploredTrackPositions.push(...board.getConnectedTiles(tp))
  }

  return visitedExits
}

function calculateLongestRouteScore(board: Board, trackType: TrackType) {
  let longestRoute = 0

  const nodes: Array<{p: Position; c: Position[]}> = []

  board.forEachTile((p, tile) => {
    if (hasTrackType(tile, trackType)) {
      nodes[p.y * Board.size + p.x] = {
        p,
        c: board.getConnectedTiles({...p, t: trackType}, trackType),
      }
    }
  })

  for (const node of nodes) {
    if (node && node.c.length === 2) {
      const left = nodes[node.c[0].y * Board.size + node.c[0].x]
      const right = nodes[node.c[1].y * Board.size + node.c[1].x]

      if (pEqual(node.p, left.p) || pEqual(node.p, right.p)) {
        continue
      }

      delete nodes[node.p.y * Board.size + node.p.x]

      left.c = left.c.map((p2) => {
        if (p2.y === node.p.y && p2.x === node.p.x) {
          return right.p
        }
        return p2
      })

      right.c = right.c.map((p2) => {
        if (p2.y === node.p.y && p2.x === node.p.x) {
          return left.p
        }
        return p2
      })
    }
  }

  for (const {p} of nodes.filter((p) => p)) {
    traverseAllRoutes(board, trackType, p, [p], [], (routeLength) => {
      if (routeLength > longestRoute) longestRoute = routeLength
    })
  }

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
