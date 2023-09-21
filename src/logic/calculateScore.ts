import {Board} from "./Board"
import {Grid} from "./Grid"
import {
  hasOverpass,
  hasTrackType,
  isCenterSquare,
  pEqual,
  tileFitsInSlot,
} from "./helpers"
import {ConnectionType, type Position, type TrackType} from "./types"

export default function calculateScore(board: Board) {
  const exits = calculateExitsScore(board)
  const road = calculateLongestRouteScore(board, ConnectionType.ROAD)
  const rail = calculateLongestRouteScore(board, ConnectionType.RAIL)
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
  const networkGrid = Grid.fromList<{horizontal: string; vertical: string}>([])

  board.forEachTile((p, tile) => {
    let leftNetworkId: string | undefined = undefined
    let aboveNetworkId: string | undefined = undefined

    if (p.x > 0 && tile[3] !== "_") {
      const positionToLeft = {y: p.y, x: p.x - 1}
      const tileToLeft = board.get(positionToLeft)
      const networkToLeft = networkGrid.get(positionToLeft)

      if (tileToLeft && tileToLeft[1] !== "_" && networkToLeft) {
        leftNetworkId = networkToLeft.horizontal
      }
    }

    if (p.y > 0 && tile[0] !== "_") {
      const positionAbove = {y: p.y - 1, x: p.x}
      const tileAbove = board.get(positionAbove)
      const networkAbove = networkGrid.get(positionAbove)

      if (tileAbove && tileAbove[2] !== "_" && networkAbove) {
        aboveNetworkId = networkAbove.vertical
      }
    }

    if (hasOverpass(tile)) {
      networkGrid.set(p, {
        horizontal: leftNetworkId ?? `${p.y}${p.x}h`,
        vertical: aboveNetworkId ?? `${p.y}${p.x}v`,
      })
    } else if (leftNetworkId !== undefined && aboveNetworkId !== undefined) {
      networkGrid.forEach((_p, value) => {
        if (value.horizontal === leftNetworkId) {
          value.horizontal = aboveNetworkId!
        }
        if (value.vertical === leftNetworkId) {
          value.vertical = aboveNetworkId!
        }
      })
      networkGrid.set(p, {
        horizontal: aboveNetworkId,
        vertical: aboveNetworkId,
      })
    } else if (aboveNetworkId !== undefined) {
      networkGrid.set(p, {
        horizontal: aboveNetworkId,
        vertical: aboveNetworkId,
      })
    } else if (leftNetworkId !== undefined) {
      networkGrid.set(p, {
        horizontal: leftNetworkId,
        vertical: leftNetworkId,
      })
    } else {
      networkGrid.set(p, {
        horizontal: `${p.y}${p.x}`,
        vertical: `${p.y}${p.x}`,
      })
    }
  })

  const exitGroups: Record<string, number> = {}

  for (const [exitP, exitSlot] of Board.exitSlots.entries()) {
    const tileAtExit = board.get(exitP)
    if (!tileAtExit || !tileFitsInSlot(tileAtExit, exitSlot)) continue

    const networkValues = networkGrid.get(exitP)
    if (!networkValues) throw new Error("Could not find network values")

    const isVerticalExit = exitSlot[1] === "_" && exitSlot[3] === "_"
    const exitNetworkId = isVerticalExit
      ? networkValues.vertical
      : networkValues.horizontal

    exitGroups[exitNetworkId] = (exitGroups[exitNetworkId] ?? 0) + 1
  }

  let exitsScore = 0
  for (const count of Object.values(exitGroups)) {
    exitsScore += exitScoringTable[count] ?? 0
  }
  return exitsScore
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
