import React from 'react';
import { Lock, Clock, Heart } from 'lucide-react';
import FloatingHeartsBackground from './FloatingHeartsBackground';

const LockScreen = ({ timeLeft }) => {
  return (
    <div className="min-h-screen dynamic-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Hearts Background */}
      <FloatingHeartsBackground 
        heartCount={8} 
        opacity={0.15} 
        animationDuration={10}
        pulseDuration={12}
        size="w-4 h-4"
        color="text-pink-300"
      />
      
      <div className="glass-effect-dark rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-xs sm:max-w-md w-full relative z-10">
        <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-white mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">🎁 Special Surprise</h1>
        <p className="text-white/90 mb-6 text-sm sm:text-base">This special birthday surprise is locked until September 23rd!</p>
        <div className="glass-effect rounded-2xl p-3 sm:p-4 mb-6">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-2" />
          <p className="countdown-display">{timeLeft}</p>
          <p className="text-white/80 text-xs sm:text-sm">until unlock</p>
        </div>
        <div className="flex justify-center space-x-2">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-300 animate-pulse" />
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300 animate-pulse" style={{animationDelay: '0.5s'}} />
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-300 animate-pulse" style={{animationDelay: '1s'}} />
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
