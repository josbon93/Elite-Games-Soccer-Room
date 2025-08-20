import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import { useState, useEffect } from 'react';
import { AdminReset } from '@/components/admin-reset';

export default function PlayerCount() {
  const [, setLocation] = useLocation();
  const { currentGame, setCurrentPlayerCount } = useGameStore();
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    // Redirect to home if no game selected
    if (!currentGame) {
      setLocation('/');
    }
  }, [currentGame, setLocation]);

  const handlePlayerCountSelect = (count: number) => {
    setSelectedCount(count);
    setCurrentPlayerCount(count);
    setLocation('/game-mode');
  };

  const handleGoBack = () => {
    setLocation('/');
  };

  if (!currentGame) return null;

  const maxCount = currentGame.maxPlayers;
  const minCount = 2;

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
          How Many Players?
        </motion.h2>
        <motion.p 
          className="text-gray-300 text-xl mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Select the total number of players ({minCount}-{maxCount})
        </motion.p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: maxCount - minCount + 1 }, (_, index) => {
            const count = minCount + index;
            return (
              <motion.div
                key={count}
                className="game-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 text-center"
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
                <p className="text-white font-semibold text-lg">{count} Players</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Admin Reset */}
      <AdminReset />
    </div>
  );
}