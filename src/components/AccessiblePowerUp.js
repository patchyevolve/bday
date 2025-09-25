import React, { forwardRef } from 'react';

const AccessiblePowerUp = forwardRef(({ 
  powerUp, 
  powerUpTypes, 
  onClick, 
  onKeyDown,
  ...props 
}, ref) => {
  const powerUpType = powerUpTypes[powerUp.type];
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
    onKeyDown?.(event);
  };

  return (
    <button
      ref={ref}
      className={`w-full h-full bg-gradient-to-br ${powerUpType.color} text-white font-bold text-2xl rounded-lg shadow-lg hover:scale-110 active:scale-95 transform transition-all duration-75 cursor-pointer select-none border-2 border-white/50 animate-pulse focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Collect ${powerUpType.effect} power-up`}
      aria-describedby={`powerup-${powerUp.id}-description`}
      role="button"
      tabIndex={0}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      {...props}
    >
      {powerUpType.emoji}
      
      {/* Hidden description for screen readers */}
      <div 
        id={`powerup-${powerUp.id}-description`}
        className="sr-only"
      >
        Power-up: {powerUpType.effect}. Collect this item to gain special abilities in the game.
      </div>
    </button>
  );
});

AccessiblePowerUp.displayName = 'AccessiblePowerUp';

export default AccessiblePowerUp;
