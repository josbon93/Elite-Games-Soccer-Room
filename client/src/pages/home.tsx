import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useGameStore } from '@/lib/game-store';
import type { Game } from '@shared/schema';
import EliteLogo from '@/components/elite-logo';
import GameCard from '@/components/game-card';
import HowToPlayModal from '@/components/how-to-play-modal';
import { AdminReset } from '@/components/admin-reset';
import { useState } from 'react';

export default function Home() {
  const [, setLocation] = useLocation();
  const { setCurrentGame, setCurrentMode } = useGameStore();
  const [modalGame, setModalGame] = useState<Game | null>(null);

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const handleSelectGame = (game: Game) => {
    console.log('Selected game:', game);
    setCurrentGame(game);
    // Handle Team Relay Shootout (teams only)
    if (game.type === 'team-relay-shootout') {
      console.log('Setting team mode and navigating to player count');
      setCurrentMode('team'); // Set mode directly in store
      setLocation('/player-count');
    } else {
      setLocation('/player-count');
    }
  };

  const handleShowInstructions = (game: Game) => {
    setModalGame(game);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <motion.div
            className="inline-flex items-center space-x-3 text-elite-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <i className="fas fa-spinner fa-spin text-2xl"></i>
            <span className="text-xl font-semibold">Loading games...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><pattern id='soccer' patternUnits='userSpaceOnUse' width='100' height='100'><circle cx='50' cy='50' r='30' fill='none' stroke='%23D4AF37' stroke-width='1' opacity='0.3'/><line x1='0' y1='50' x2='100' y2='50' stroke='%23D4AF37' stroke-width='0.5' opacity='0.2'/><line x1='50' y1='0' x2='50' y2='100' stroke='%23D4AF37' stroke-width='0.5' opacity='0.2'/></pattern></defs><rect width='100' height='100' fill='url(%23soccer)'/></svg>")`,
            backgroundSize: '200px 200px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 text-center mb-12">
        <EliteLogo />
        <motion.h2 
          className="text-4xl font-bold text-white mb-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          Soccer Game Room
        </motion.h2>
        <motion.p 
          className="text-gray-300 text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          Choose your mini-game adventure!
        </motion.p>
      </header>

      {/* Game Selection Grid */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games?.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              onSelectGame={handleSelectGame}
              onShowInstructions={handleShowInstructions}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal
        game={modalGame}
        isOpen={!!modalGame}
        onClose={() => setModalGame(null)}
      />

      {/* Admin Reset */}
      <AdminReset />
    </div>
  );
}
