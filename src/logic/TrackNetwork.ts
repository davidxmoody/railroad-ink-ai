import {Grid} from "./Grid"
import {
  argmax,
  flipRotation,
  hasTrackType,
  pEqual,
  rotations,
  step,
} from "./helpers"
import {
  ConnectionType,
  type Position,
  type Rotation,
  type TileString,
  type TrackType,
} from "./types"

type Link = {type: "link"; p: Position; k: string; d: number}
type Open = {type: "open"}
type Dead = null
type Connection = Link | Open | Dead
type Node = Connection[]

export default class TrackNetwork {
  public readonly trackType: TrackType

  private grid: Grid<Node>
  private longestRouteSoFar: number

  public constructor(
    trackType: TrackType,
    grid?: Grid<Node>,
    longestRouteSoFar?: number,
  ) {
    this.trackType = trackType
    this.grid = grid ?? Grid.fromList([])
    this.longestRouteSoFar = longestRouteSoFar ?? 0
  }

  public get(p: Position) {
    return this.grid.get(p)
  }

  public update(p: Position, tile: TileString, tiles: Grid<TileString>) {
    const positionsThatHaveBeenModified = []
    const newGrid = this.grid.clone()

    for (const r of rotations) {
      if (tile[r] === ConnectionType.NONE) {
        const stepP = step(p, r)
        if (stepP && newGrid.get(stepP)) {
          modifyNode(newGrid, stepP, flipRotation(r), null)
          positionsThatHaveBeenModified.push(stepP)
        }
      }
    }

    if (hasTrackType(tile, this.trackType)) {
      positionsThatHaveBeenModified.push(p)

      const node: Node = rotations.map((r) => {
        if (tile[r] !== this.trackType) return null

        const stepP = step(p, r)
        if (!stepP) return null

        const stepTile = tiles.get(stepP)
        if (!stepTile) return {type: "open"}

        if (stepTile[flipRotation(r)] === ConnectionType.NONE) return null

        const linkKey = `${p.y}${p.x}${r}`

        modifyNode(newGrid, stepP, flipRotation(r), {
          type: "link",
          p,
          k: linkKey,
          d: 1,
        })
        positionsThatHaveBeenModified.push(stepP)

        return {type: "link", p: stepP, k: linkKey, d: 1}
      })

      newGrid.set(p, node)
    }

    if (positionsThatHaveBeenModified.length === 0) return this

    prunePassthroughs(newGrid, positionsThatHaveBeenModified)

    pruneLeaves(newGrid)

    return new TrackNetwork(this.trackType, newGrid, this.longestRouteSoFar)
  }

  public getLongestRoute(log?: boolean) {
    const pathsFromEveryPosition = this.grid
      .keys()
      .map((p) => ({p, ...followAllPaths(this.grid, p)}))

    if (log) console.log(pathsFromEveryPosition)

    if (pathsFromEveryPosition.length === 0) return this.longestRouteSoFar

    const overallLongestRoute = argmax(
      pathsFromEveryPosition,
      ({longestRoute}) => longestRoute,
    ).longestRoute

    this.longestRouteSoFar = Math.max(
      this.longestRouteSoFar,
      overallLongestRoute,
    )

    const closedPositions = pathsFromEveryPosition
      .filter(({closed}) => closed)
      .map(({p}) => p)

    for (const p of closedPositions) {
      // console.log("delete", p)
      this.grid.delete(p)
    }

    // console.log("longest route", this.longestRouteSoFar)

    return this.longestRouteSoFar
  }
}

// TODO try rewriting as generator
function followAllPaths(
  grid: Grid<Node>,
  p: Position,
  visitedKeys: Record<string, number> = {},
): {longestRoute: number; closed: boolean} {
  const node = grid.get(p)!
  const unfollowed = node.filter(isLink).filter((c) => !(c.k in visitedKeys))

  if (unfollowed.length === 0) {
    return {
      longestRoute: 1 + Object.values(visitedKeys).reduce((a, b) => a + b, 0),
      closed: !hasOpen(node),
    }
  }

  const otherPaths = unfollowed.map((c) =>
    followAllPaths(grid, c.p, {...visitedKeys, [c.k]: c.d}),
  )

  return {
    longestRoute: argmax(otherPaths, (a) => a.longestRoute).longestRoute,
    closed: !hasOpen(node) && otherPaths.every((p) => p.closed),
  }
}

function* findAllConnectedPositions(
  grid: Grid<Node>,
  p: Position,
  visited?: Set<number>,
): Generator<Position> {
  visited = visited ?? new Set<number>()
  const key = p.y * Grid.size + p.x

  if (visited.has(key)) return

  yield p
  visited.add(key)

  for (const link of grid.get(p)!.filter(isLink)) {
    yield* findAllConnectedPositions(grid, link.p, visited)
  }
}

function findSubNetworks(grid: Grid<Node>) {
  let uncheckedPositions = [...grid.entries()].map(([p]) => p)
  const subNetworks: Array<{positions: Position[]; closed: boolean}> = []

  while (uncheckedPositions.length) {
    const subNetworkPositions = [
      ...findAllConnectedPositions(grid, uncheckedPositions[0]),
    ]
    const closed = subNetworkPositions.every((p) => !hasOpen(grid.get(p)!))
    subNetworks.push({positions: subNetworkPositions, closed})
    uncheckedPositions = uncheckedPositions.filter(
      (p) => !subNetworkPositions.some((p2) => pEqual(p, p2)),
    )
  }

  return subNetworks
}

function updateNode(node: Node, r: Rotation, value: Connection): Node {
  return [...node.slice(0, r), value, ...node.slice(r + 1)]
}

function isLink(c: Connection): c is Link {
  return c?.type === "link"
}

function isOpen(c: Connection): c is Open {
  return c?.type === "open"
}

function hasOpen(node: Node) {
  return node.some(isOpen)
}

function prunePassthroughs(
  grid: Grid<Node>,
  candidatePrunePositions: Position[],
) {
  for (const cpp of candidatePrunePositions) {
    const cpn = grid.get(cpp)
    if (!cpn) continue

    const hasOpen = cpn.some((c) => c?.type === "open")
    if (hasOpen) continue

    const hasExactlyTwoLinks = cpn.filter(isLink).length === 2
    if (!hasExactlyTwoLinks) continue

    const leftConnection = cpn.find(isLink)!
    const rightConnection = cpn.findLast(isLink)!

    const isLastNodeInClosedLoop = pEqual(cpp, leftConnection.p)
    if (isLastNodeInClosedLoop) continue

    const newDistance = leftConnection.d + rightConnection.d
    const newKey = leftConnection.k

    const leftR = grid
      .get(leftConnection.p)!
      .findIndex((c) => isLink(c) && pEqual(c.p, cpp)) as Rotation

    modifyNode(grid, leftConnection.p, leftR, {
      type: "link",
      p: rightConnection.p,
      k: newKey,
      d: newDistance,
    })

    const rightR = grid
      .get(rightConnection.p)!
      .findIndex((c) => isLink(c) && pEqual(c.p, cpp)) as Rotation

    modifyNode(grid, rightConnection.p, rightR, {
      type: "link",
      p: leftConnection.p,
      k: newKey,
      d: newDistance,
    })

    grid.delete(cpp)
  }
}

function isLeafNode(node: Node) {
  return node.filter((c) => c !== null).length === 1
}

function modifyNode(grid: Grid<Node>, p: Position, r: Rotation, c: Connection) {
  const oldNode = grid.get(p)
  if (!oldNode) throw new Error("Tried to modify node that did not exist")
  const newNode = updateNode(oldNode, r, c)
  grid.set(p, newNode)
}

function pruneLeaves(grid: Grid<Node>) {
  let changesWereMade = false

  for (const [p, node] of grid.entries()) {
    const numLinks = node.filter(isLink).length
    if (numLinks < 3) continue

    const numOpenOrNonLeafConnections = node.filter(
      (c) => isOpen(c) || (isLink(c) && !isLeafNode(grid.get(c.p)!)),
    ).length
    if (numOpenOrNonLeafConnections > 1) continue

    const shortestConnection = node.filter(isLink).sort((a, b) => {
      if (a.d === b.d && isLeafNode(grid.get(a.p)!)) return -1
      return a.d - b.d
    })[0]

    if (isLeafNode(grid.get(shortestConnection.p)!)) {
      grid.delete(shortestConnection.p)
      const shortestConnectionR = node.indexOf(shortestConnection) as Rotation
      modifyNode(grid, p, shortestConnectionR, null)
      prunePassthroughs(grid, [p])
      changesWereMade = true
    }
  }

  if (changesWereMade) {
    pruneLeaves(grid)
  }
}
