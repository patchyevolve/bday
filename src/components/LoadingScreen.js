import React from 'react';
import { Heart, Music } from 'lucide-react';
import FloatingHeartsBackground from './FloatingHeartsBackground';

const LoadingScreen = ({ message = "Loading your birthday surprise..." }) => {
  return (
    <div className="min-h-screen dynamic-bg flex items-center justify-center relative overflow-hidden">
      {/* Floating Hearts Background */}
      <FloatingHeartsBackground 
        heartCount={12} 
        opacity={0.2} 
        animationDuration={8}
        pulseDuration={10}
        size="w-6 h-6"
        color="text-pink-200"
      />
      
      {/* Additional floating elements */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `welcomeFloat 8s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }}
        >
          <Heart 
            className="w-8 h-8 text-pink-300 animate-pulse floating-heart"
            style={{
              animationDuration: '2s'
            }}
          />
        </div>
      ))}

      <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md mx-4 relative z-10">
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto">
            <Music className="w-16 h-16 text-white animate-spin mx-auto" />
            <div className="absolute inset-0 border-4 border-transparent border-t-pink-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading Message */}
        <h2 className="text-2xl font-bold text-white mb-4">🎵 Getting Ready 🎵</h2>
        <p className="text-white/90 mb-6">{message}</p>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>

        {/* Loading Tips */}
        <div className="text-white/70 text-sm space-y-2">
          <p>✨ Preparing your special melody...</p>
          <p>💖 Loading romantic poems...</p>
          <p>🎮 Setting up the game...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
