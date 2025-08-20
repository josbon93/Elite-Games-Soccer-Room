import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '@shared/schema';

interface HowToPlayModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

const gameInstructions = {
  'soccer-skeeball': [
    '🎯 <strong>Objective:</strong> Kick up to 10 shots at the target zones in the goal within 45 second timer.',
    '🏃 <strong>Setup:</strong> Gather 10 balls of the same color and have it ready behind the shooting line.',
    '⚽ <strong>How to Play:</strong> Kick the 10 balls, one at a time towards the target zones in the goal before the 45 second timer ends, if playing on teams, both players play the round at the same time with 5 balls each of the same color.',
    '🎲 <strong>Scoring:</strong> Follow the points system based off the purple grid on the game application to add up all the points from the balls that scored into a target zone.',
    '⏰ <strong>Time Limit:</strong> Whether on teams or individuals, you have 45 seconds to score as many points as possible with 10 balls.',
    '🏆 <strong>Winning:</strong> Player or Team with the highest score wins!'
  ],
  'elite-shooter': [
    '🎯 <strong>Objective:</strong> Hit as many targets as possible within the time limit',
    '⚽ <strong>Setup:</strong> Position yourself at the shooting line with soccer balls ready',
    '🎮 <strong>How to Play:</strong> Kick balls at the illuminated targets as they light up',
    '💡 <strong>Target System:</strong> Targets will light up randomly - hit them while they\'re active',
    '⚡ <strong>Speed Rounds:</strong> Targets light up faster as the game progresses',
    '🏆 <strong>Winning:</strong> Most targets hit wins! Accuracy and speed are key!'
  ],
  'team-relay-shootout': [
    '🏃 <strong>Objective:</strong> Work as a team to complete shooting challenges in relay format',
    '👥 <strong>Team Setup:</strong> Each team lines up behind their designated shooting area',
    '⚽ <strong>How to Play:</strong> Players take turns shooting at targets in sequence',
    '🔄 <strong>Relay Rules:</strong> Next teammate can only shoot after previous player hits their target',
    '⏰ <strong>Time Pressure:</strong> Complete all targets before time runs out',
    '🏆 <strong>Winning:</strong> First team to complete all relay challenges wins!'
  ]
};

export default function HowToPlayModal({ game, isOpen, onClose }: HowToPlayModalProps) {
  if (!game) return null;

  const instructions = gameInstructions[game.type as keyof typeof gameInstructions] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-elite-black rounded-2xl p-8 max-w-2xl mx-4 border-2 border-elite-gold"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-elite-gold">
                How to Play: {game.name}
              </h3>
              <motion.button 
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <i className="fas fa-times"></i>
              </motion.button>
            </div>
            <div className="text-gray-300 text-lg leading-relaxed space-y-4">
              {instructions.map((instruction, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="text-elite-gold"
                    dangerouslySetInnerHTML={{ __html: instruction }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <motion.button 
                onClick={onClose}
                className="bg-elite-gold text-black px-8 py-3 rounded-xl font-bold text-lg hover:bg-elite-gold-dark transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Got It!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
