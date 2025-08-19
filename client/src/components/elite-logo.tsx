import { motion } from 'framer-motion';

export default function EliteLogo() {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center mb-4">
        <div className="flex items-center space-x-4">
          {/* Laurel Left */}
          <div className="text-elite-gold text-3xl">
            <i className="fas fa-leaf transform -rotate-45"></i>
            <i className="fas fa-leaf transform -rotate-12"></i>
            <i className="fas fa-leaf transform rotate-12"></i>
          </div>
          
          {/* Camera Aperture Icon */}
          <motion.div 
            className="w-16 h-16 rounded-full border-4 border-elite-gold flex items-center justify-center"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-camera text-elite-gold text-2xl"></i>
          </motion.div>
          
          {/* Laurel Right */}
          <div className="text-elite-gold text-3xl">
            <i className="fas fa-leaf transform rotate-45"></i>
            <i className="fas fa-leaf transform rotate-12"></i>
            <i className="fas fa-leaf transform -rotate-12"></i>
          </div>
        </div>
      </div>
      <motion.h1 
        className="text-6xl font-bold text-elite-gold tracking-wider mb-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        ELITE GAMES
      </motion.h1>
      <p className="text-elite-gold text-xl font-medium">Utah's First Indoor Sports Mini-Game Park</p>
    </motion.div>
  );
}
