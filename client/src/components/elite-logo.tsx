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
          
          {/* Soccer Goal with Ball */}
          <motion.div 
            className="w-16 h-16 relative flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Goal Posts */}
            <div className="absolute inset-0 border-4 border-elite-gold border-b-0 rounded-t-lg">
              {/* Goal Net Pattern */}
              <div className="absolute inset-1 opacity-30">
                <div className="grid grid-cols-4 grid-rows-3 h-full w-full">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border border-elite-gold border-opacity-40"></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Soccer Ball */}
            <motion.div 
              className="w-8 h-8 bg-white rounded-full relative z-10 flex items-center justify-center"
              animate={{ y: [0, -2, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut" 
              }}
            >
              {/* Soccer ball pattern */}
              <div className="absolute inset-1">
                <div className="w-2 h-2 bg-black rounded-full mx-auto"></div>
                <div className="absolute top-0 left-1 w-1 h-1 bg-black rounded-full"></div>
                <div className="absolute top-0 right-1 w-1 h-1 bg-black rounded-full"></div>
                <div className="absolute bottom-0 left-1 w-1 h-1 bg-black rounded-full"></div>
                <div className="absolute bottom-0 right-1 w-1 h-1 bg-black rounded-full"></div>
              </div>
            </motion.div>
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
