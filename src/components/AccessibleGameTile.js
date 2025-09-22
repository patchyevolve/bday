import React, { forwardRef } from 'react';

const AccessibleGameTile = forwardRef(({ 
  tile, 
  onClick, 
  onKeyDown,
  isActive = false,
  ...props 
}, ref) => {
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
      className={`game-tile w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-lg shadow-lg hover:scale-105 active:scale-95 transform transition-all duration-75 cursor-pointer select-none border-2 border-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50 ${
        isActive ? 'ring-4 ring-white ring-opacity-75' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Play ${tile.note.note} note`}
      aria-describedby={`tile-${tile.id}-description`}
      role="button"
      tabIndex={0}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      {...props}
    >
      {tile.note.note}
      <div className="text-xs opacity-80">🎵</div>
      
      {/* Hidden description for screen readers */}
      <div 
        id={`tile-${tile.id}-description`}
        className="sr-only"
      >
        Musical note {tile.note.note} at frequency {tile.note.frequency} Hz. 
        Click to play this note in the Happy Birthday melody.
      </div>
    </button>
  );
});

AccessibleGameTile.displayName = 'AccessibleGameTile';

export default AccessibleGameTile;
