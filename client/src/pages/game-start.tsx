import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AdminReset } from '@/components/admin-reset';

interface PlayerScore {
  playerId: number;
  playerName: string;
  scores: number[]; // 4 rounds of scores
  totalScore: number;
}

interface TeamScore {
  teamId: number;
  teamName: string;
  teamColor: string;
  scores: number[]; // 4 rounds of scores  
  totalScore: number;
}

export default function GameStart() {
  const [, setLocation] = useLocation();
  const { 
    currentGame, 
    currentMode, 
    currentPlayerCount, 
    currentTeamCount, 
    currentSession,
    resetGameState 
  } = useGameStore();

  // Game state
  const [gamePhase, setGamePhase] = useState<'setup' | 'countdown' | 'playing' | 'finished'>('setup');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTimeLeft, setRoundTimeLeft] = useState(() => {
    // Team Relay Shootout uses 5 minutes for the single round
    return currentGame?.type === 'team-relay-shootout' ? 300 : 45;
  }); 
  const [totalTimeLeft, setTotalTimeLeft] = useState(300); // 5 minutes total
  const [countdownValue, setCountdownValue] = useState(5); // 5 second countdown
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isTotalTimerActive, setIsTotalTimerActive] = useState(false);
  const [totalRounds, setTotalRounds] = useState(4);
  const [activeParticipants, setActiveParticipants] = useState<number[]>([]);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameTimeExpired, setGameTimeExpired] = useState(false);
  const [scoresSubmitted, setScoresSubmitted] = useState(false);
  
  // Score state
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [tempScores, setTempScores] = useState<{ [key: string]: string }>({});

  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scoring grids based on game type
  const getScoringGrid = (): (number | string)[][] => {
    if (currentGame?.type === 'elite-shooter') {
      // Elite Shooter: perimeter zones 1-9, inside zones marked "X"
      return [
        [1, 2, 3, 4, 5],
        [6, 'X', 'X', 'X', 7],
        [8, 'X', 'X', 'X', 9]
      ];
    } else if (currentGame?.type === 'team-relay-shootout') {
      // Team Relay Shootout: randomized color-coded team zones
      const teamColors = ['R', 'B', 'G', 'Y']; // Red, Blue, Green, Yellow
      const activeTeamColors = teamColors.slice(0, currentTeamCount);
      
      // Create 15 positions (3x5 grid)
      const positions = Array(15).fill('');
      
      // Assign 3 zones per team randomly
      const availablePositions = Array.from({ length: 15 }, (_, i) => i);
      
      activeTeamColors.forEach(color => {
        // Assign 3 random positions to each team
        for (let i = 0; i < 3; i++) {
          if (availablePositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const position = availablePositions.splice(randomIndex, 1)[0];
            positions[position] = color;
          }
        }
      });
      
      // Convert to 3x5 grid format
      return [
        positions.slice(0, 5),
        positions.slice(5, 10),
        positions.slice(10, 15)
      ];
    } else {
      // Soccer Skeeball: original scoring values
      return [
        [50, 25, 15, 25, 50],
        [25, -10, 10, -10, 25],
        [15, 10, 10, 10, 15]
      ];
    }
  };

  const scoringGrid = getScoringGrid();

  // Calculate rounds and participants structure
  const calculateGameStructure = () => {
    // Team Relay Shootout only has 1 round with all teams participating
    if (currentGame?.type === 'team-relay-shootout') {
      const allTeams = Array.from({ length: currentTeamCount }, (_, i) => i + 1);
      return { 
        rounds: 1, 
        participantsPerRound: [allTeams]
      };
    }
    
    const participantCount = currentMode === 'individual' ? currentPlayerCount : currentTeamCount;
    
    let rounds = 0;
    let participantsPerRound: number[][] = [];
    
    if (participantCount <= 4) {
      // 2 players = 2 rounds, 3 players = 3 rounds, 4 players = 4 rounds
      rounds = participantCount;
      participantsPerRound = Array.from({ length: rounds }, (_, i) => [i + 1]);
    } else if (participantCount <= 6) {
      // 5-6 players = 3 rounds, 2 players per round
      rounds = 3;
      const playersPerRound = Math.ceil(participantCount / rounds);
      for (let i = 0; i < rounds; i++) {
        const start = i * playersPerRound + 1;
        const end = Math.min((i + 1) * playersPerRound, participantCount);
        participantsPerRound.push(Array.from({ length: end - start + 1 }, (_, j) => start + j));
      }
    } else {
      // 7-8 players = 4 rounds, 2 players per round
      rounds = 4;
      const playersPerRound = Math.ceil(participantCount / rounds);
      for (let i = 0; i < rounds; i++) {
        const start = i * playersPerRound + 1;
        const end = Math.min((i + 1) * playersPerRound, participantCount);
        participantsPerRound.push(Array.from({ length: end - start + 1 }, (_, j) => start + j));
      }
    }
    
    return { rounds, participantsPerRound };
  };

  useEffect(() => {
    // Redirect to home if no session
    if (!currentSession || !currentGame) {
      setLocation('/');
      return;
    }

    const participantCount = currentMode === 'individual' ? currentPlayerCount : currentTeamCount;
    const { rounds, participantsPerRound } = calculateGameStructure();
    
    setTotalRounds(rounds);
    if (participantsPerRound.length > 0) {
      setActiveParticipants(participantsPerRound[0]); // Set first round participants
    }

    // Initialize scores based on mode
    if (currentMode === 'individual' && currentPlayerCount > 0) {
      const initialPlayers: PlayerScore[] = Array.from({ length: currentPlayerCount }, (_, index) => ({
        playerId: index + 1,
        playerName: `Player ${index + 1}`,
        scores: new Array(rounds).fill(0),
        totalScore: 0
      }));
      setPlayerScores(initialPlayers);
    } else if (currentMode === 'team' && currentTeamCount > 0) {
      const teamColors = ['red', 'blue', 'green', 'yellow'];
      const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team'];
      const initialTeams: TeamScore[] = Array.from({ length: currentTeamCount }, (_, index) => ({
        teamId: index + 1,
        teamName: teamNames[index],
        teamColor: teamColors[index],
        scores: new Array(rounds).fill(0),
        totalScore: 0
      }));
      setTeamScores(initialTeams);
    }
  }, [currentSession, currentGame, currentMode, currentPlayerCount, currentTeamCount, setLocation]);

  // Timer effects
  useEffect(() => {
    if (isRoundActive && roundTimeLeft > 0) {
      roundTimerRef.current = setTimeout(() => {
        setRoundTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRoundActive && roundTimeLeft === 0) {
      // Round time finished - stop timer but don't auto-advance
      setIsRoundActive(false);
      setRoundComplete(true);
      // If game time expired while round was active, show modal now
      if (gameTimeExpired) {
        setShowGameOverModal(true);
      }
    }

    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [isRoundActive, roundTimeLeft, gameTimeExpired]);

  useEffect(() => {
    if (isTotalTimerActive && totalTimeLeft > 0) {
      totalTimerRef.current = setTimeout(() => {
        setTotalTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTotalTimerActive && totalTimeLeft === 0) {
      // Total time expired - set flag and show modal only if round is not active
      setIsTotalTimerActive(false);
      setGameTimeExpired(true);
      if (!isRoundActive) {
        setShowGameOverModal(true);
      }
    }

    return () => {
      if (totalTimerRef.current) clearTimeout(totalTimerRef.current);
    };
  }, [isTotalTimerActive, totalTimeLeft]);

  // Countdown timer effect for Team Relay Shootout
  useEffect(() => {
    if (gamePhase === 'countdown' && countdownValue > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
    } else if (gamePhase === 'countdown' && countdownValue === 0) {
      // Start the actual game after countdown
      setGamePhase('playing');
      startRoundTimer();
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [gamePhase, countdownValue]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    // For Team Relay Shootout, start with countdown
    if (currentGame?.type === 'team-relay-shootout') {
      setGamePhase('countdown');
      setCountdownValue(5);
    } else {
      setGamePhase('playing');
      // Don't start total timer here - wait for first round to start
    }
  };

  const startRoundTimer = () => {
    // If scores are submitted and not the last round, advance to next round first
    if (scoresSubmitted && currentRound < totalRounds) {
      const { participantsPerRound } = calculateGameStructure();
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      // Set active participants for next round (using the new round number)
      if (participantsPerRound[nextRound - 1]) { // Array is 0-indexed, rounds are 1-indexed
        setActiveParticipants(participantsPerRound[nextRound - 1]);
      }
    }
    
    setIsRoundActive(true);
    // Set appropriate round time based on game type
    const roundTime = currentGame?.type === 'team-relay-shootout' ? 300 : 45;
    setRoundTimeLeft(roundTime);
    setRoundComplete(false);
    setScoresSubmitted(false);
    // Start total timer only when first round begins
    if (currentRound === 1 && !isTotalTimerActive) {
      setIsTotalTimerActive(true);
    }
  };

  const handleScoreInput = (playerId: number, value: string) => {
    const key = `${playerId}-${currentRound}`;
    setTempScores(prev => ({ ...prev, [key]: value }));
  };

  const incrementScore = (playerId: number, increment: number) => {
    const key = `${playerId}-${currentRound}`;
    const currentValue = parseInt(tempScores[key] || '0');
    let newValue = currentValue + increment;
    
    // For Elite Shooter and Team Relay Shootout, prevent scores from going below 0
    if ((currentGame?.type === 'elite-shooter' || currentGame?.type === 'team-relay-shootout') && newValue < 0) {
      newValue = 0;
    }
    
    setTempScores(prev => ({ ...prev, [key]: newValue.toString() }));
  };

  const submitRoundScores = () => {
    if (currentMode === 'individual') {
      setPlayerScores(prev => prev.map(player => {
        const key = `${player.playerId}-${currentRound}`;
        const score = parseInt(tempScores[key] || '0');
        const newScores = [...player.scores];
        newScores[currentRound - 1] = score;
        return {
          ...player,
          scores: newScores,
          totalScore: newScores.reduce((sum, s) => sum + s, 0)
        };
      }));
    } else {
      setTeamScores(prev => prev.map(team => {
        const key = `${team.teamId}-${currentRound}`;
        const score = parseInt(tempScores[key] || '0');
        const newScores = [...team.scores];
        newScores[currentRound - 1] = score;
        return {
          ...team,
          scores: newScores,
          totalScore: newScores.reduce((sum, s) => sum + s, 0)
        };
      }));
    }

    // Clear temp scores for this round
    const newTempScores = { ...tempScores };
    if (currentMode === 'individual') {
      playerScores.forEach(p => {
        const key = `${p.playerId}-${currentRound}`;
        delete newTempScores[key];
      });
    } else {
      teamScores.forEach(p => {
        const key = `${p.teamId}-${currentRound}`;
        delete newTempScores[key];
      });
    }
    setTempScores(newTempScores);
    setScoresSubmitted(true);
  };

  const startNextRound = () => {
    if (currentRound < totalRounds) {
      const { participantsPerRound } = calculateGameStructure();
      setCurrentRound(prev => prev + 1);
      setRoundTimeLeft(45);
      setRoundComplete(false);
      setScoresSubmitted(false);
      // Set active participants for next round
      if (participantsPerRound[currentRound]) {
        setActiveParticipants(participantsPerRound[currentRound]);
      }
    } else {
      // All rounds complete
      setGamePhase('finished');
      setIsTotalTimerActive(false);
    }
  };

  const exitGame = () => {
    resetGameState();
    setLocation('/');
  };

  if (!currentSession || !currentGame) return null;

  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen p-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-elite-gold mb-4">
              {currentGame.name}
            </h1>
            <p className="text-gray-300 text-xl mb-6">
              {currentMode === 'individual' 
                ? `${currentPlayerCount} Players` 
                : `${currentTeamCount} Teams`} - {totalRounds} Rounds of 45 Seconds Each
            </p>
            
            <Button
              onClick={startGame}
              className="bg-elite-gold hover:bg-yellow-600 text-black font-bold px-8 py-4 text-xl"
            >
              <i className="fas fa-play mr-2"></i>
              Start Game
            </Button>
          </motion.div>

          {/* Scoring Grid Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-elite-gold text-center mb-4">
              Scoring Zones
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-5 gap-2">
                {scoringGrid.flat().map((score, index) => (
                  <div
                    key={index}
                    className={`h-20 flex items-center justify-center text-2xl font-bold rounded-lg border-2 border-black ${
                      currentGame?.type === 'elite-shooter' 
                        ? score === 'X' ? 'bg-purple-800 text-red-300' : 'bg-purple-500 text-white'
                        : currentGame?.type === 'team-relay-shootout'
                          ? score === 'R' ? 'bg-red-500 text-white'
                            : score === 'B' ? 'bg-blue-500 text-white'  
                            : score === 'G' ? 'bg-green-500 text-white'
                            : score === 'Y' ? 'bg-yellow-500 text-black'
                            : 'bg-gray-400 text-gray-600'
                        : typeof score === 'number' && score > 0 
                          ? score >= 50 ? 'bg-purple-600 text-white' 
                            : score >= 25 ? 'bg-purple-500 text-white'
                            : 'bg-purple-400 text-white'
                          : 'bg-purple-800 text-red-300'
                    }`}
                  >
                    {currentGame?.type === 'elite-shooter' 
                      ? score 
                      : currentGame?.type === 'team-relay-shootout'
                        ? score === 'R' ? 'RED'
                          : score === 'B' ? 'BLUE'
                          : score === 'G' ? 'GREEN'
                          : score === 'Y' ? 'YELLOW'
                          : ''
                        : typeof score === 'number' && score > 0 ? `+${score}` : score}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Participants Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-elite-gold text-center mb-4">
              {currentMode === 'individual' ? 'Players' : 'Teams'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {currentMode === 'individual' 
                ? playerScores.map(player => (
                    <Card key={player.playerId} className="bg-gray-800 border-gray-600">
                      <CardContent className="p-4 text-center">
                        <div className="text-elite-gold font-bold">{player.playerName}</div>
                        <div className="text-gray-300">Ready to Play</div>
                      </CardContent>
                    </Card>
                  ))
                : teamScores.map(team => (
                    <Card key={team.teamId} className="bg-gray-800 border-gray-600">
                      <CardContent className="p-4 text-center">
                        <div className={`w-6 h-6 rounded-full mx-auto mb-2 bg-${team.teamColor}-500`}></div>
                        <div className="text-elite-gold font-bold">{team.teamName}</div>
                        <div className="text-gray-300">Ready to Play</div>
                      </CardContent>
                    </Card>
                  ))
              }
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-screen p-4 bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.h1 
            className="text-6xl font-bold text-elite-gold mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Get Ready!
          </motion.h1>
          
          <motion.div
            key={countdownValue}
            className="text-9xl font-bold text-white mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {countdownValue}
          </motion.div>
          
          <motion.p
            className="text-2xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Teams will rotate shooting at their assigned color zones!
          </motion.p>
          
          {/* Display team order */}
          <motion.div
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {teamScores.map((team, index) => (
              <Card key={team.teamId} className="bg-gray-800 border-gray-600">
                <CardContent className="p-4 text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 bg-${team.teamColor}-500`}></div>
                  <div className="text-elite-gold font-bold">{team.teamName}</div>
                  <div className="text-gray-300">Shooting Order: {index + 1}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen p-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Header with Timers */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <div className="text-elite-gold text-xl font-bold">Total Time</div>
              <div className={`text-3xl font-mono ${totalTimeLeft <= 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(totalTimeLeft)}
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-elite-gold">Round {currentRound}/{totalRounds}</h1>
              <div className="text-gray-300">{currentGame?.name || 'Game'}</div>
            </div>
            
            <div className="text-center">
              <div className="text-elite-gold text-xl font-bold">Round Time</div>
              <div className={`text-3xl font-mono ${roundTimeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(roundTimeLeft)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Scoring Grid */}
            <div>
              <h2 className="text-2xl font-bold text-elite-gold text-center mb-4">
                Scoring Zones
              </h2>
              <div className="max-w-lg mx-auto mb-6">
                {/* Soccer Goal Frame */}
                <div className="relative p-6 bg-black">
                  {/* Left Goal Post - shortened to align with grid */}
                  <div className="absolute left-0 top-0 w-6 bg-white" style={{ height: 'calc(100% - 24px)' }}></div>
                  {/* Right Goal Post - shortened to align with grid */}
                  <div className="absolute right-0 top-0 w-6 bg-white" style={{ height: 'calc(100% - 24px)' }}></div>
                  {/* Top Crossbar */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white"></div>
                  
                  {/* Scoring Grid */}
                  <div className="grid grid-cols-5 gap-1 relative z-10">
                    {scoringGrid.flat().map((score, index) => (
                      <motion.div
                        key={index}
                        className={`h-16 flex items-center justify-center text-xl font-bold rounded border-2 border-black cursor-pointer transition-all ${
                          currentGame?.type === 'elite-shooter' 
                            ? score === 'X' ? 'bg-purple-800 text-red-300 hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-400'
                            : currentGame?.type === 'team-relay-shootout'
                              ? score === 'R' ? 'bg-red-500 text-white hover:bg-red-400'
                                : score === 'B' ? 'bg-blue-500 text-white hover:bg-blue-400'  
                                : score === 'G' ? 'bg-green-500 text-white hover:bg-green-400'
                                : score === 'Y' ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                : 'bg-gray-400 text-gray-600 hover:bg-gray-300'
                              : typeof score === 'number' && score > 0 
                                ? score >= 50 ? 'bg-purple-600 text-white hover:bg-purple-500' 
                                  : score >= 25 ? 'bg-purple-500 text-white hover:bg-purple-400'
                                  : 'bg-purple-400 text-white hover:bg-purple-300'
                                : 'bg-purple-800 text-red-300 hover:bg-purple-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {currentGame?.type === 'elite-shooter' 
                          ? score 
                          : currentGame?.type === 'team-relay-shootout'
                            ? score === 'R' ? 'RED'
                              : score === 'B' ? 'BLUE'
                              : score === 'G' ? 'GREEN'
                              : score === 'Y' ? 'YELLOW'
                              : ''
                            : typeof score === 'number' && score > 0 ? `+${score}` : score}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                {!isRoundActive && (roundTimeLeft === 45 || (scoresSubmitted && currentRound < totalRounds)) && (
                  <Button
                    onClick={startRoundTimer}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3"
                  >
                    <i className="fas fa-play mr-2"></i>
                    {scoresSubmitted && currentRound < totalRounds 
                      ? `Start Round ${currentRound + 1}`
                      : `Start Round ${currentRound}`}
                  </Button>
                )}
                
                {isRoundActive && (
                  <div className="text-green-400 font-bold text-xl">
                    <i className="fas fa-clock mr-2"></i>
                    Round {currentRound} Active!
                  </div>
                )}
                
                {!isRoundActive && roundTimeLeft === 0 && (
                  <div className="text-red-400 font-bold text-xl">
                    <i className="fas fa-stop mr-2"></i>
                    Round {currentRound} Complete!
                  </div>
                )}
              </div>
            </div>

            {/* Right: Score Input */}
            <div>
              <h2 className="text-2xl font-bold text-elite-gold text-center mb-4">
                Score Entry - Round {currentRound}
              </h2>
              
              {/* Show active participants for this round */}
              <div className="text-center mb-4">
                <div className="text-gray-300 text-sm mb-2">
                  Playing this round:
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentMode === 'individual' 
                    ? activeParticipants.map(playerId => (
                        <span key={playerId} className="bg-elite-gold text-black px-3 py-1 rounded-full text-sm font-bold">
                          Player {playerId}
                        </span>
                      ))
                    : activeParticipants.map(teamId => {
                        const team = teamScores.find(t => t.teamId === teamId);
                        const sessionTeam = (currentSession?.teams as any[])?.find((t: any) => t.id === teamId);
                        return team ? (
                          <div key={teamId} className="bg-elite-gold text-black px-3 py-2 rounded-lg text-sm font-bold">
                            <div className="flex items-center gap-1 mb-1">
                              <div className={`w-3 h-3 rounded-full bg-${team.teamColor}-500`}></div>
                              {team.teamName}
                            </div>
                            {sessionTeam?.players && sessionTeam.players.length > 0 && (
                              <div className="text-xs opacity-80">
                                Players: {sessionTeam.players.map((playerId: any) => `Player ${playerId}`).join(', ')}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })
                  }
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {currentMode === 'individual' 
                  ? playerScores
                      .filter(player => activeParticipants.includes(player.playerId))
                      .map(player => (
                        <Card key={player.playerId} className="bg-gray-800 border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-elite-gold font-bold text-lg">{player.playerName}</div>
                                <div className="text-gray-300">Total: {player.totalScore} pts</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white">Round {currentRound}:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-8 h-8 p-0"
                                    onClick={() => incrementScore(player.playerId, 
                                      currentGame?.type === 'elite-shooter' ? -1 : 
                                      currentGame?.type === 'team-relay-shootout' ? -1 : -5)}
                                  >
                                    {currentGame?.type === 'elite-shooter' || currentGame?.type === 'team-relay-shootout' ? '-1' : '-5'}
                                  </Button>
                                  <Input
                                    type="number"
                                    value={tempScores[`${player.playerId}-${currentRound}`] || ''}
                                    onChange={(e) => handleScoreInput(player.playerId, e.target.value)}
                                    className="w-16 text-center"
                                    placeholder="0"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-8 h-8 p-0"
                                    onClick={() => incrementScore(player.playerId, 
                                      currentGame?.type === 'elite-shooter' ? 1 : 
                                      currentGame?.type === 'team-relay-shootout' ? 1 : 5)}
                                  >
                                    {currentGame?.type === 'elite-shooter' || currentGame?.type === 'team-relay-shootout' ? '+1' : '+5'}
                                  </Button>
                                </div>
                                <span className="text-gray-300">pts</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  : teamScores
                      .filter(team => activeParticipants.includes(team.teamId))
                      .map(team => (
                        <Card key={team.teamId} className="bg-gray-800 border-gray-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full bg-${team.teamColor}-500`}></div>
                                <div>
                                  <div className="text-elite-gold font-bold text-lg">{team.teamName}</div>
                                  <div className="text-gray-300 text-sm">
                                    {(() => {
                                      const sessionTeam = (currentSession?.teams as any[])?.find((t: any) => t.id === team.teamId);
                                      return sessionTeam?.players && sessionTeam.players.length > 0 
                                        ? `Players: ${sessionTeam.players.map((playerId: any) => `Player ${playerId}`).join(', ')}`
                                        : '';
                                    })()}
                                  </div>
                                  <div className="text-gray-300">Total: {team.totalScore} pts</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white">Round {currentRound}:</span>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-8 h-8 p-0"
                                    onClick={() => incrementScore(team.teamId, 
                                      currentGame?.type === 'elite-shooter' ? -1 : 
                                      currentGame?.type === 'team-relay-shootout' ? -1 : -5)}
                                  >
                                    {currentGame?.type === 'elite-shooter' || currentGame?.type === 'team-relay-shootout' ? '-1' : '-5'}
                                  </Button>
                                  <Input
                                    type="number"
                                    value={tempScores[`${team.teamId}-${currentRound}`] || ''}
                                    onChange={(e) => handleScoreInput(team.teamId, e.target.value)}
                                    className="w-16 text-center"
                                    placeholder="0"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-8 h-8 p-0"
                                    onClick={() => incrementScore(team.teamId, 
                                      currentGame?.type === 'elite-shooter' ? 1 : 
                                      currentGame?.type === 'team-relay-shootout' ? 1 : 5)}
                                  >
                                    {currentGame?.type === 'elite-shooter' || currentGame?.type === 'team-relay-shootout' ? '+1' : '+5'}
                                  </Button>
                                </div>
                                <span className="text-gray-300">pts</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                }
              </div>

              <div className="mt-6 text-center space-y-3">
                {!scoresSubmitted ? (
                  <Button
                    onClick={submitRoundScores}
                    className="bg-elite-gold hover:bg-yellow-600 text-black font-bold px-6 py-3 disabled:bg-gray-500 disabled:text-gray-300"
                    disabled={isRoundActive || !roundComplete}
                  >
                    {isRoundActive ? `Round ${currentRound} In Progress...` : 
                     !roundComplete ? `Round ${currentRound} Timer Not Started` :
                     `Submit Round ${currentRound} Scores`}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-green-400 font-bold">
                      <i className="fas fa-check mr-2"></i>
                      Round {currentRound} Scores Submitted!
                    </div>
                    
                    {currentRound < totalRounds && (
                      <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                        <div className="text-elite-gold font-bold mb-2">
                          Next: Round {currentRound + 1}
                        </div>
                        <div className="text-gray-300 text-sm mb-2">
                          Players up next:
                        </div>
                        <div className="flex justify-center gap-2 flex-wrap">
                          {(() => {
                            const { participantsPerRound } = calculateGameStructure();
                            // Array is 0-indexed, so currentRound (next round) maps to currentRound-1 in array
                            const nextRoundParticipants = participantsPerRound[currentRound] || [];
                            
                            if (currentMode === 'individual') {
                              return nextRoundParticipants.map(playerId => (
                                <span key={playerId} className="bg-elite-gold text-black px-3 py-1 rounded-full text-sm font-bold">
                                  Player {playerId}
                                </span>
                              ));
                            } else {
                              return nextRoundParticipants.map(teamId => {
                                const team = teamScores.find(t => t.teamId === teamId);
                                const sessionTeam = (currentSession?.teams as any[])?.find((t: any) => t.id === teamId);
                                return team ? (
                                  <div key={teamId} className="bg-elite-gold text-black px-3 py-2 rounded-lg text-sm font-bold">
                                    <div className="flex items-center gap-1 mb-1">
                                      <div className={`w-3 h-3 rounded-full bg-${team.teamColor}-500`}></div>
                                      {team.teamName}
                                    </div>
                                    {sessionTeam?.players && sessionTeam.players.length > 0 && (
                                      <div className="text-xs opacity-80">
                                        {sessionTeam.players.map((playerId: any) => `Player ${playerId}`).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                ) : null;
                              });
                            }
                          })()}
                        </div>
                        <div className="text-gray-400 text-xs mt-2 text-center">
                          Get ready! Click "Start Round {currentRound + 1}" when ready.
                        </div>
                      </div>
                    )}
                    
                    {currentRound >= totalRounds && (
                      <Button
                        onClick={() => setGamePhase('finished')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3"
                      >
                        <i className="fas fa-trophy mr-2"></i>
                        View Final Results
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Over Modal */}
        {showGameOverModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md mx-4"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">
                  <i className="fas fa-clock mr-2"></i>
                  Game Over!
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  5-minute timer has expired. The round has finished - please add final scores and exit the game.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowGameOverModal(false)}
                    className="bg-elite-gold hover:bg-yellow-600 text-black font-bold px-6 py-3 w-full"
                  >
                    Continue Adding Scores
                  </Button>
                  <Button
                    onClick={exitGame}
                    variant="outline"
                    className="border-gray-500 text-gray-300 hover:bg-gray-700 px-6 py-3 w-full"
                  >
                    Exit Game Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Admin Reset */}
        <AdminReset />
      </div>
    );
  }

  // Game finished
  return (
    <div className="min-h-screen p-8 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-5xl font-bold text-elite-gold mb-8">Game Complete!</h1>
          
          <Card className="bg-gray-800 border-gray-600 mb-8">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold text-elite-gold mb-6">Final Scores</h2>
              
              {currentMode === 'individual' ? (
                <div className="space-y-4">
                  {(() => {
                    const sortedPlayers = playerScores.sort((a, b) => b.totalScore - a.totalScore);
                    const highestScore = sortedPlayers[0]?.totalScore || 0;
                    const playersWithHighestScore = sortedPlayers.filter(p => p.totalScore === highestScore);
                    const isTie = playersWithHighestScore.length > 1;

                    return sortedPlayers.map((player) => {
                      const isWinner = player.totalScore === highestScore;
                      let resultLabel = '';
                      let resultColor = '';
                      
                      if (isWinner && isTie) {
                        resultLabel = 'T';
                        resultColor = 'text-yellow-400';
                      } else if (isWinner && !isTie) {
                        resultLabel = 'W';
                        resultColor = 'text-green-400';
                      } else {
                        resultLabel = 'L';
                        resultColor = 'text-red-400';
                      }

                      return (
                        <div key={player.playerId} className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className={`text-2xl font-bold ${resultColor}`}>
                              {resultLabel}
                            </div>
                            <div className="text-xl font-bold text-white">{player.playerName}</div>
                          </div>
                          <div className="text-2xl font-bold text-elite-gold">{player.totalScore} pts</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const sortedTeams = teamScores.sort((a, b) => b.totalScore - a.totalScore);
                    const highestScore = sortedTeams[0]?.totalScore || 0;
                    const teamsWithHighestScore = sortedTeams.filter(t => t.totalScore === highestScore);
                    const isTie = teamsWithHighestScore.length > 1;

                    return sortedTeams.map((team) => {
                      const isWinner = team.totalScore === highestScore;
                      let resultLabel = '';
                      let resultColor = '';
                      
                      if (isWinner && isTie) {
                        resultLabel = 'T';
                        resultColor = 'text-yellow-400';
                      } else if (isWinner && !isTie) {
                        resultLabel = 'W';
                        resultColor = 'text-green-400';
                      } else {
                        resultLabel = 'L';
                        resultColor = 'text-red-400';
                      }

                      return (
                        <div key={team.teamId} className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className={`text-2xl font-bold ${resultColor}`}>
                              {resultLabel}
                            </div>
                            <div className={`w-6 h-6 rounded-full bg-${team.teamColor}-500`}></div>
                            <div>
                              <div className="text-xl font-bold text-white">{team.teamName}</div>
                              <div className="text-sm text-gray-400">
                                {(() => {
                                  const sessionTeam = (currentSession?.teams as any[])?.find((t: any) => t.id === team.teamId);
                                  return sessionTeam?.players && sessionTeam.players.length > 0 
                                    ? `Players: ${sessionTeam.players.map((playerId: any) => `Player ${playerId}`).join(', ')}`
                                    : '';
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-elite-gold">{team.totalScore} pts</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              resetGameState();
              setLocation('/');
            }}
            className="bg-elite-gold hover:bg-yellow-600 text-black font-bold px-8 py-4 text-xl"
          >
            <i className="fas fa-home mr-2"></i>
            Return to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
