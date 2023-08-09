import {Box, Flex} from "@chakra-ui/react"
import {Board} from "../board"

interface Props {
  // TODO
}

export default function InteractiveBoard(props: Props) {
  return (
    <Box>
      {range(Board.size).map((y) => (
        <Box display="flex">
          {range(Board.size).map((x) => (
            <Flex
              w={60}
              h={60}
              borderWidth={1}
              borderStyle="solid"
              borderColor={isCenterSquare(y, x) ? "grey" : "lightgrey"}
              m={1}
              alignItems="center"
              justifyContent="center"
              color="lightgrey"
            >
              {y},{x}
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
