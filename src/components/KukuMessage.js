import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KukuMessage = ({ isVisible, onClose }) => {
  const specialBirthdayMessage = `My dearest Kuku,

Happy 17th birthday!

My heart is absolutely overflowing with love for you, and it's a love so pure and true, I can see it in your beautiful eyes every single day. Thank you for always being with me, for loving me so purely and completely. You are truly the most wonderful and beautiful girl I have ever known, and the best thing that has ever happened to me.

I promise you with all my heart that I will be right there beside you through every single moment of our lives. I will love you unconditionally, always and forever, and I will be your biggest supporter in everything you do. Never forget how amazing you are and how much you deserve. You are capable of anything you set your mind to, and I know you will achieve all of your dreams and have the most incredible life.

You are my best girl, and you always will be.

I love you more than words can ever say.

Forever yours,
ify`;

  const kukuMessages = [
    specialBirthdayMessage,
    "My dearest Kuku, you light up my world with your beautiful smile 💖",
    "Every moment with you feels like a fairy tale come true ✨",
    "Your laughter is the most beautiful melody I've ever heard 🎵",
    "You make every ordinary day feel extraordinary just by being you 🌟",
    "My heart skips a beat every time I see your gorgeous eyes 👀💕",
    "You're not just beautiful on the outside, your soul shines even brighter ✨",
    "Thank you for being the most amazing person in my life 🥰",
    "I fall in love with you more and more each passing day 💘",
    "Your kindness and warmth make the world a better place 🌍💖",
    "You are my sunshine, my moonlight, and all my stars combined 🌞🌙⭐"
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-2xl w-full mx-4 bg-gradient-to-br from-pink-500/90 via-rose-500/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 100 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              duration: 0.6 
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 50px rgba(236, 72, 153, 0.5), 0 0 100px rgba(147, 51, 234, 0.3)'
            }}
          >
            {/* Close button */}
            <motion.button
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 
                className="text-4xl font-bold text-white mb-2"
                style={{
                  fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
                }}
              >
                💖 For My Beautiful Kuku 💖
              </h2>
              <div className="flex justify-center space-x-2">
                {['💕', '✨', '🌹', '💖', '🌟'].map((emoji, index) => (
                  <motion.span
                    key={index}
                    className="text-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Messages container */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {kukuMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 ${index === 0 ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-pink-300/40' : ''}`}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <p 
                      className={`text-white leading-relaxed ${index === 0 ? 'text-lg' : 'text-lg'}`}
                      style={{
                        fontFamily: index === 0 
                          ? "'Playfair Display', 'Georgia', serif" 
                          : "'Poppins', 'Arial', sans-serif",
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'pre-line',
                        lineHeight: index === 0 ? '1.8' : '1.6'
                      }}
                    >
                      {message}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <motion.div
              className="text-center mt-7"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <p 
                className="text-white/90 text-lg"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                With all my love, always and forever 💕
              </p>
              <motion.div
                className="flex justify-center mt-4 space-x-1"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {['❤️', '💖', '💕', '💘', '💝'].map((heart, index) => (
                  <span key={index} className="text-xl">
                    {heart}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Floating hearts animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-pink-200/30"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: '100%',
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: '-20%',
                    x: Math.random() * 100 + '%',
                  }}
                  transition={{
                    duration: Math.random() * 3 + 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: Math.random() * 3,
                  }}
                >
                  💖
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KukuMessage;
