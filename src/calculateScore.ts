import {Board, Connection} from "./board"
import {Rotation} from "./dice"

export default function calculateScore(board: Board) {
  return {
    exits: calculateExitsScore(board),
    road: 0,
    rail: 0,
    center: calculateCenterScore(board),
    errors: 0,
  }
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

  const alreadyCheckedExits: Connection[] = []

  for (const exit of Board.exits) {
    if (alreadyCheckedExits.includes(exit)) continue

    const connectedExits = traverse(board, exit)
    alreadyCheckedExits.push(...connectedExits)

    exitsScore += exitScoringTable[1 + connectedExits.length] ?? 0
  }

  return exitsScore
}

function traverse(board: Board, startingConnection: Connection) {
  const reachedExits: Connection[] = []
  const visited: Record<string, boolean> = {}
  const unexploredConnections = [startingConnection]

  while (unexploredConnections.length) {
    const c = unexploredConnections.shift()!

    const tile = board.get(c.y, c.x)

    if (tile && tile[c.r] === c.t) {
      const key = `${c.y},${c.x}${tile.overpass ? c.t : ""}`
      if (visited[key]) continue

      visited[key] = true

      for (const r of [0, 1, 2, 3] as Rotation[]) {
        if (c.r === r) continue
        if (tile[r] === undefined) continue
        if (tile.overpass && c.t !== tile[r]) continue

        for (const exit of Board.exits) {
          if (
            exit.y === c.y &&
            exit.x === c.x &&
            exit.r === r &&
            exit.t === tile[r]
          ) {
            reachedExits.push(exit)
          }
        }

        const cY = r === 0 ? c.y - 1 : r === 2 ? c.y + 1 : c.y
        const cX = r === 1 ? c.x + 1 : r === 3 ? c.x - 1 : c.x
        const cR = ((r + 2) % 4) as Rotation

        // TODO check for connection to other exits

        if (cY < 0 || cX < 0 || cY >= Board.size || cX >= Board.size) {
          continue
        }

        unexploredConnections.push({y: cY, x: cX, r: cR, t: tile[r]!})
      }
    }
  }

  return reachedExits
}
