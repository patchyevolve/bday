import React, { useMemo, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import AccessibleGameTile from './AccessibleGameTile';
import AccessiblePowerUp from './AccessiblePowerUp';
import FloatingHeartsBackground from './FloatingHeartsBackground';

const MobileOptimizedGameScreen = ({ 
  gameState, 
  fallingTiles, 
  powerUps, 
  powerUpTypes, 
  activePowerUps,
  onTileClick, 
  onPowerUpCollect, 
  onReset 
}) => {
  const {
    isMobile,
    isTouchDevice,
    orientation,
    getMobileGameSettings,
    triggerHapticFeedback,
    optimizeTouchEvents
  } = useMobileOptimization();

  const gameContainerRef = useRef(null);
  const mobileSettings = getMobileGameSettings();

  // Generate stable heart positions that don't change on re-render
  const heartPositions = useMemo(() => 
    [...Array(isMobile ? 8 : 12)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 8,
      pulseDelay: Math.random() * 5
    })), [isMobile]
  );

  // Optimize touch events for mobile
  useEffect(() => {
    if (gameContainerRef.current && isTouchDevice) {
      const cleanup = optimizeTouchEvents(gameContainerRef.current);
      return cleanup;
    }
  }, [isTouchDevice, optimizeTouchEvents]);

  // Enhanced tile click handler with haptic feedback
  const handleTileClick = (tileId) => {
    onTileClick(tileId);
    if (isTouchDevice) {
      triggerHapticFeedback('light');
    }
  };

  // Enhanced power-up collection with haptic feedback
  const handlePowerUpCollect = (powerUpId, type) => {
    onPowerUpCollect(powerUpId, type);
    if (isTouchDevice) {
      triggerHapticFeedback('success');
    }
  };

  // Mobile-optimized container classes
  const containerClasses = `
    min-h-screen dynamic-bg relative overflow-hidden flex items-center justify-center
    ${isMobile ? 'px-2 py-4' : 'px-4 py-8'}
  `;

  const gameContainerClasses = `
    glass-effect-dark rounded-3xl shadow-2xl p-6 relative overflow-hidden
    ${isMobile 
      ? orientation === 'portrait' 
        ? 'w-full max-w-sm h-[500px]' 
        : 'w-96 h-[400px]'
      : 'w-96 h-[600px]'
    }
  `;

  const gameAreaClasses = `
    relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-900/50 via-purple-900/50 to-pink-900/50
    ${isMobile ? 'h-[350px]' : 'h-[500px]'}
    ${activePowerUps.invincible.active ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''} 
    ${activePowerUps.slowMotion.active ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}
  `;

  return (
    <div className={containerClasses}>
      {/* Floating Hearts Background */}
      <FloatingHeartsBackground 
        heartCount={6} 
        opacity={0.2} 
        animationDuration={8}
        pulseDuration={10}
        size="w-4 h-4"
        color="text-pink-200"
      />

      {/* Game Container */}
      <div ref={gameContainerRef} className={gameContainerClasses}>
        {/* Game UI Header - Optimized for mobile */}
        <div className={`flex justify-between items-center text-white mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="glass-effect rounded-xl px-2 py-1">
            <p className="font-semibold">Score: {gameState.score}</p>
          </div>
          <div className="glass-effect rounded-xl px-2 py-1">
            <p className="font-semibold">❤️ {gameState.lives}</p>
          </div>
          <div className="glass-effect rounded-xl px-2 py-1">
            <p className="font-semibold">Hit: {gameState.tilesHit}/{gameState.endlessMode ? '∞' : 12}</p>
          </div>
          {gameState.endlessMode && (
            <button
              onClick={onReset}
              className="glass-effect rounded-xl px-2 py-1 font-semibold hover:scale-105 transition-all duration-300"
            >
              🚪
            </button>
          )}
        </div>

        {/* Combo and Power-up Status - Stacked on mobile */}
        <div className={`flex justify-between items-center text-white mb-2 ${isMobile ? 'flex-col space-y-1' : ''}`}>
          <div className="glass-effect rounded-xl px-2 py-1">
            <p className="font-semibold">🔥 Combo: {gameState.combo}</p>
          </div>
          <div className="glass-effect rounded-xl px-2 py-1">
            <p className="font-semibold">🏆 Best: {gameState.maxCombo}</p>
          </div>
        </div>

        {/* Active Power-ups Display - Optimized for mobile */}
        {(activePowerUps.invincible.active || activePowerUps.slowMotion.active || activePowerUps.scoreMultiplier.active) && (
          <div className={`flex justify-center space-x-2 mb-2 ${isMobile ? 'flex-wrap' : ''}`}>
            {activePowerUps.invincible.active && (
              <div className="glass-effect rounded-full px-2 py-1 text-xs font-bold text-yellow-300 animate-pulse">
                ⭐ {Math.ceil(activePowerUps.invincible.timeLeft / 1000)}s
              </div>
            )}
            {activePowerUps.slowMotion.active && (
              <div className="glass-effect rounded-full px-2 py-1 text-xs font-bold text-blue-300 animate-pulse">
                ⚡ {Math.ceil(activePowerUps.slowMotion.timeLeft / 1000)}s
              </div>
            )}
            {activePowerUps.scoreMultiplier.active && (
              <div className="glass-effect rounded-full px-2 py-1 text-xs font-bold text-purple-300 animate-pulse">
                🌈 {activePowerUps.scoreMultiplier.multiplier}x ({Math.ceil(activePowerUps.scoreMultiplier.timeLeft / 1000)}s)
              </div>
            )}
          </div>
        )}

        {/* Game Area with 4 columns */}
        <div className={gameAreaClasses}>
          <div className="h-full grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map(column => (
              <div key={column} className="relative bg-white/5 border-l border-r border-white/10">
                {/* Column background lines */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(isMobile ? 6 : 8)].map((_, i) => (
                    <div key={i} className={`border-b border-white/10 ${isMobile ? 'h-12' : 'h-16'}`}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Falling Tiles - Mobile optimized */}
          {fallingTiles.map(tile => (
            <div
              key={tile.id}
              className="absolute z-20"
              style={{
                left: `${(tile.column * 25) + 0.5}%`,
                top: `${tile.y}px`,
                width: '23%',
                height: isMobile ? '50px' : '60px'
              }}
            >
              <AccessibleGameTile
                tile={tile}
                onClick={() => handleTileClick(tile.id)}
                isActive={false}
                style={{
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              />
            </div>
          ))}

          {/* Power-ups - Mobile optimized */}
          {powerUps.map(powerUp => (
            <div
              key={powerUp.id}
              className="absolute z-20"
              style={{
                left: `${(powerUp.column * 25) + 0.5}%`,
                top: `${powerUp.y}px`,
                width: '23%',
                height: isMobile ? '50px' : '60px'
              }}
            >
              <AccessiblePowerUp
                powerUp={powerUp}
                powerUpTypes={powerUpTypes}
                onClick={() => handlePowerUpCollect(powerUp.id, powerUp.type)}
                style={{
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              />
            </div>
          ))}

          {/* Bottom danger zone indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-500/40 to-transparent pointer-events-none">
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white/70 text-xs">
              ⚠️ Danger Zone ⚠️
            </div>
          </div>
        </div>

        {/* Game completed message */}
        {gameState.gameCompleted && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-sm rounded-3xl">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl text-lg font-bold animate-bounce shadow-2xl text-center">
              <div className="mb-2">🎉 Perfect! 🎉</div>
              <button 
                onClick={() => {/* Handle celebration */}}
                className="bg-white/20 px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-all"
              >
                See Your Surprise! 💝
              </button>
            </div>
          </div>
        )}

        {/* Reset button - Mobile optimized */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onReset}
            className={`glass-effect text-white rounded-full hover:scale-105 transition-all duration-300 ${
              isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'
            }`}
          >
            🔄 {isMobile ? '' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedGameScreen;
