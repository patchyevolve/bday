import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';

const CelebrationScreen = () => {
  const navigate = useNavigate();
  const { playSuccessSound } = useAudio();

  const handleButtonClick = (path) => {
    playSuccessSound();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* Floating hearts background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-500"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: -100,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "loop",
              delay: Math.random() * 5,
            }}
          >
            ❤️
          </motion.div>
        ))}
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 relative"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          🎉 Congratulations! 🎉
        </h1>
        <p className="text-xl text-purple-200">
          You've mastered the birthday song!
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-md relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleButtonClick('/game')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">Play Again</span>
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            initial={false}
            whileHover={{ scale: 1.5 }}
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleButtonClick('/special-poem')}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">Special Poem</span>
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            initial={false}
            whileHover={{ scale: 1.5 }}
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleButtonClick('/new-poem')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">New Poem</span>
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            initial={false}
            whileHover={{ scale: 1.5 }}
          />
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-purple-200 text-sm"
      >
        <p>Choose an option to continue your birthday celebration!</p>
      </motion.div>
    </div>
  );
};

export default CelebrationScreen;
