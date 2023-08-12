import {Box, Button, Flex} from "@chakra-ui/react"
import {useState} from "react"
import {Board} from "./board"
import DrawnTile from "./components/DrawnTile"
import InteractiveBoard from "./components/InteractiveBoard"
import {routeDieA, routeDieB, specialRouteTiles, Tile} from "./dice"

export default function App() {
  const [allTiles, setAllTiles] = useState([
    ...routeDieA,
    ...routeDieB,
    ...specialRouteTiles,
  ])
  const [selectedTileIndex, setSelectedTileIndex] = useState(0)
  const [board, setBoard] = useState(new Board())

  return (
    <Box m={24}>
      <InteractiveBoard
        board={board}
        selectedTile={allTiles[selectedTileIndex]}
        onClickSquare={(y, x) => {
          if (!allTiles[selectedTileIndex]) return
          if (!board.isValid(y, x, allTiles[selectedTileIndex])) {
            alert("Invalid placement")
            return
          }
          setBoard(board.set(y, x, allTiles[selectedTileIndex]))
          ;(window as any).board = (window as any).board ?? []
          ;(window as any).board.push({
            y,
            x,
            tile: allTiles[selectedTileIndex],
          })

          console.log((window as any).board)
        }}
      />

      <Box mt={24}>
        <Button mr={8} onClick={() => setAllTiles(allTiles.map(rotateTile))}>
          Rotate
        </Button>
        <Button onClick={() => setAllTiles(allTiles.map(flipTile))}>
          Flip
        </Button>
      </Box>

      <Flex mt={24} flexWrap="wrap">
        {allTiles.map((tile, i) => (
          <Box
            key={i}
            m={8}
            border="1px solid lightgrey"
            cursor="pointer"
            background={
              i === selectedTileIndex ? "rgba(0, 200, 0, 0.3)" : undefined
            }
            onClick={() => setSelectedTileIndex(i)}
          >
            <DrawnTile tile={tile} />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

function rotateTile(tile: Tile): Tile {
  return {
    0: tile[3],
    1: tile[0],
    2: tile[1],
    3: tile[2],
    overpass: tile.overpass,
  }
}

function flipTile(tile: Tile): Tile {
  return {
    0: tile[0],
    1: tile[3],
    2: tile[2],
    3: tile[1],
    overpass: tile.overpass,
  }
}
