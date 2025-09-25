import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const GestureWrapper = ({ children, onSwipeRight }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  
  const handleDragEnd = (event, { offset }) => {
    if (offset.x > 100) { // Swipe right threshold
      onSwipeRight();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      className="relative"
    >
      {children}
      <motion.div
        className="fixed top-1/2 right-8 transform -translate-y-1/2 text-white/50 pointer-events-none"
        style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-sm">Slideshow</span>
      </motion.div>
    </motion.div>
  );
};

export default GestureWrapper;
