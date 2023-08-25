import {Board, type Exit} from "./board"
import {rotations, type TrackType} from "./dice"
import {step} from "./helpers"

export default function calculateScore(board: Board) {
  return {
    exits: calculateExitsScore(board),
    road: calculateLongestRouteScore(board, "d"),
    rail: calculateLongestRouteScore(board, "l"),
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
      if (board.get(y, x)) centerScore++
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

    const connectedExits = traverse(board, exit)
    alreadyCheckedExits.push(...connectedExits)

    exitsScore += exitScoringTable[connectedExits.length] ?? 0
  }

  return exitsScore
}

function traverse(board: Board, startingExit: Exit) {
  const tileAtExit = board.get(startingExit.y, startingExit.x)
  if (!tileAtExit?.[startingExit.r]) return [startingExit]

  const visitedExits: Exit[] = []
  const visitedTileKeys: Record<string, boolean> = {}
  const unexploredTiles: Array<{y: number; x: number; t: TrackType}> = [
    startingExit,
  ]

  while (unexploredTiles.length) {
    const {y, x, t} = unexploredTiles.shift()!
    const tile = board.get(y, x)!

    const key = `${y},${x}${tile.overpass ? t : ""}`
    if (visitedTileKeys[key]) continue
    visitedTileKeys[key] = true

    const connectedExit = Board.exits.find(
      (e) =>
        e.y === y &&
        e.x === x &&
        tile[e.r] &&
        (!tile.overpass || tile[e.r] === t),
    )
    if (connectedExit) visitedExits.push(connectedExit)

    unexploredTiles.push(...board.getConnectedTiles(y, x, t))
  }

  return visitedExits
}

function calculateLongestRouteScore(board: Board, trackType: TrackType) {
  let longestRoute = 0

  board.forEachTile((y, x, tile) => {
    if (rotations.some((r) => tile[r] === trackType)) {
      traverseAllRoutes(
        board,
        trackType,
        [y, x],
        [[y, x]],
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
  p: [number, number],
  visitedPositions: Array<[number, number]>,
  visitedConnections: string[],
  onRouteLength: (routeLength: number) => void,
) {
  onRouteLength(visitedPositions.length)

  for (const r of rotations) {
    if (board.get(p[0], p[1])?.[r] !== trackType) continue

    const p2 = step(p[0], p[1], r)
    if (!p2) continue
    if (!board.get(...p2)) continue

    const c = `${(p[0] + p2[0]) / 2},${(p[1] + p2[1]) / 2}`
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
