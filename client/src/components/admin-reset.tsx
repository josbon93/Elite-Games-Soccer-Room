import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { useLocation } from 'wouter';

export function AdminReset() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();
  const { resetGameState } = useGameStore();

  const handleAdminClick = () => {
    if (!isVisible) {
      setIsVisible(true);
      // Auto-hide after 10 seconds if not used
      setTimeout(() => {
        if (!showModal) {
          setIsVisible(false);
        }
      }, 10000);
    } else {
      setShowModal(true);
    }
  };

  const handleReset = () => {
    if (password === 'eg2017') {
      // Reset the game store
      resetGameState();
      // Navigate to home
      setLocation('/');
      // Close modal
      setShowModal(false);
      setPassword('');
      setIsVisible(false);
    } else {
      // Wrong password - shake the input
      const input = document.getElementById('admin-password');
      if (input) {
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
          input.style.animation = '';
        }, 500);
      }
      setPassword('');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPassword('');
    setIsVisible(false);
  };

  return (
    <>
      {/* Admin trigger - positioned in bottom right corner */}
      <div className="fixed bottom-4 right-4 z-40">
        <AnimatePresence>
          {!isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-4 h-4 bg-gray-600 rounded cursor-pointer"
              onClick={handleAdminClick}
              title="Admin Access"
            />
          )}
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                onClick={handleAdminClick}
                variant="outline"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-red-700"
              >
                <i className="fas fa-cog mr-2"></i>
                Admin Reset
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-red-600 rounded-lg p-6 max-w-md mx-4"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                <i className="fas fa-shield-alt mr-2"></i>
                Admin Reset
              </h2>
              <p className="text-gray-300 mb-6">
                Enter admin password to reset the system and return to home screen.
              </p>
              <div className="space-y-4">
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="text-center"
                  onKeyPress={(e) => e.key === 'Enter' && handleReset()}
                  autoFocus
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleReset}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reset System
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-500 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </>
  );
}