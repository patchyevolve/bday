import React from 'react';
import { RefreshCw, AlertTriangle, Wifi, Volume2 } from 'lucide-react';
import FloatingHeartsBackground from './FloatingHeartsBackground';

const ErrorScreen = ({ error, onRetry, onClearError }) => {
  const getErrorIcon = (type) => {
    switch (type) {
      case 'AUDIO_ERROR':
        return <Volume2 className="w-16 h-16 text-red-400 mx-auto mb-4" />;
      case 'NETWORK_ERROR':
        return <Wifi className="w-16 h-16 text-red-400 mx-auto mb-4" />;
      case 'GAME_ERROR':
        return <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />;
    }
  };

  const getErrorTitle = (type) => {
    switch (type) {
      case 'AUDIO_ERROR':
        return 'Audio Issue';
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'GAME_ERROR':
        return 'Game Error';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorSuggestions = (type) => {
    switch (type) {
      case 'AUDIO_ERROR':
        return [
          'Check if your device volume is turned on',
          'Try refreshing the page',
          'Make sure your browser allows audio playback'
        ];
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Make sure you have a stable connection'
        ];
      case 'GAME_ERROR':
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Make sure you have the latest browser version'
        ];
      default:
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the problem persists'
        ];
    }
  };

  return (
    <div className="min-h-screen dynamic-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating Hearts Background */}
      <FloatingHeartsBackground 
        heartCount={6} 
        opacity={0.1} 
        animationDuration={12}
        pulseDuration={15}
        size="w-4 h-4"
        color="text-red-300"
      />
      
      <div className="glass-effect-dark rounded-3xl p-6 sm:p-8 text-center max-w-md w-full relative z-10">
        {/* Error Icon */}
        {getErrorIcon(error?.type)}
        
        {/* Error Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {getErrorTitle(error?.type)}
        </h1>
        
        {/* Error Message */}
        <p className="text-white/90 mb-6 text-sm sm:text-base">
          {error?.message || 'An unexpected error occurred'}
        </p>

        {/* Error Details (for debugging) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="glass-effect rounded-xl p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2">Debug Info:</h3>
            <pre className="text-white/70 text-xs overflow-auto">
              {JSON.stringify({
                type: error.type,
                timestamp: error.timestamp,
                retryCount: error.retryCount
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Suggestions */}
        <div className="glass-effect rounded-xl p-4 mb-6 text-left">
          <h3 className="text-white font-semibold mb-3">Try these solutions:</h3>
          <ul className="text-white/80 text-sm space-y-2">
            {getErrorSuggestions(error?.type).map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-pink-400 mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full btn-solid-1 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-solid-2 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            🔄 Refresh Page
          </button>
          
          <button
            onClick={onClearError}
            className="w-full btn-solid-3 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            🚪 Back to Menu
          </button>
        </div>

        {/* Retry Count */}
        {error?.retryCount > 0 && (
          <p className="text-white/60 text-sm mt-4">
            Retry attempt: {error.retryCount}/3
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen;
