# Railroad Ink AI

This is a playable version of the board game [Railroad Ink](https://boardgamegeek.com/boardgame/245654/railroad-ink-deep-blue-edition) and an AI algorithm to play it.

[Click here to try it!](https://davidxmoody.github.io/railroad-ink-ai/)

![](images/demo.gif)

## Introduction

Railroad Ink is a game about planning for an uncertain future and taking calculated risks.

Good early-game moves often don't score well initially but are about setting up for a big payoff in the future. Scores can often look very low (even negative) until everything hopefully comes together in the final round.

I think this makes it a very interesting game to design an algorithm for. It's very different to some games where you can do quite well by "greedily" choosing the highest scoring move each turn. In Railroad Ink, doing that quickly results in blocking off every exit and scoring very poorly.

## Game rules

The full rulebook can be viewed [here](https://cdn.1j1ju.com/medias/9c/f7/6c-railroad-ink-deep-blue-edition-rulebook.pdf) but the following is a simplified explanation:

- The game lasts 7 rounds
- Each round roll 4 "route dice" and draw them onto the board
- Up to 3 times in the game an optional "special route" may be drawn

The final score is a combination of:

- Points for connecting the pre-printed exits together
- Points for the longest road and longest rail
- Points for drawing something in the 9 center squares
- Negative points for routes that do not connect to anything

## Algorithm description

This algorithm is loosely based on Monte Carlo Tree Search ([see here](https://github.com/davidxmoody/mctsbot) for one of my past projects using MCTS in Poker).

The aim is to iteratively build up a partial representation of the "game tree". In simpler games (like Tic-Tac-Toe), it's possible to build a complete game tree with every possible game state and the moves linking them. In more complex games the game tree can be impossibly large so something is needed to focus on the most promising paths.

This algorithm uses random game simulations to create estimates for how good it thinks game states are. A "simulation" involves literally playing out a full remaining game from the given state. Importantly, simulations do not necessarily need to accurately predict the final score. They just need to be fast to run and give a signal that points in the right direction.

I tried out many different simulation strategies including making fully random moves and freely drawing arbitrary routes. The final algorithm uses a custom Naive Bayes classifier to rank and pick from a smaller subset of random options. It's trained on data generated from playing with the fully random simulation strategy. It looks at a small set of quick to calculate features (like number of connections a route makes) to estimate which move the previous algorithm would have been most likely to make.

It also needs to balance exploring unknown states vs deciding between the most promising ones. It does this by first running a small fixed number of simulations starting with every possible opening move. It then runs more simulations by starting with the one that currently has the highest expected score.

It also makes a lot of optimisations based on the fact that the moves in a single round often do not depend on each other. If two moves don't conflict and aren't connected then it doesn't matter which order they are made in.

The final round in each game is treated differently. Because there will be no more random elements, it's feasible to actually compute every possible final state and pick the highest scoring one. This can be quite slow (often half the algorithm's total runtime) but finds a better solution often enough that it's worth it.

## Scoring performance

### Human scores comparison

To get a baseline to compare against, I played 16 games recording the moves made and final scores ([data here](src/data/humanGames.json)). My average score was 51.75 points with a minimum of 35 points and maximum of 68 points. The majority of the scores were in the 50-60 range with a few of them pulling the average down.

Note that all scores given here are for the original version of Railroad Ink without expansions. The "Challenge" edition and expansions add new ways to score points so have the potential for much higher scores.

### AI scores

To gather some scores for the final version of the algorithm, I ran 1000 games with random seeds ([data here](src/data/results.txt)). It took approx 3 hours to run using 6 cores on an M1 MacBook Pro.

The average was 57.3 points with a minimum of 34 and maximum of 71 (and standard deviation of 5.4).

Earlier versions of the algorithm were stuck at around 50 points for a long time. See later sections for some notes on what changes I made over time to improve the score. The main reason I stopped working on this project is that I believed it was already scoring pretty close to the maximum possible average score.
