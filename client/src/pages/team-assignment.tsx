import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertGameSession } from '@shared/schema';
import { AdminReset } from '@/components/admin-reset';
import { Button } from '@/components/ui/button';

interface TeamAssignment {
  [playerId: number]: number; // playerId -> teamId
}

export default function TeamAssignment() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { 
    currentGame, 
    currentPlayerCount,
    setCurrentSession,
    setCurrentTeamCount
  } = useGameStore();

  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment>({});
  
  // Calculate number of teams based on player count
  const getTeamCount = (playerCount: number) => {
    if (playerCount <= 4) return 2;
    if (playerCount <= 6) return 3; 
    return 4; // 7-8 players
  };

  const teamCount = getTeamCount(currentPlayerCount || 0);
  const teamColors = ['red', 'blue', 'green', 'yellow'];
  const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team'];

  useEffect(() => {
    // Redirect to home if no game or player count selected
    if (!currentGame || !currentPlayerCount) {
      setLocation('/');
      return;
    }
    
    // Set team count in store
    setCurrentTeamCount(teamCount);
    
    // Initialize empty assignments
    const initialAssignments: TeamAssignment = {};
    for (let i = 1; i <= currentPlayerCount; i++) {
      initialAssignments[i] = 0; // 0 means unassigned
    }
    setTeamAssignments(initialAssignments);
  }, [currentGame, currentPlayerCount, setLocation, setCurrentTeamCount, teamCount]);

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: InsertGameSession) => {
      const response = await apiRequest('POST', '/api/sessions', sessionData);
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      setLocation('/game-start');
    },
  });

  const assignPlayerToTeam = (playerId: number, teamId: number) => {
    // Check if team already has 2 players
    const playersInTeam = getPlayersInTeam(teamId);
    if (playersInTeam.length >= 2) {
      return; // Don't allow more than 2 players per team
    }
    
    setTeamAssignments(prev => ({
      ...prev,
      [playerId]: teamId
    }));
  };

  const resetTeamAssignments = () => {
    const initialAssignments: TeamAssignment = {};
    for (let i = 1; i <= currentPlayerCount; i++) {
      initialAssignments[i] = 0; // 0 means unassigned
    }
    setTeamAssignments(initialAssignments);
  };

  const randomizeTeams = () => {
    const playerIds = Array.from({ length: currentPlayerCount }, (_, i) => i + 1);
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    
    const newAssignments: TeamAssignment = {};
    
    // Distribute players to teams, max 2 per team
    let teamIndex = 0;
    let playersInCurrentTeam = 0;
    
    shuffled.forEach((playerId) => {
      if (playersInCurrentTeam >= 2) {
        teamIndex++;
        playersInCurrentTeam = 0;
      }
      
      if (teamIndex < teamCount) {
        newAssignments[playerId] = teamIndex + 1;
        playersInCurrentTeam++;
      }
    });
    
    setTeamAssignments(newAssignments);
  };

  const handleStartGame = () => {
    if (!currentGame) return;

    // Convert assignments to team structure
    const teams = Array.from({ length: teamCount }, (_, index) => ({
      id: index + 1,
      name: teamNames[index],
      color: teamColors[index],
      players: Object.entries(teamAssignments)
        .filter(([_, teamId]) => teamId === index + 1)
        .map(([playerId]) => parseInt(playerId))
    }));

    const sessionData: InsertGameSession = {
      gameId: currentGame.id,
      mode: 'team',
      playerCount: currentPlayerCount,
      teamCount: teamCount,
      teams: teams,
    };

    createSessionMutation.mutate(sessionData);
  };

  const handleGoBack = () => {
    setLocation('/game-mode');
  };

  const isAllAssigned = Object.values(teamAssignments).every(teamId => teamId > 0);

  if (!currentGame || !currentPlayerCount) return null;

  // Get players assigned to each team
  const getPlayersInTeam = (teamId: number) => {
    return Object.entries(teamAssignments)
      .filter(([_, assignedTeamId]) => assignedTeamId === teamId)
      .map(([playerId]) => parseInt(playerId));
  };

  return (
    <div className="min-h-screen p-8 relative bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.button 
          onClick={handleGoBack}
          className="absolute top-8 left-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back
        </motion.button>
        
        <div className="text-center mb-8">
          <motion.h2 
            className="text-4xl font-bold text-elite-gold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Team Assignment
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-xl mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Assign {currentPlayerCount} players to {teamCount} teams
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-x-4"
          >
            <Button
              onClick={randomizeTeams}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 mb-8"
            >
              <i className="fas fa-random mr-2"></i>
              Randomize Teams
            </Button>
            <Button
              onClick={resetTeamAssignments}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 mb-8"
            >
              <i className="fas fa-undo mr-2"></i>
              Reset All
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: teamCount }, (_, teamIndex) => {
            const teamId = teamIndex + 1;
            const playersInTeam = getPlayersInTeam(teamId);
            const isFull = playersInTeam.length >= 2;
            const color = teamColors[teamIndex];
            
            // Define explicit color classes for better reliability
            const colorClasses = {
              red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400' },
              blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
              green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-400' },
              yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400' }
            }[color] || { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-400' };
            
            return (
              <motion.div
                key={teamId}
                className={`bg-gray-800 border-2 ${colorClasses.border} rounded-xl p-6 ${isFull ? 'ring-2 ring-green-400' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: teamIndex * 0.1 }}
              >
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto mb-3 ${colorClasses.bg} rounded-full flex items-center justify-center`}>
                    <i className={`fas ${isFull ? 'fa-check' : 'fa-users'} text-white text-xl`}></i>
                  </div>
                  <h3 className={`text-xl font-bold ${colorClasses.text}`}>{teamNames[teamIndex]}</h3>
                  <p className="text-gray-400 text-sm">{playersInTeam.length}/2 players {isFull ? '(Full)' : ''}</p>
                </div>
                
                <div className="space-y-2 min-h-[120px]">
                  {playersInTeam.map(playerId => (
                    <button
                      key={playerId}
                      onClick={() => assignPlayerToTeam(playerId, 0)} // Unassign
                      className={`w-full ${colorClasses.bg} bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 text-center transition-colors border border-${color}-500`}
                      title="Click to unassign"
                    >
                      <span className="text-white font-semibold">Player {playerId}</span>
                    </button>
                  ))}
                  {/* Show empty slots */}
                  {Array.from({ length: 2 - playersInTeam.length }, (_, index) => (
                    <div key={`empty-${index}`} className={`bg-gray-700 opacity-50 rounded-lg p-2 text-center border-2 border-dashed ${colorClasses.border}`}>
                      <span className="text-gray-400 font-semibold">Empty Slot</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Unassigned Players */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Unassigned Players</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: currentPlayerCount }, (_, i) => i + 1)
              .filter(playerId => teamAssignments[playerId] === 0)
              .map(playerId => (
                <motion.div
                  key={playerId}
                  className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center cursor-pointer group border-2 border-gray-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-white font-bold mb-3">Player {playerId}</div>
                  <div className="text-gray-300 text-xs mb-2">Choose team:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {teamColors.slice(0, teamCount).map((color, teamIndex) => {
                      const teamIsFull = getPlayersInTeam(teamIndex + 1).length >= 2;
                      
                      // Define explicit color classes for better reliability
                      const colorClasses = {
                        red: { bg: 'bg-red-500', hover: 'hover:bg-red-400', disabled: 'bg-red-300' },
                        blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-400', disabled: 'bg-blue-300' },
                        green: { bg: 'bg-green-500', hover: 'hover:bg-green-400', disabled: 'bg-green-300' },
                        yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', disabled: 'bg-yellow-300' }
                      }[color] || { bg: 'bg-gray-500', hover: 'hover:bg-gray-400', disabled: 'bg-gray-300' };
                      
                      return (
                        <button
                          key={teamIndex}
                          onClick={() => assignPlayerToTeam(playerId, teamIndex + 1)}
                          disabled={teamIsFull}
                          className={`w-8 h-8 rounded-full transition-all flex items-center justify-center text-white text-xs font-bold ${
                            teamIsFull 
                              ? `${colorClasses.disabled} opacity-50 cursor-not-allowed` 
                              : `${colorClasses.bg} ${colorClasses.hover} transform hover:scale-110`
                          }`}
                          title={teamIsFull ? `${teamNames[teamIndex]} is full (2/2)` : `Join ${teamNames[teamIndex]} (${getPlayersInTeam(teamIndex + 1).length}/2)`}
                        >
                          {teamIsFull ? '✕' : (getPlayersInTeam(teamIndex + 1).length + 1)}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Assigned Players (clickable to unassign) */}
        {Object.values(teamAssignments).some(teamId => teamId > 0) && (
          <div className="mb-8">
            <h3 className="text-lg text-gray-400 mb-4 text-center">
              Click any assigned player to unassign them
            </h3>
          </div>
        )}

        <div className="text-center">
          {isAllAssigned && (
            <motion.button
              className="bg-soccer-green text-white px-12 py-4 rounded-xl font-bold text-xl hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStartGame}
              disabled={createSessionMutation.isPending}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {createSessionMutation.isPending ? (
                <span className="inline-flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Starting Game...
                </span>
              ) : (
                <>
                  Start Team Game <i className="fas fa-play ml-2"></i>
                </>
              )}
            </motion.button>
          )}
          
          {!isAllAssigned && (
            <p className="text-gray-400">
              Assign all {currentPlayerCount} players to teams to continue
            </p>
          )}
        </div>
      </div>

      {/* Admin Reset */}
      <AdminReset />
    </div>
  );
}