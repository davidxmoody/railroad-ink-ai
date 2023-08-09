import {Box, SimpleGrid} from "@chakra-ui/react"
import {Tile} from "../dice"

interface Props {
  tile: Tile
}

export default function DrawnTile(props: Props) {
  return (
    <SimpleGrid columns={3} spacing={4} w={60} h={60}>
      <Box />
      <Box>{props.tile[0]}</Box>
      <Box />

      <Box>{props.tile[3]}</Box>
      <Box />
      <Box>{props.tile[1]}</Box>

      <Box />
      <Box>{props.tile[2]}</Box>
      <Box />
    </SimpleGrid>
  )
}
