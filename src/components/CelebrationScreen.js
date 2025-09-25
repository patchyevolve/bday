import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import useCelebrationStore from '../store/celebrationStore';

// Media Grid Component
const MediaGrid = ({ type, items, onItemClick, onDelete, isUploading, onUpload }) => {
  const dropRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  if (!items || items.length === 0) {
    return (
      <motion.div
        ref={dropRef}
        className={`flex items-center justify-center h-64 bg-black/30 backdrop-blur-sm rounded-2xl border-2 border-dashed 
          ${isDragging ? 'border-purple-500 bg-purple-500/20' : 'border-gray-500'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-xl">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <p className="text-white text-xl">No {type} available</p>
            <p className="text-gray-400">Drag & drop to add {type}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={dropRef}
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-xl transition-colors
        ${isDragging ? 'bg-purple-500/10 border-2 border-dashed border-purple-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="relative group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1
          }}
          layout
        >
          <motion.div
            className="relative w-full aspect-square overflow-hidden rounded-lg bg-transparent group-hover:ring-2 ring-purple-500 transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onItemClick(item)}
          >
            {type === 'pictures' ? (
              <img
                src={item.url}
                alt={`Celebration ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  poster={item.thumbnail}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <svg
                    className="w-12 h-12 text-white transform group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </motion.div>
          
          <motion.button
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>

          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm truncate">{item.name}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const MediaViewer = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-4xl max-h-[90vh] w-full mx-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === 'pictures' ? (
          <img
            src={media.url}
            alt="Celebration view"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={media.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        )}
        <button
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

const CelebrationScreen = () => {
  const { name, message } = useCelebrationStore();
  const navigate = useNavigate();
  const { playSuccessSound } = useAudio();
  const [pictures, setPictures] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = (path) => {
    playSuccessSound();
    navigate(path);
  };

  const handleUpload = async (files) => {
    try {
      setIsUploading(true);
      // Here you would typically process the files and upload them
      // For now, we'll create temporary URLs
      const newPictures = files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        name: file.name,
        type: 'pictures'
      }));
      setPictures(prev => [...prev, ...newPictures]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (item) => {
    setPictures(prev => prev.filter(p => p.id !== item.id));
    if (selectedMedia?.id === item.id) {
      setSelectedMedia(null);
    }
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
          🎉 Congratulations, {name}! 🎉
        </h1>
        <p className="text-xl text-purple-200">
          {message}
        </p>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md relative mb-8">
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => handleButtonClick('/kuku-message')}
          className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg shadow-2xl transform transition-all duration-300 text-lg relative overflow-hidden group"
          style={{
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(147, 51, 234, 0.2)'
          }}
        >
          <span className="relative z-10 text-xl">💖 For My Beautiful Kuku 💖</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            whileHover={{ scale: 1.2, rotate: 1 }}
          />
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(236, 72, 153, 0.4)',
                '0 0 30px rgba(236, 72, 153, 0.6)',
                '0 0 20px rgba(236, 72, 153, 0.4)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.button>
      </div>

      {/* Pictures Gallery Section */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Memory Gallery</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              {pictures.length} {pictures.length === 1 ? 'picture' : 'pictures'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  if (e.target.files?.length) {
                    handleUpload(Array.from(e.target.files));
                  }
                };
                input.click();
              }}
            >
              Add Pictures
            </motion.button>
          </div>
        </div>
        
        <MediaGrid
          type="pictures"
          items={pictures}
          onItemClick={(item) => setSelectedMedia({ ...item, type: 'pictures' })}
          onDelete={handleDelete}
          isUploading={isUploading}
          onUpload={handleUpload}
        />
      </div>

      {/* Picture Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaViewer
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>

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
