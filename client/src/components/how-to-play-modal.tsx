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
    '⚽ <strong>How to Play:</strong> Kick the 10 balls, one at a time towards the target zones in the goal before the 45 second timer ends, if playing on teams, both players play the round at the same time with 5 balls each of the same color. For individual play of more than 5 players, you\'ll have multiple players playing during the same round with their own color balls.',
    '🎲 <strong>Scoring:</strong> Add up all the points from the balls that scored into the target zones following the point scoring system from the purple scoring grid on the game application.',
    '⏰ <strong>Time Limit:</strong> Whether on teams or individuals, you have 45 seconds to score as many points as possible with 10 balls.',
    '🏆 <strong>Winning:</strong> Player or Team with the highest score wins!'
  ],
  'elite-shooter': [
    '🎯 <strong>Objective:</strong> Score points by hitting the numbered perimeter target zones (1-9) within 45 second timer.',
    '🏃 <strong>Setup:</strong> Gather 10 balls of the same color and have it ready behind the shooting line.',
    '⚽ <strong>How to Play:</strong> Kick the 10 balls, one at a time towards the numbered perimeter zones (1-9) before the 45 second timer ends, if playing on teams, both players play the round at the same time with 5 balls each of the same color. For individual play of more than 5 players, you\'ll have multiple players playing during the same round with their own color balls.',
    '❌ <strong>Avoid:</strong> Do not shoot into the center zones marked with "X" - these are worth 0 points.',
    '🎲 <strong>Scoring:</strong> Only balls that land in the numbered perimeter zones count for points, only 1 point per perimeter zone, no extra points for multiple balls in the same target zone.',
    '⏰ <strong>Time Limit:</strong> Whether on teams or individuals, you have 45 seconds to score as many points as possible with 10 balls.',
    '🏆 <strong>Winning:</strong> Player or Team with the highest score wins!'
  ],
  'team-relay-shootout': [
    '🎯 <strong>Objective:</strong> Score the most points by shooting into your team\'s color zones and earn points when opponents score into your team\'s color zones.',
    '👥 <strong>Team Setup:</strong> 2-4 teams rotate taking shots with their team color balls at the colored target zones.',
    '⚽ <strong>How to Play:</strong> Players rotate from each team, shooting their team color balls at any colored target zones during the 5-minute game timer.',
    '🎲 <strong>Scoring:</strong> Earn 3 points for scoring in your team\'s color zones. Earn an extra 1 point each time an opponent scores into your team\'s color zones.',
    '🔄 <strong>Team Colors:</strong> Each team is assigned 3 colored target zones on the purple scoring grid - aim for your team colors!',
    '⏰ <strong>Time Limit:</strong> Single 5-minute game with all teams playing simultaneously.',
    '🏆 <strong>Winning:</strong> Team with the highest total score wins!'
  ]
};

export default function HowToPlayModal({ game, isOpen, onClose }: HowToPlayModalProps) {
  if (!game) return null;

  const instructions = gameInstructions[game.type as keyof typeof gameInstructions] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-elite-black rounded-2xl border-2 border-elite-gold w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
              <h3 className="text-2xl md:text-3xl font-bold text-elite-gold">
                How to Play: {game.name}
              </h3>
              <motion.button 
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl flex-shrink-0 ml-4"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <i className="fas fa-times"></i>
              </motion.button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-gray-300 text-base md:text-lg leading-relaxed space-y-4">
                {instructions.map((instruction, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className="text-elite-gold leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: instruction }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Footer - Fixed */}
            <div className="p-6 border-t border-gray-700 text-center flex-shrink-0">
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
