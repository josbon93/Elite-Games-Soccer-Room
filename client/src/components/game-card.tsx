import { motion } from 'framer-motion';
import type { Game } from '@shared/schema';

interface GameCardProps {
  game: Game;
  onSelectGame: (game: Game) => void;
  onShowInstructions: (game: Game) => void;
  index: number;
}

const gameIcons = {
  'soccer-skeeball': 'fas fa-bullseye',
  'elite-shooter': 'fas fa-futbol',
  'team-relay-shootout': 'fas fa-users',
};

export default function GameCard({ game, onSelectGame, onShowInstructions, index }: GameCardProps) {
  return (
    <motion.div 
      className="game-card rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={() => onSelectGame(game)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-center">
        <motion.div 
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-elite-gold to-elite-gold-dark rounded-full flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <i className={`${gameIcons[game.type as keyof typeof gameIcons]} text-black text-4xl`}></i>
        </motion.div>
        <h3 className="text-2xl font-bold text-elite-gold mb-4">{game.name}</h3>
        <p className="text-gray-300 text-lg mb-6 leading-relaxed">{game.description}</p>
        <div className="flex flex-col space-y-3">
          <motion.button 
            className="bg-elite-gold text-black px-6 py-3 rounded-xl font-bold text-lg hover:bg-elite-gold-dark transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onShowInstructions(game);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            How to Play
          </motion.button>
          <motion.button 
            className="bg-soccer-green text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Select This Game
          </motion.button>
        </div>
        {game.teamsOnly === 1 && (
          <motion.div 
            className="mt-4 px-3 py-2 bg-red-600 rounded-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + index * 0.2 }}
          >
            <span className="text-sm font-semibold">TEAMS ONLY</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
