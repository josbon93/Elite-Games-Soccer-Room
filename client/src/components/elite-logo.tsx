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
        {/* Soccer Goal with Ball */}
        <motion.div 
          className="w-20 h-16 relative flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Goal Posts */}
          <div className="absolute inset-0 border-4 border-elite-gold border-b-0 rounded-t-lg">
            {/* Goal Net Pattern */}
            <div className="absolute inset-1 opacity-30">
              <div className="grid grid-cols-5 grid-rows-3 h-full w-full">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="border border-elite-gold border-opacity-40"></div>
                ))}
              </div>
            </div>
          </div>
          {/* Soccer Ball with FontAwesome Icon */}
          <motion.div 
            className="relative z-10 flex items-center justify-center"
            animate={{ y: [0, -2, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut" 
            }}
          >
            <i className="fas fa-futbol text-white text-3xl drop-shadow-lg"></i>
          </motion.div>
        </motion.div>
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
