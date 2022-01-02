function incrementSet (state, scorer, nonScorer) {
    scorer.games++
    var currentSet = state.players[PLAYER].sets + state.players[OPPONENT].sets
    if (!state.completedSets[currentSet]) state.completedSets[currentSet] = []
    state.completedSets[currentSet][PLAYER] = scorer.isPlayer ? scorer.games : nonScorer.games
    state.completedSets[currentSet][OPPONENT] = scorer.isPlayer ? nonScorer.games : scorer.games
    scorer.games = 0
    nonScorer.games = 0
    scorer.sets = scorer.sets + 1
    state.isFinalSet = scorer.sets + nonScorer.sets === state.config.numSets - 1
    if (scorer.sets > state.config.numSets - scorer.sets) state.isComplete = true
}
