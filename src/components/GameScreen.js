import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

// Memoize the floating elements to prevent unnecessary recalculations
const useFloatingElements = () => {
  return useMemo(() => {
    const elements = [];
    // Reduced number of elements
    const elementCounts = {
      heart: 4,  // Reduced from 8
      note: 3,   // Reduced from 6
      sparkle: 5 // Reduced from 10
    };

    // Single function to create elements
    const createElements = (type, count, minSize, maxSize) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `${type}-${i}`,
        type,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
        size: minSize + Math.random() * (maxSize - minSize),
        duration: 10 + Math.random() * 10, // Vary animation duration
        translateX: (Math.random() - 0.5) * 20, // Add horizontal movement
        translateY: (Math.random() - 0.5) * 20, // Add vertical movement
      }));
    };

    // Create elements
    elements.push(
      ...createElements('heart', elementCounts.heart, 3, 5),
      ...createElements('note', elementCounts.note, 2.5, 4),
      ...createElements('sparkle', elementCounts.sparkle, 1.5, 3)
    );

    return elements;
  }, []);
};

const GameScreen = ({ 
  gameState, 
  fallingTiles, 
  powerUps, 
  powerUpTypes, 
  activePowerUps,
  onTileClick, 
  onPowerUpCollect, 
  onReset,
  floatingElements: propFloatingElements = []
}) => {
  const floatingElements = useFloatingElements();
  
  // Memoize the game state to prevent unnecessary re-renders
  const gameStatus = useMemo(() => ({
    score: gameState.score,
    lives: gameState.lives,
    tilesHit: gameState.tilesHit,
    endlessMode: gameState.endlessMode,
    combo: gameState.combo,
    maxCombo: gameState.maxCombo
  }), [gameState]);

  // Game board layout
  const columnWidth = 25; // 25% width for each column
  const columnPositions = [
    { left: '0%', right: '75%' },
    { left: '25%', right: '50%' },
    { left: '50%', right: '25%' },
    { left: '75%', right: '0%' }
  ];

  // Calculate vertical positions to prevent overlap
  const getVerticalPosition = (items, index) => {
    if (index === 0) return items[index].y;
    
    const prevItem = items[index - 1];
    const currentItem = items[index];
    const minSpacing = 30; // Minimum vertical spacing between items
    
    if (currentItem.y < prevItem.y + minSpacing) {
      return prevItem.y + minSpacing;
    }
    return currentItem.y;
  };

  // Sort tiles by column and then by y-position
  const sortedTiles = useMemo(() => {
    return [...fallingTiles]
      .sort((a, b) => a.column - b.column || a.y - b.y)
      .map((tile, index, arr) => ({
        ...tile,
        y: index > 0 && arr[index - 1].column === tile.column 
          ? Math.max(tile.y, arr[index - 1].y + 30) 
          : tile.y
      }));
  }, [fallingTiles]);

  // Sort power-ups by column and then by y-position
  const sortedPowerUps = useMemo(() => {
    return [...powerUps]
      .sort((a, b) => a.column - b.column || a.y - b.y)
      .map((powerUp, index, arr) => ({
        ...powerUp,
        y: index > 0 && arr[index - 1].column === powerUp.column 
          ? Math.max(powerUp.y, arr[index - 1].y + 40) 
          : powerUp.y
      }));
  }, [powerUps]);

  // Render tiles with proper spacing and z-index
  const renderTiles = () => {
    return sortedTiles.map((tile, index) => {
      const column = tile.column % 4; // Ensure column is within bounds
      const style = {
        position: 'absolute',
        left: columnPositions[column].left,
        top: `${tile.y}px`,
        width: '25%',
        height: '80px',
        transition: 'top 0.05s linear',
        zIndex: 20, // Higher z-index to appear above power-ups
      };

      return (
        <div
          key={tile.id}
          className="flex items-center justify-center"
          style={style}
          onClick={() => onTileClick(tile.id)}
        >
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transform transition-transform">
            <span className="text-2xl text-white">{tile.note.note}</span>
          </div>
        </div>
      );
    });
  };

  // Render power-ups with proper spacing and z-index
  const renderPowerUps = () => {
    return sortedPowerUps.map((powerUp, index) => {
      const column = powerUp.column % 4; // Ensure column is within bounds
      const powerUpType = powerUpTypes[powerUp.type];
      const style = {
        position: 'absolute',
        left: `calc(${columnPositions[column].left} + 12.5%)`,
        top: `${powerUp.y}px`,
        width: '60px',
        height: '60px',
        transform: 'translateX(-50%)',
        transition: 'top 0.05s linear',
        zIndex: 10, // Lower z-index to appear behind tiles
        animation: 'float 2s ease-in-out infinite',
      };

      return (
        <div
          key={powerUp.id}
          className="absolute flex items-center justify-center cursor-pointer hover:scale-110 transform transition-transform"
          style={style}
          onClick={() => onPowerUpCollect(powerUp.id, powerUp.type)}
        >
          <div className={`bg-gradient-to-br ${powerUpType.color} w-14 h-14 rounded-full shadow-lg flex items-center justify-center`}>
            <span className="text-2xl">{powerUpType.emoji}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen dynamic-bg relative overflow-hidden flex items-center justify-center">
      {/* Optimized Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => {
          const style = {
            '--x': `${element.translateX}px`,
            '--y': `${element.translateY}px`,
            '--delay': `${element.animationDelay}s`,
            '--duration': `${element.duration}s`,
            '--size': `${element.size * 0.8}rem`,
            left: `${element.left}%`,
            top: `${element.top}%`,
            width: 'var(--size)',
            height: 'var(--size)',
            transform: 'translate(var(--x), var(--y))',
            animation: `float ${element.duration}s ease-in-out infinite`, 
            animationDelay: `var(--delay)`,
            willChange: 'transform, opacity'
          };

          return (
            <div
              key={element.id}
              className="absolute pointer-events-none will-change-transform"
              style={style}
            >
              {element.type === 'heart' && (
                <Heart className="text-pink-300 w-full h-full" />
              )}
              {element.type === 'note' && (
                <div className="text-blue-200 w-full h-full text-2xl">
                  🎵
                </div>
              )}
              {element.type === 'sparkle' && (
                <div className="bg-yellow-300 rounded-full w-full h-full" />
              )}
            </div>
          );
        })}
      </div>
      {/* Game Container */}
      <div className="glass-effect-dark rounded-3xl shadow-2xl p-6 w-96 h-[600px] relative overflow-hidden">
        {/* Game Board */}
        <div className="game-board relative w-full h-full">
          {/* Game Tracks (4 columns) */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3].map((col) => (
              <div 
                key={col} 
                className="h-full border-r border-gray-700 last:border-r-0"
                style={{ width: '25%' }}
              />
            ))}
          </div>
          
          {/* Falling Tiles */}
          {renderTiles()}
          
          {/* Power-ups */}
          {renderPowerUps()}
          
          {/* Hit Area (bottom of the screen) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
        
        {/* Game UI Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex justify-between items-center text-white mb-2">
            <div className="glass-effect rounded-xl px-3 py-1">
              <p className="text-xs font-semibold">Score: {gameState.score}</p>
            </div>
            <div className="glass-effect rounded-xl px-3 py-1">
              <p className="text-xs font-semibold">❤️ {gameState.lives}</p>
            </div>
            <div className="glass-effect rounded-xl px-3 py-1">
              <p className="text-xs font-semibold">Hit: {gameState.tilesHit}/{gameState.endlessMode ? '∞' : 12}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-white mb-2">
            <div className="glass-effect rounded-xl px-3 py-1">
              <p className="text-xs font-semibold">🔥 Combo: {gameState.combo}</p>
            </div>
            <div className="glass-effect rounded-xl px-3 py-1">
              <p className="text-xs font-semibold">🏆 Best: {gameState.maxCombo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameScreen);
