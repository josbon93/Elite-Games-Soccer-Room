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
    setTeamAssignments(prev => ({
      ...prev,
      [playerId]: teamId
    }));
  };

  const randomizeTeams = () => {
    const playerIds = Array.from({ length: currentPlayerCount }, (_, i) => i + 1);
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    
    const newAssignments: TeamAssignment = {};
    
    if (currentPlayerCount <= 4) {
      // 2 teams: distribute evenly
      shuffled.forEach((playerId, index) => {
        newAssignments[playerId] = (index % 2) + 1;
      });
    } else if (currentPlayerCount <= 6) {
      // 3 teams: distribute as evenly as possible
      shuffled.forEach((playerId, index) => {
        newAssignments[playerId] = (index % 3) + 1;
      });
    } else {
      // 4 teams: distribute as evenly as possible
      shuffled.forEach((playerId, index) => {
        newAssignments[playerId] = (index % 4) + 1;
      });
    }
    
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
          >
            <Button
              onClick={randomizeTeams}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 mb-8"
            >
              <i className="fas fa-random mr-2"></i>
              Randomize Teams
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: teamCount }, (_, teamIndex) => {
            const teamId = teamIndex + 1;
            const playersInTeam = getPlayersInTeam(teamId);
            const maxPlayersPerTeam = Math.ceil(currentPlayerCount / teamCount);
            
            return (
              <motion.div
                key={teamId}
                className={`bg-gray-800 border-2 border-${teamColors[teamIndex]}-500 rounded-xl p-6`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: teamIndex * 0.1 }}
              >
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto mb-3 bg-${teamColors[teamIndex]}-500 rounded-full flex items-center justify-center`}>
                    <i className="fas fa-users text-white text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-white">{teamNames[teamIndex]}</h3>
                  <p className="text-gray-400 text-sm">{playersInTeam.length}/{maxPlayersPerTeam} players</p>
                </div>
                
                <div className="space-y-2 min-h-[120px]">
                  {playersInTeam.map(playerId => (
                    <div key={playerId} className="bg-gray-700 rounded-lg p-2 text-center">
                      <span className="text-white font-semibold">Player {playerId}</span>
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
                  className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-white font-bold mb-2">Player {playerId}</div>
                  <div className="grid grid-cols-2 gap-1">
                    {teamColors.slice(0, teamCount).map((color, teamIndex) => (
                      <button
                        key={teamIndex}
                        onClick={() => assignPlayerToTeam(playerId, teamIndex + 1)}
                        className={`w-6 h-6 rounded-full bg-${color}-500 hover:bg-${color}-400 transition-colors`}
                        title={`Assign to ${teamNames[teamIndex]}`}
                      />
                    ))}
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