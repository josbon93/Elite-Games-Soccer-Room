import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useEffect } from 'react';

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

  useEffect(() => {
    // Redirect to home if no session
    if (!currentSession || !currentGame) {
      setLocation('/');
      return;
    }

    // Simulate game loading and then reset state
    const timer = setTimeout(() => {
      // TODO: This is where you would integrate with actual game hardware/software
      alert('Game would start here! Integration with game hardware/software required.');
      resetGameState();
      setLocation('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentSession, currentGame, setLocation, resetGameState]);

  if (!currentSession || !currentGame) return null;

  const generateGameSummary = () => {
    let summary = `${currentGame.name} - `;
    if (currentMode === 'individual') {
      summary += `${currentPlayerCount} Players`;
    } else {
      summary += `${currentTeamCount} Teams`;
    }
    return summary;
  };

  return (
    <div className="min-h-screen p-8 relative bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ 
            scale: [0.3, 1.05, 0.9, 1], 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.5, 0.7, 1],
            type: "spring",
            damping: 10
          }}
        >
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-soccer-green to-green-600 rounded-full flex items-center justify-center">
            <i className="fas fa-play text-white text-5xl"></i>
          </div>
          <motion.h2 
            className="text-5xl font-bold text-elite-gold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Game Starting!
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-2xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {generateGameSummary()}
          </motion.p>
          <motion.div 
            className="inline-flex items-center space-x-3 text-elite-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.i 
              className="fas fa-spinner text-2xl"
              animate={{ rotate: 360 }}
              transition={{ 
                repeat: Infinity, 
                duration: 1,
                ease: "linear" 
              }}
            />
            <span className="text-xl font-semibold">Preparing your game...</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
