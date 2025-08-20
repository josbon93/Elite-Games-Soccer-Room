import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { InsertGameSession } from '@shared/schema';

export default function PlayerSelection() {
  const [, setLocation] = useLocation();
  const { 
    currentGame, 
    currentMode,
    currentPlayerCount,
    setCurrentSession 
  } = useGameStore();

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

  const handleStartGame = () => {
    if (!currentGame || currentMode !== 'individual' || !currentPlayerCount) return;

    const sessionData: InsertGameSession = {
      gameId: currentGame.id,
      mode: 'individual',
      playerCount: currentPlayerCount,
      teamCount: null,
      teams: null,
    };

    createSessionMutation.mutate(sessionData);
  };

  useEffect(() => {
    // Redirect to home if no game/mode/playerCount selected
    if (!currentGame || !currentMode || !currentPlayerCount) {
      setLocation('/');
      return;
    }
    
    // If individual mode, start game immediately
    if (currentMode === 'individual') {
      handleStartGame();
    }
  }, [currentGame, currentMode, currentPlayerCount, setLocation]);

  // Show loading state while creating session
  if (createSessionMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            className="inline-flex items-center space-x-3 text-elite-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <i className="fas fa-spinner fa-spin text-2xl"></i>
            <span className="text-xl font-semibold">Starting Individual Game...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return null; // Should redirect before showing anything
}