# Railroad Ink AI

This is a playable version of the board game [Railroad Ink](https://boardgamegeek.com/boardgame/245654/railroad-ink-deep-blue-edition) and an AI algorithm to play it.

[Click here to try it](https://davidxmoody.github.io/railroad-ink-ai/)

![](images/demo.gif)

## Game rules

The full rulebook can be viewed [here](https://cdn.1j1ju.com/medias/9c/f7/6c-railroad-ink-deep-blue-edition-rulebook.pdf) but the following is a simplified explanation:

- The game lasts 7 rounds
- Each round roll 4 "route dice", each one must be drawn onto the board
- Up to 3 times in the game an optional "special route" may be drawn

The final score has several components:

- Points for connecting the pre-printed exits together
- Points for the longest road and longest rail
- Points for drawing something in the 9 center squares
- Negative points for routes that do not connect to anything

## Scoring performance

Railroad Ink is a game about taking and mitigating risks. Good early game moves often introduce many new unconnected routes. This can lead to scores that can look very low until the final round where everything comes together.

For example, each of the 4 standard route dice have 2/6 faces that contain a straight (or T-junction) road. There's only a 20% chance you won't roll any of them in a given round. It's reasonable to bet on finding what you need but poor luck can result in big swings. The special routes help to mitigate bad dice rolls but you only get 3 of them for the whole game.

Some dice faces are also objectively better than others. In particular, T-junction road/rail faces offer flexibility and are also required to create enough branches to connect to every exit.

### Human scores comparison

To get a baseline to compare against, I played 16 games recording the moves made and final scores ([data here](src/data/humanGames.json)). My average score was 51.75 points with a minimum of 35 points and maximum of 68 points. The majority of the scores were in the 50-60 range with a few of them pulling the average down.

Note that all scores given here are for the original version of Railroad Ink without expansions. The "Challenge" edition and expansions add new ways to score points so have the potential for much higher scores.

### AI scores

To gather some scores for the final version of the algorithm, I ran 1000 games with random seeds ([data here](src/data/results.txt)). It took approx 3 hours to run using 6 cores on an M1 MacBook Pro.

The average was 57.3 points with a minimum of 34 and maximum of 71 (and standard deviation of 5.4).

Earlier versions of the algorithm were stuck at around 50 points for a long time. See later sections for some notes on what changes I made over time to improve the score. The main reason I stopped working on this project is that I believed it was already scoring pretty close to the maximum possible average score.

## Algorithm description

TODO

## Development history and experiments

TODO
