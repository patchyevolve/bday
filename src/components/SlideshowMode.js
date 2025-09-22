import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';

const SlideshowMode = ({ media, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const { pauseBackgroundMusic, resumeBackgroundMusic } = useAudio();

  const currentItem = media[currentIndex];
  const isVideo = currentItem?.type === 'videos';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (isVideo) {
        pauseBackgroundMusic();
      }
    } else {
      document.body.style.overflow = 'unset';
      resumeBackgroundMusic();
    }
    return () => {
      document.body.style.overflow = 'unset';
      resumeBackgroundMusic();
    };
  }, [isOpen, isVideo, pauseBackgroundMusic, resumeBackgroundMusic]);

  useEffect(() => {
    let intervalId;
    if (isOpen && !isPaused && !isVideo) {
      intervalId = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 3000); // Change slide every 3 seconds
    }
    return () => clearInterval(intervalId);
  }, [isOpen, isPaused, isVideo, media.length]);

  const handleDragEnd = useCallback((e, { offset, velocity }) => {
    const swipe = offset.x;
    
    if (Math.abs(velocity.x) > 500 || Math.abs(swipe) > 100) {
      if (swipe < 0) {
        // Swipe left
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % media.length);
      } else {
        // Swipe right
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
      }
    }
  }, [media.length]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center space-x-4">
          <button
            className="text-white hover:text-purple-400 transition-colors"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            )}
          </button>
          <span className="text-white text-sm">
            {currentIndex + 1} / {media.length}
          </span>
        </div>
        <button
          className="text-white hover:text-purple-400 transition-colors"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            {currentItem.type === 'pictures' ? (
              <img
                src={currentItem.url}
                alt={`Slide ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onClick={() => setIsPaused(!isPaused)}
              />
            ) : (
              <video
                src={currentItem.url}
                controls
                autoPlay
                className="max-h-full max-w-full"
                onPlay={() => setIsPaused(true)}
                onPause={() => setIsPaused(false)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4 pointer-events-none">
        <button
          className="text-white hover:text-purple-400 transition-colors pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/40"
          onClick={() => {
            setDirection(-1);
            setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
          }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="text-white hover:text-purple-400 transition-colors pointer-events-auto p-2 rounded-full bg-black/20 hover:bg-black/40"
          onClick={() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % media.length);
          }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default SlideshowMode;
