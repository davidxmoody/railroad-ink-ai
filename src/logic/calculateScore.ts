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

function getConnectionKey(p1: Position, p2: Position) {
  const p1Size = p1.y * Board.size + p1.x
  const p2Size = p2.y * Board.size + p2.x
  return p1Size < p2Size
    ? `${p1.y},${p1.x}-${p2.y},${p2.x}`
    : `${p2.y},${p2.x}-${p1.y},${p1.x}`
}

function calculateLongestRouteScore(board: Board, trackType: TrackType) {
  let longestRoute = 0

  const nodes: Array<{
    p: Position
    c: Array<{p: Position; d: number; k: string}>
  }> = []

  board.forEachTile((p, tile) => {
    if (hasTrackType(tile, trackType)) {
      nodes[p.y * Board.size + p.x] = {
        p,
        c: board
          .getConnectedTiles({...p, t: trackType}, trackType)
          .map((pc) => ({p: pc, d: 1, k: getConnectionKey(p, pc)})),
      }
    }
  })

  for (const node of nodes) {
    if (node && node.c.length === 2) {
      const left = nodes[node.c[0].p.y * Board.size + node.c[0].p.x]
      const right = nodes[node.c[1].p.y * Board.size + node.c[1].p.x]

      if (pEqual(node.p, left.p) || pEqual(node.p, right.p)) {
        continue
      }

      delete nodes[node.p.y * Board.size + node.p.x]

      const key = node.c[0].k
      const newD = node.c[0].d + node.c[1].d

      left.c = left.c.map((leftC) => {
        if (pEqual(node.p, leftC.p)) {
          return {p: right.p, d: newD, k: key}
        }
        return leftC
      })

      right.c = right.c.map((rightC) => {
        if (pEqual(node.p, rightC.p)) {
          return {p: left.p, d: newD, k: key}
        }
        return rightC
      })
    }
  }

  for (const {p} of nodes.filter((p) => p)) {
    traverseAllRoutes(
      (routeLength) => {
        if (routeLength > longestRoute) longestRoute = routeLength
      },
      nodes,
      p,
    )
  }

  return longestRoute
}

function traverseAllRoutes(
  onRouteLength: (routeLength: number) => void,
  nodes: Array<{p: Position; c: Array<{p: Position; d: number; k: string}>}>,
  p: Position,
  routeLength = 0,
  visitedConnections: Record<string, boolean> = {},
) {
  onRouteLength(routeLength + 1)

  for (const nextC of nodes[p.y * Board.size + p.x].c) {
    if (visitedConnections[nextC.k]) {
      continue
    }
    traverseAllRoutes(onRouteLength, nodes, nextC.p, routeLength + nextC.d, {
      ...visitedConnections,
      [nextC.k]: true,
    })
  }
}
