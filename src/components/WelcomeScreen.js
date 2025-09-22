import React, { useMemo } from 'react';
import { Heart, Music } from 'lucide-react';
import FloatingHeartsBackground from './FloatingHeartsBackground';

const WelcomeScreen = ({ onStartGame, onPlayWelcomeMusic }) => {
  // Generate floating elements for welcome screen
  const floatingElements = useMemo(() => {
    const elements = [];
    // Hearts
    for (let i = 0; i < 8; i++) {
      elements.push({
        type: 'heart',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
        size: 4 + Math.random() * 2
      });
    }
    // Music notes
    for (let i = 0; i < 6; i++) {
      elements.push({
        type: 'note',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 8,
        size: 3 + Math.random() * 2
      });
    }
    // Sparkles
    for (let i = 0; i < 10; i++) {
      elements.push({
        type: 'sparkle',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 10,
        size: 2 + Math.random() * 1.5
      });
    }
    return elements;
  }, []);

  return (
    <div className="min-h-screen dynamic-bg flex items-center justify-center relative overflow-hidden">
      {/* Floating Hearts Background */}
      <FloatingHeartsBackground 
        heartCount={15} 
        opacity={0.25} 
        animationDuration={12}
        pulseDuration={15}
        size="w-6 h-6"
        color="text-pink-200"
      />
      
      {/* Floating Elements Background */}
      {floatingElements.map((element, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            animation: `welcomeFloat 12s ease-in-out infinite`,
            animationDelay: `${element.animationDelay}s`
          }}
        >
          {element.type === 'heart' && (
            <Heart 
              className={`text-pink-200 animate-pulse floating-heart`}
              style={{
                width: `${element.size * 4}px`,
                height: `${element.size * 4}px`,
                animationDuration: '3s'
              }}
            />
          )}
          {element.type === 'note' && (
            <Music 
              className={`text-blue-200 animate-bounce floating-music`}
              style={{
                width: `${element.size * 4}px`,
                height: `${element.size * 4}px`,
                animationDuration: '2.5s'
              }}
            />
          )}
          {element.type === 'sparkle' && (
            <div 
              className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
              style={{
                width: `${element.size * 2}px`,
                height: `${element.size * 2}px`,
                animationDuration: '4s'
              }}
            />
          )}
        </div>
      ))}

      <div className="magical-card glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-xs sm:max-w-md lg:max-w-lg mx-4 relative z-10 w-full">
        {/* Happy Birthday Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 shimmer-title px-2">
          🎉 HAPPY BIRTHDAY! 🎉
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 soft-subtitle font-bold">To My Beautiful Wifey</p>
        
        {/* Piano Keys Preview */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center space-x-1 mb-3 sm:mb-4">
            {['C', 'D', 'E', 'F', 'G'].map((note, i) => (
              <div
                key={note}
                className="piano-key w-6 h-12 sm:w-8 sm:h-16 bg-white rounded-b-lg shadow-lg flex items-end justify-center pb-1 sm:pb-2 text-xs font-bold text-gray-700 animate-pulse cursor-pointer"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                {note}
              </div>
            ))}
          </div>
        </div>

        <Music className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white mx-auto mb-3 sm:mb-4 animate-bounce" />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">🎵 Falling Piano Tiles</h2>
        
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={onStartGame}
            className="w-full btn-solid-1 btn-bounce text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-xl sm:text-2xl font-bold hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            🎵 Start Playing
          </button>
          
          <button
            onClick={onPlayWelcomeMusic}
            className="btn-solid-2 btn-bounce text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:scale-105 transform transition-all duration-300"
            style={{animationDelay: '0.2s'}}
          >
            🎶 Play Welcome Music
          </button>
        </div>
      </div>

      {/* Love message in corner */}
      <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 z-20">
        <div className="glass-effect rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1 sm:py-2">
          <p className="text-white/90 text-xs sm:text-sm font-medium italic typewriter">
            Made with love just for you 🎵
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
