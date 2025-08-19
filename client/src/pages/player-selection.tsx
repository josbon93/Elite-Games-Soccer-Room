import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertGameSession } from '@shared/schema';

export default function PlayerSelection() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { 
    currentGame, 
    currentMode, 
    setCurrentMode,
    currentPlayerCount, 
    setCurrentPlayerCount,
    currentTeamCount, 
    setCurrentTeamCount,
    setCurrentSession 
  } = useGameStore();
  
  const [selectedCount, setSelectedCount] = useState(0);

  // Parse URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const modeFromUrl = urlParams.get('mode') as 'individual' | 'team' | null;

  useEffect(() => {
    // Redirect to home if no game selected
    if (!currentGame) {
      setLocation('/');
      return;
    }

    // Set mode from URL if provided
    if (modeFromUrl && modeFromUrl !== currentMode) {
      setCurrentMode(modeFromUrl);
    }
  }, [currentGame, modeFromUrl, currentMode, setCurrentMode, setLocation]);

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

  const handlePlayerCountSelect = (count: number) => {
    setSelectedCount(count);
    setCurrentPlayerCount(count);
  };

  const handleTeamCountSelect = (count: number) => {
    setSelectedCount(count);
    setCurrentTeamCount(count);
  };

  const handleStartGame = () => {
    if (!currentGame || !currentMode) return;

    const teams = currentMode === 'team' ? generateTeams(currentTeamCount) : null;

    const sessionData: InsertGameSession = {
      gameId: currentGame.id,
      mode: currentMode,
      playerCount: currentMode === 'individual' ? currentPlayerCount : null,
      teamCount: currentMode === 'team' ? currentTeamCount : null,
      teams: teams,
    };

    createSessionMutation.mutate(sessionData);
  };

  const generateTeams = (teamCount: number) => {
    const teamColors = ['red', 'blue', 'green', 'yellow'];
    const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team'];
    
    return Array.from({ length: teamCount }, (_, index) => ({
      id: index + 1,
      name: teamNames[index],
      color: teamColors[index],
    }));
  };

  const handleGoBack = () => {
    if (currentGame?.teamsOnly === 1) {
      setLocation('/');
    } else {
      setLocation('/game-mode');
    }
  };

  if (!currentGame || !currentMode) return null;

  const isIndividual = currentMode === 'individual';
  const maxCount = isIndividual ? currentGame.maxPlayers : currentGame.maxTeams;
  const minCount = 2;

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
        
        <div className="text-center mb-12">
          <motion.h2 
            className="text-4xl font-bold text-elite-gold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Select {isIndividual ? 'Number of Players' : 'Number of Teams'}
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isIndividual 
              ? `Choose ${minCount}-${maxCount} individual players` 
              : `Choose ${minCount}-${maxCount} competing teams`
            }
          </motion.p>
        </div>

        {/* Individual Player Selection */}
        {isIndividual && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            {Array.from({ length: maxCount - minCount + 1 }, (_, index) => {
              const count = minCount + index;
              const isSelected = selectedCount === count;
              return (
                <motion.div
                  key={count}
                  className={`game-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                    isSelected ? 'ring-4 ring-elite-gold' : ''
                  }`}
                  onClick={() => handlePlayerCountSelect(count)}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-elite-gold to-elite-gold-dark rounded-full flex items-center justify-center">
                    <span className="text-black text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-white font-semibold">{count} Players</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Team Selection */}
        {!isIndividual && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {Array.from({ length: maxCount - minCount + 1 }, (_, index) => {
              const count = minCount + index;
              const isSelected = selectedCount === count;
              const teamColors = [
                { name: 'Red', bg: 'bg-red-500' },
                { name: 'Blue', bg: 'bg-blue-500' },
                { name: 'Green', bg: 'bg-green-500' },
                { name: 'Yellow', bg: 'bg-yellow-500' },
              ];

              return (
                <motion.div
                  key={count}
                  className={`game-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                    isSelected ? 'ring-4 ring-elite-gold' : ''
                  } ${count === 4 ? 'md:col-span-2' : ''}`}
                  onClick={() => handleTeamCountSelect(count)}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6">{count} Teams</h3>
                  <div className={`flex justify-center ${count === 2 ? 'space-x-4' : count === 3 ? 'space-x-2' : 'space-x-3'} mb-4`}>
                    {teamColors.slice(0, count).map((team, teamIndex) => (
                      <div
                        key={team.name}
                        className={`${count === 2 ? 'w-16 h-16' : count === 3 ? 'w-14 h-14' : 'w-14 h-14'} rounded-full ${team.bg} flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-sm">{team.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-300">
                    {count === 2 ? 'Classic head-to-head competition' :
                     count === 3 ? 'Triple threat showdown' :
                     'Ultimate four-way battle'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          {selectedCount > 0 && (
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
                  Start Game <i className="fas fa-play ml-2"></i>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
