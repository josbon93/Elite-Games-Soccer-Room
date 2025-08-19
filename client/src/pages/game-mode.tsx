import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useEffect } from 'react';

export default function GameMode() {
  const [, setLocation] = useLocation();
  const { currentGame, setCurrentMode } = useGameStore();

  useEffect(() => {
    // Redirect to home if no game selected
    if (!currentGame) {
      setLocation('/');
    }
  }, [currentGame, setLocation]);

  const handleSelectMode = (mode: 'individual' | 'team') => {
    setCurrentMode(mode);
    setLocation(`/player-selection?mode=${mode}`);
  };

  const handleGoBack = () => {
    setLocation('/');
  };

  if (!currentGame) return null;

  return (
    <div className="min-h-screen p-8 relative bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <motion.button 
          onClick={handleGoBack}
          className="absolute top-8 left-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-arrow-left mr-2"></i> Back
        </motion.button>
        
        <motion.h2 
          className="text-4xl font-bold text-elite-gold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentGame.name} - Game Mode Selection
        </motion.h2>
        <motion.p 
          className="text-gray-300 text-xl mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          How would you like to play?
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Individual Play */}
          <motion.div 
            className="game-card rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105" 
            onClick={() => handleSelectMode('individual')}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Individual Play</h3>
              <p className="text-gray-300 text-lg mb-6">Compete on your own or with friends individually</p>
              <p className="text-elite-gold font-semibold">2-{currentGame.maxPlayers} Players</p>
            </div>
          </motion.div>

          {/* Team Play */}
          <motion.div 
            className="game-card rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105" 
            onClick={() => handleSelectMode('team')}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Team Play</h3>
              <p className="text-gray-300 text-lg mb-6">Form teams and compete against each other</p>
              <p className="text-elite-gold font-semibold">2-{currentGame.maxTeams} Teams</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
