import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTimeLeft, setRoundTimeLeft] = useState(45); // 45 seconds per round
  const [totalTimeLeft, setTotalTimeLeft] = useState(300); // 5 minutes total
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [isTotalTimerActive, setIsTotalTimerActive] = useState(false);
  const [totalRounds, setTotalRounds] = useState(4);
  const [activeParticipants, setActiveParticipants] = useState<number[]>([]);
  
  // Score state
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [tempScores, setTempScores] = useState<{ [key: string]: string }>({});

  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scoring grid based on your image
  const scoringGrid = [
    [50, 25, 15, 25, 50],
    [25, -10, 10, -10, 25],
    [15, 10, 10, 10, 15]
  ];

  // Calculate rounds and participants structure
  const calculateGameStructure = () => {
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
      // Round finished
      setIsRoundActive(false);
      if (currentRound < totalRounds) {
        // Auto-advance to next round after 2 seconds
        setTimeout(() => {
          const { participantsPerRound } = calculateGameStructure();
          setCurrentRound(prev => prev + 1);
          setRoundTimeLeft(45);
          // Set active participants for next round
          if (participantsPerRound[currentRound]) {
            setActiveParticipants(participantsPerRound[currentRound]);
          }
        }, 2000);
      } else {
        // Game finished
        setGamePhase('finished');
        setIsTotalTimerActive(false);
      }
    }

    return () => {
      if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    };
  }, [isRoundActive, roundTimeLeft, currentRound, totalRounds]);

  useEffect(() => {
    if (isTotalTimerActive && totalTimeLeft > 0) {
      totalTimerRef.current = setTimeout(() => {
        setTotalTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTotalTimerActive && totalTimeLeft === 0) {
      // Total time expired
      setGamePhase('finished');
      setIsRoundActive(false);
      setIsTotalTimerActive(false);
    }

    return () => {
      if (totalTimerRef.current) clearTimeout(totalTimerRef.current);
    };
  }, [isTotalTimerActive, totalTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setGamePhase('playing');
    setIsTotalTimerActive(true);
  };

  const startRoundTimer = () => {
    setIsRoundActive(true);
  };

  const handleScoreInput = (playerId: number, value: string) => {
    const key = `${playerId}-${currentRound}`;
    setTempScores(prev => ({ ...prev, [key]: value }));
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
                      score > 0 
                        ? score >= 50 ? 'bg-purple-600 text-white' 
                          : score >= 25 ? 'bg-purple-500 text-white'
                          : 'bg-purple-400 text-white'
                        : 'bg-purple-800 text-red-300'
                    }`}
                  >
                    {score > 0 ? `+${score}` : score}
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
              <div className="text-gray-300">Soccer Skeeball</div>
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
                <div className="grid grid-cols-5 gap-1">
                  {scoringGrid.flat().map((score, index) => (
                    <motion.div
                      key={index}
                      className={`h-16 flex items-center justify-center text-xl font-bold rounded border-2 border-black cursor-pointer transition-all ${
                        score > 0 
                          ? score >= 50 ? 'bg-purple-600 text-white hover:bg-purple-500' 
                            : score >= 25 ? 'bg-purple-500 text-white hover:bg-purple-400'
                            : 'bg-purple-400 text-white hover:bg-purple-300'
                          : 'bg-purple-800 text-red-300 hover:bg-purple-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {score > 0 ? `+${score}` : score}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center mb-4">
                {!isRoundActive && roundTimeLeft === 45 && (
                  <Button
                    onClick={startRoundTimer}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Start Round {currentRound}
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
                        return team ? (
                          <span key={teamId} className="bg-elite-gold text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            <div className={`w-3 h-3 rounded-full bg-${team.teamColor}-500`}></div>
                            {team.teamName}
                          </span>
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
                                <Input
                                  type="number"
                                  value={tempScores[`${player.playerId}-${currentRound}`] || ''}
                                  onChange={(e) => handleScoreInput(player.playerId, e.target.value)}
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
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
                                  <div className="text-gray-300">Total: {team.totalScore} pts</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white">Round {currentRound}:</span>
                                <Input
                                  type="number"
                                  value={tempScores[`${team.teamId}-${currentRound}`] || ''}
                                  onChange={(e) => handleScoreInput(team.teamId, e.target.value)}
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
                                <span className="text-gray-300">pts</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                }
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={submitRoundScores}
                  className="bg-elite-gold hover:bg-yellow-600 text-black font-bold px-6 py-3"
                  disabled={isRoundActive}
                >
                  Submit Round {currentRound} Scores
                </Button>
              </div>
            </div>
          </div>
        </div>
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
                  {playerScores
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((player, index) => (
                      <div key={player.playerId} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`text-2xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                            #{index + 1}
                          </div>
                          <div className="text-xl font-bold text-white">{player.playerName}</div>
                        </div>
                        <div className="text-2xl font-bold text-elite-gold">{player.totalScore} pts</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {teamScores
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((team, index) => (
                      <div key={team.teamId} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`text-2xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                            #{index + 1}
                          </div>
                          <div className={`w-6 h-6 rounded-full bg-${team.teamColor}-500`}></div>
                          <div className="text-xl font-bold text-white">{team.teamName}</div>
                        </div>
                        <div className="text-2xl font-bold text-elite-gold">{team.totalScore} pts</div>
                      </div>
                    ))}
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
