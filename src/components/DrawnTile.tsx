import {Tile} from "../dice"

interface Props {
  tile: Tile
}

export default function DrawnTile({tile}: Props) {
  const station = hasStation(tile)

  return (
    <svg
      viewBox="0 0 100 100"
      width={100}
      height={100}
      stroke="black"
      strokeWidth={2}
      display="block"
    >
      {station ? <rect x={40} y={40} width={20} height={20} /> : null}

      {([0, 1, 2, 3] as const).map((r) => (
        <g key={r} transform={`rotate(${r * 90}, 50, 50)`}>
          {tile[r] === "d" ? (
            <path d="M 40,0 L 40,40 M 60,0 L 60,40 M 50,4 L 50,12 M 50,16 L 50,24, M 50,28 L 50,36" />
          ) : tile[r] === "l" ? (
            <path d="M 50,0 L 50,40 M 42,8 L 58,8 M 42,20 L 58,20 M 42,32 L 58,32" />
          ) : null}
        </g>
      ))}
    </svg>
  )
}

function hasStation(tile: Tile) {
  if (tile.overpass) return false

  const hasRoad =
    tile[0] === "d" || tile[1] === "d" || tile[2] === "d" || tile[3] === "d"
  const hasRail =
    tile[0] === "l" || tile[1] === "l" || tile[2] === "l" || tile[3] === "l"

  return hasRoad && hasRail
}
