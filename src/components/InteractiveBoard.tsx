import {Box, Flex} from "@chakra-ui/react"
import {Board} from "../board"
import {Tile} from "../dice"
import DrawnTile from "./DrawnTile"

interface Props {
  board: Board
  selectedTile: Tile | null
  onClickSquare: (y: number, x: number) => void
}

export default function InteractiveBoard(props: Props) {
  return (
    <Box>
      {range(Board.size).map((y) => (
        <Box key={y} display="flex">
          {range(Board.size).map((x) => (
            <Flex
              key={x}
              w={60}
              h={60}
              borderWidth={1}
              borderStyle="solid"
              borderColor={isCenterSquare(y, x) ? "grey" : "lightgrey"}
              m={1}
              alignItems="center"
              justifyContent="center"
              color="lightgrey"
              cursor="pointer"
              onClick={() => props.onClickSquare(y, x)}
              background={
                props.selectedTile &&
                props.board.isValid(y, x, props.selectedTile)
                  ? "rgba(0, 200, 0, 0.3)"
                  : undefined
              }
              position="relative"
            >
              <DrawnTile tile={props.board.get(y, x)} />
              {props.board.getConnections(y, x).map((c) => (
                <Box
                  key={c.r}
                  position="absolute"
                  background={c.t === "l" ? "red" : "blue"}
                  width={10}
                  height={10}
                  top={c.r === 0 ? 0 : undefined}
                  right={c.r === 1 ? 0 : undefined}
                  bottom={c.r === 2 ? 0 : undefined}
                  left={c.r === 3 ? 0 : undefined}
                />
              ))}
            </Flex>
          ))}
        </Box>
      ))}
    </Box>
  )
}

function range(limit: number) {
  return [...Array(limit).keys()]
}

function isCenterSquare(y: number, x: number) {
  return y >= 2 && y <= 4 && x >= 2 && x <= 4
}
