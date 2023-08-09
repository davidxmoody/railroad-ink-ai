import {Box, Flex} from "@chakra-ui/react"
import DrawnTile from "./components/DrawnTile"
import InteractiveBoard from "./components/InteractiveBoard"
import {routeDieA, routeDieB, specialRouteTiles} from "./dice"

export default function App() {
  return (
    <Box m={24}>
      <InteractiveBoard />

      <Flex mt={24} flexWrap="wrap">
        {[...routeDieA, ...routeDieB, ...specialRouteTiles].map((tile, i) => (
          <Box m={1} border="1px solid lightgrey">
            <DrawnTile key={i} tile={tile} />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
