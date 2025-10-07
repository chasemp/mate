/**
 * Tournament Manager - Tournament mode system
 * Phase 11: Advanced Features
 * 
 * Manages tournament creation, progression, and statistics
 */

export class TournamentManager {
  constructor() {
    this.currentTournament = null;
    this.tournamentHistory = this.loadTournamentHistory();
    this.tournamentTypes = this.initializeTournamentTypes();
  }
  
  /**
   * Initialize tournament types
   */
  initializeTournamentTypes() {
    return {
      'single-elimination': {
        name: 'Single Elimination',
        description: 'Lose once and you\'re out',
        minPlayers: 2,
        maxPlayers: 16,
        rounds: 'log2(players)',
        format: 'best-of-1'
      },
      'double-elimination': {
        name: 'Double Elimination',
        description: 'Lose twice and you\'re out',
        minPlayers: 4,
        maxPlayers: 16,
        rounds: '2*log2(players)',
        format: 'best-of-1'
      },
      'round-robin': {
        name: 'Round Robin',
        description: 'Everyone plays everyone',
        minPlayers: 3,
        maxPlayers: 8,
        rounds: 'players-1',
        format: 'best-of-1'
      },
      'swiss': {
        name: 'Swiss System',
        description: 'Players with similar records play each other',
        minPlayers: 4,
        maxPlayers: 32,
        rounds: 'log2(players)',
        format: 'best-of-1'
      }
    };
  }
  
  /**
   * Create a new tournament
   */
  createTournament(config) {
    const tournament = {
      id: Date.now().toString(),
      name: config.name || 'Tournament',
      type: config.type || 'single-elimination',
      gameType: config.gameType || 'chess',
      aiDifficulty: config.aiDifficulty || 5,
      timeControl: config.timeControl || 'unlimited',
      status: 'pending',
      players: [],
      rounds: [],
      currentRound: 0,
      winner: null,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      settings: {
        allowUndo: config.allowUndo || false,
        allowHints: config.allowHints || false,
        showMoves: config.showMoves || true
      }
    };
    
    // Add players
    if (config.players && config.players.length > 0) {
      tournament.players = config.players.map((player, index) => ({
        id: `player-${index}`,
        name: player.name || `Player ${index + 1}`,
        type: player.type || 'human', // human, ai
        aiDifficulty: player.aiDifficulty || config.aiDifficulty,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        eliminated: false,
        seed: index + 1
      }));
    }
    
    // Generate bracket/rounds
    this.generateTournamentStructure(tournament);
    
    this.currentTournament = tournament;
    this.saveTournament();
    
    return tournament;
  }
  
  /**
   * Generate tournament structure based on type
   */
  generateTournamentStructure(tournament) {
    const playerCount = tournament.players.length;
    const type = tournament.type;
    
    switch (type) {
      case 'single-elimination':
        this.generateSingleEliminationBracket(tournament);
        break;
      case 'double-elimination':
        this.generateDoubleEliminationBracket(tournament);
        break;
      case 'round-robin':
        this.generateRoundRobinSchedule(tournament);
        break;
      case 'swiss':
        this.generateSwissSchedule(tournament);
        break;
    }
  }
  
  /**
   * Generate single elimination bracket
   */
  generateSingleEliminationBracket(tournament) {
    const players = [...tournament.players];
    const rounds = Math.ceil(Math.log2(players.length));
    
    // Add byes if needed
    const totalSlots = Math.pow(2, rounds);
    const byes = totalSlots - players.length;
    
    for (let i = 0; i < byes; i++) {
      players.push({
        id: `bye-${i}`,
        name: 'Bye',
        type: 'bye',
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        eliminated: false,
        seed: players.length + i + 1
      });
    }
    
    // Generate rounds
    for (let round = 0; round < rounds; round++) {
      const roundMatches = [];
      const matchCount = Math.pow(2, rounds - round - 1);
      
      for (let match = 0; match < matchCount; match++) {
        roundMatches.push({
          id: `round-${round}-match-${match}`,
          round: round,
          match: match,
          players: [],
          result: null,
          winner: null,
          completed: false,
          games: []
        });
      }
      
      tournament.rounds.push(roundMatches);
    }
    
    // Assign first round matches
    this.assignFirstRoundMatches(tournament, players);
  }
  
  /**
   * Generate round robin schedule
   */
  generateRoundRobinSchedule(tournament) {
    const players = [...tournament.players];
    const playerCount = players.length;
    const rounds = playerCount - 1;
    
    // Generate round robin pairs
    for (let round = 0; round < rounds; round++) {
      const roundMatches = [];
      
      for (let i = 0; i < playerCount / 2; i++) {
        const player1 = players[i];
        const player2 = players[playerCount - 1 - i];
        
        roundMatches.push({
          id: `round-${round}-match-${i}`,
          round: round,
          match: i,
          players: [player1, player2],
          result: null,
          winner: null,
          completed: false,
          games: []
        });
      }
      
      tournament.rounds.push(roundMatches);
      
      // Rotate players (except first)
      const first = players[0];
      const last = players[playerCount - 1];
      players.splice(1, 0, last);
      players.pop();
    }
  }
  
  /**
   * Start tournament
   */
  startTournament() {
    if (!this.currentTournament || this.currentTournament.status !== 'pending') {
      return false;
    }
    
    this.currentTournament.status = 'active';
    this.currentTournament.startedAt = Date.now();
    this.currentTournament.currentRound = 0;
    
    this.saveTournament();
    return true;
  }
  
  /**
   * Get current round matches
   */
  getCurrentRoundMatches() {
    if (!this.currentTournament || this.currentTournament.status !== 'active') {
      return [];
    }
    
    const currentRound = this.currentTournament.currentRound;
    return this.currentTournament.rounds[currentRound] || [];
  }
  
  /**
   * Record match result
   */
  recordMatchResult(roundIndex, matchIndex, result) {
    if (!this.currentTournament) return false;
    
    const round = this.currentTournament.rounds[roundIndex];
    if (!round || !round[matchIndex]) return false;
    
    const match = round[matchIndex];
    match.result = result;
    match.completed = true;
    match.winner = result.winner;
    
    // Update player statistics
    this.updatePlayerStats(match, result);
    
    // Check if round is complete
    if (this.isRoundComplete(roundIndex)) {
      this.completeRound(roundIndex);
    }
    
    this.saveTournament();
    return true;
  }
  
  /**
   * Update player statistics
   */
  updatePlayerStats(match, result) {
    const players = this.currentTournament.players;
    
    match.players.forEach(player => {
      const playerData = players.find(p => p.id === player.id);
      if (!playerData) return;
      
      if (result.winner === player.id) {
        playerData.wins++;
        playerData.points += 1;
      } else if (result.winner === 'draw') {
        playerData.draws++;
        playerData.points += 0.5;
      } else {
        playerData.losses++;
      }
    });
  }
  
  /**
   * Check if round is complete
   */
  isRoundComplete(roundIndex) {
    const round = this.currentTournament.rounds[roundIndex];
    return round.every(match => match.completed);
  }
  
  /**
   * Complete a round
   */
  completeRound(roundIndex) {
    const tournament = this.currentTournament;
    const round = tournament.rounds[roundIndex];
    
    // Advance winners to next round (for elimination tournaments)
    if (tournament.type === 'single-elimination' || tournament.type === 'double-elimination') {
      this.advanceWinners(roundIndex);
    }
    
    // Move to next round
    tournament.currentRound++;
    
    // Check if tournament is complete
    if (this.isTournamentComplete()) {
      this.completeTournament();
    }
  }
  
  /**
   * Advance winners to next round
   */
  advanceWinners(roundIndex) {
    const tournament = this.currentTournament;
    const round = tournament.rounds[roundIndex];
    const nextRound = tournament.rounds[roundIndex + 1];
    
    if (!nextRound) return;
    
    const winners = round
      .filter(match => match.winner && match.winner !== 'draw')
      .map(match => {
        const player = tournament.players.find(p => p.id === match.winner);
        return player;
      });
    
    // Assign winners to next round matches
    let matchIndex = 0;
    for (let i = 0; i < winners.length; i += 2) {
      if (nextRound[matchIndex]) {
        nextRound[matchIndex].players = [winners[i], winners[i + 1] || null];
        matchIndex++;
      }
    }
  }
  
  /**
   * Check if tournament is complete
   */
  isTournamentComplete() {
    const tournament = this.currentTournament;
    
    if (tournament.type === 'single-elimination') {
      const lastRound = tournament.rounds[tournament.rounds.length - 1];
      return lastRound && lastRound.length === 1 && lastRound[0].completed;
    }
    
    if (tournament.type === 'round-robin') {
      return tournament.currentRound >= tournament.rounds.length;
    }
    
    return false;
  }
  
  /**
   * Complete tournament
   */
  completeTournament() {
    const tournament = this.currentTournament;
    tournament.status = 'completed';
    tournament.completedAt = Date.now();
    
    // Determine winner
    if (tournament.type === 'single-elimination') {
      const finalMatch = tournament.rounds[tournament.rounds.length - 1][0];
      tournament.winner = finalMatch.winner;
    } else if (tournament.type === 'round-robin') {
      // Winner is player with most points
      const sortedPlayers = tournament.players.sort((a, b) => b.points - a.points);
      tournament.winner = sortedPlayers[0].id;
    }
    
    // Add to history
    this.tournamentHistory.unshift(tournament);
    
    // Keep only last 50 tournaments
    if (this.tournamentHistory.length > 50) {
      this.tournamentHistory.splice(50);
    }
    
    this.saveTournament();
    this.saveTournamentHistory();
  }
  
  /**
   * Get tournament standings
   */
  getTournamentStandings() {
    if (!this.currentTournament) return [];
    
    const players = [...this.currentTournament.players];
    
    // Sort by points, then by wins, then by losses
    players.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
    
    return players.map((player, index) => ({
      ...player,
      position: index + 1
    }));
  }
  
  /**
   * Get tournament statistics
   */
  getTournamentStats() {
    if (!this.currentTournament) return null;
    
    const totalMatches = this.currentTournament.rounds.reduce((total, round) => {
      return total + round.length;
    }, 0);
    
    const completedMatches = this.currentTournament.rounds.reduce((total, round) => {
      return total + round.filter(match => match.completed).length;
    }, 0);
    
    return {
      totalPlayers: this.currentTournament.players.length,
      totalRounds: this.currentTournament.rounds.length,
      currentRound: this.currentTournament.currentRound + 1,
      totalMatches,
      completedMatches,
      completionRate: (completedMatches / totalMatches) * 100,
      duration: this.currentTournament.startedAt ? 
        Date.now() - this.currentTournament.startedAt : 0
    };
  }
  
  /**
   * Load tournament history
   */
  loadTournamentHistory() {
    const saved = localStorage.getItem('mate-tournament-history');
    return saved ? JSON.parse(saved) : [];
  }
  
  /**
   * Save tournament
   */
  saveTournament() {
    if (this.currentTournament) {
      localStorage.setItem('mate-current-tournament', JSON.stringify(this.currentTournament));
    }
  }
  
  /**
   * Save tournament history
   */
  saveTournamentHistory() {
    localStorage.setItem('mate-tournament-history', JSON.stringify(this.tournamentHistory));
  }
  
  /**
   * Load current tournament
   */
  loadCurrentTournament() {
    const saved = localStorage.getItem('mate-current-tournament');
    if (saved) {
      this.currentTournament = JSON.parse(saved);
      return true;
    }
    return false;
  }
  
  /**
   * Clear current tournament
   */
  clearCurrentTournament() {
    this.currentTournament = null;
    localStorage.removeItem('mate-current-tournament');
  }
  
  /**
   * Get all tournament types
   */
  getTournamentTypes() {
    return this.tournamentTypes;
  }
  
  /**
   * Get tournament history
   */
  getTournamentHistory(limit = 10) {
    return this.tournamentHistory.slice(0, limit);
  }
}
