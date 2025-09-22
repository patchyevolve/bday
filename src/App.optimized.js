import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { usePowerUps } from './hooks/usePowerUps';
import { useGameLoop } from './hooks/useGameLoop';
import { happyBirthdayNotes, poems, specialPoem, targetDate, GAME_CONFIG } from './constants/gameData';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import LockScreen from './components/LockScreen';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen dynamic-bg flex items-center justify-center">
    <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md mx-4">
      <div className="text-6xl mb-4">😅</div>
      <h1 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h1>
      <p className="text-white/90 mb-6">Don't worry, your birthday surprise is still safe!</p>
      <button
        onClick={resetErrorBoundary}
        className="btn-solid-1 text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
      >
        🔄 Try Again
      </button>
    </div>
  </div>
);

const BirthdayPianoSurprise = () => {
  // Custom hooks for state management
  const gameState = useGameState();
  const audio = useAudio();
  const powerUps = usePowerUps();
  
  // Local state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentPoem, setCurrentPoem] = useState('');
  const [fallingTiles, setFallingTiles] = useState([]);
  const [welcomeMusicStarted, setWelcomeMusicStarted] = useState(false);

  // Check if app should be unlocked
  useEffect(() => {
    const checkUnlockStatus = () => {
      const now = new Date();
      if (now >= targetDate) {
        setIsUnlocked(true);
      } else {
        const timeDiff = targetDate - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };
    
    checkUnlockStatus();
    const interval = setInterval(checkUnlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Select random poem on component mount
  useEffect(() => {
    if (isUnlocked) {
      const randomPoem = poems[Math.floor(Math.random() * poems.length)];
      setCurrentPoem(randomPoem);
    }
  }, [isUnlocked]);

  // Game loop callbacks
  const handleSpawnTile = useCallback((newTile) => {
    setFallingTiles(prev => [...prev, newTile]);
    gameState.setTilesSpawned(prev => prev + 1);
  }, [gameState]);

  const handleUpdateTiles = useCallback((updateFn) => {
    setFallingTiles(updateFn);
  }, []);

  const handleLoseLife = useCallback(() => {
    gameState.setLives(prevLives => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        gameState.setGameOver(true);
      }
      return newLives;
    });
    gameState.setCombo(0); // Reset combo on miss
  }, [gameState]);

  const handleGameOver = useCallback(() => {
    // Game over logic
  }, []);

  // Game loop hook
  const gameLoop = useGameLoop({
    gameStarted: gameState.gameStarted,
    gameOver: gameState.gameOver,
    gameCompleted: gameState.gameCompleted,
    tilesSpawned: gameState.tilesSpawned,
    endlessMode: gameState.endlessMode,
    activePowerUps: powerUps.activePowerUps,
    happyBirthdayNotes,
    onSpawnTile: handleSpawnTile,
    onUpdateTiles: handleUpdateTiles,
    onUpdatePowerUps: powerUps.updatePowerUpPositions,
    onSpawnPowerUp: powerUps.spawnPowerUp,
    onLoseLife: handleLoseLife,
    onGameOver: handleGameOver
  });

  // Handle tile click
  const handleTileClick = useCallback((tileId) => {
    // Play feedback sound immediately
    try {
      audio.playNote(261.63, 300);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
    
    setFallingTiles(prev => {
      const tileIndex = prev.findIndex(tile => tile.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = prev[tileIndex];
      
      // Play the actual note
      setTimeout(() => {
        try {
          audio.playNote(tile.note.frequency, tile.note.duration);
        } catch (error) {
          console.log('Audio playback failed:', error);
        }
      }, 50);
      
      // Remove the clicked tile immediately
      return prev.filter(t => t.id !== tileId);
    });
    
    // Update score with multiplier and combo
    const baseScore = 10;
    const multiplier = powerUps.activePowerUps.scoreMultiplier.active ? 
      powerUps.activePowerUps.scoreMultiplier.multiplier : 1;
    const comboBonus = Math.floor(gameState.combo / GAME_CONFIG.COMBO_BONUS_INTERVAL);
    const finalScore = baseScore * multiplier + comboBonus;
    
    gameState.setScore(prevScore => prevScore + finalScore);
    gameState.setCombo(prev => {
      const newCombo = prev + 1;
      gameState.setMaxCombo(current => Math.max(current, newCombo));
      return newCombo;
    });
    
    gameState.setTilesHit(prevHit => {
      const newHit = prevHit + 1;
      
      // Check if game is completed
      if (newHit >= happyBirthdayNotes.length) {
        if (gameState.endlessMode) {
          // In endless mode, continue spawning tiles
          gameState.setTilesSpawned(0);
          gameState.setTilesHit(0);
          return 0;
        } else {
          // Show choice menu
          setTimeout(() => {
            gameState.setGameCompleted(true);
            gameState.setShowChoiceMenu(true);
          }, 500);
        }
      }
      
      return newHit;
    });
  }, [gameState, powerUps.activePowerUps, audio]);

  // Handle power-up collection
  const handlePowerUpCollect = useCallback((powerUpId, type) => {
    powerUps.collectPowerUp(
      powerUpId, 
      type, 
      gameState.setLives, 
      audio.playNote
    );
  }, [powerUps, gameState, audio]);

  // Handle game start
  const handleStartGame = useCallback(() => {
    gameState.setGameStarted(true);
    if (!welcomeMusicStarted) {
      audio.playWelcomeMusic();
      setWelcomeMusicStarted(true);
    }
  }, [gameState, audio, welcomeMusicStarted]);

  // Handle welcome music
  const handlePlayWelcomeMusic = useCallback(() => {
    if (!welcomeMusicStarted) {
      audio.playWelcomeMusic();
      setWelcomeMusicStarted(true);
    }
  }, [audio, welcomeMusicStarted]);

  // Handle game reset
  const handleResetGame = useCallback(() => {
    gameState.resetGame();
    setFallingTiles([]);
    powerUps.resetPowerUps();
    setWelcomeMusicStarted(false);
    audio.stopBackgroundMusic();
    
    // Generate new poem
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];
    setCurrentPoem(randomPoem);
  }, [gameState, powerUps, audio]);

  // Render different screens based on state
  if (!isUnlocked) {
    return <LockScreen timeLeft={timeLeft} />;
  }

  if (gameState.showCelebration) {
    // Celebration screen would go here
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center">
        <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md mx-4">
          <h1 className="text-3xl font-bold text-white mb-4">🎉 Happy Birthday! 🎉</h1>
          <p className="text-white/90 mb-6">Your surprise is ready!</p>
          <button
            onClick={handleResetGame}
            className="btn-solid-1 text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            🎵 Play Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState.showChoiceMenu && gameState.gameCompleted) {
    // Choice menu would go here
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center px-4">
        <div className="glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-xs sm:max-w-md w-full">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Congratulations!</h1>
          <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base">You successfully completed "Happy Birthday"!</p>
          <div className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-white text-base sm:text-lg">Final Score: {gameState.score}</p>
            <p className="text-white/80 text-xs sm:text-sm">Max Combo: {gameState.maxCombo} 🔥</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => {
                gameState.setEndlessMode(true);
                gameState.setShowChoiceMenu(false);
                gameState.setGameCompleted(false);
                gameState.setTilesHit(0);
                gameState.setTilesSpawned(0);
              }}
              className="w-full btn-solid-1 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              🎮 Endless Mode
            </button>
            
            <button
              onClick={() => {
                gameState.setShowChoiceMenu(false);
                gameState.setShowCelebration(true);
                audio.playBackgroundMusic(happyBirthdayNotes);
              }}
              className="w-full btn-solid-2 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              💝 See Your Surprise
            </button>
            
            <button
              onClick={handleResetGame}
              className="w-full btn-solid-3 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              🚪 Exit to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.gameOver) {
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center">
        <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-3xl font-bold text-white mb-4">Game Over!</h1>
          <p className="text-white/90 mb-4">You missed too many tiles!</p>
          <div className="glass-effect rounded-2xl p-4 mb-6">
            <p className="text-white text-lg">Final Score: {gameState.score}</p>
            <p className="text-white/80 text-sm">Max Combo: {gameState.maxCombo} 🔥</p>
            <p className="text-white/80 text-sm">Tiles Hit: {Math.floor(gameState.score / 10)}</p>
          </div>
          <button
            onClick={handleResetGame}
            className="btn-solid-1 text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState.gameStarted) {
    return (
      <WelcomeScreen 
        onStartGame={handleStartGame}
        onPlayWelcomeMusic={handlePlayWelcomeMusic}
      />
    );
  }

  return (
    <GameScreen
      gameState={gameState}
      fallingTiles={fallingTiles}
      powerUps={powerUps.powerUps}
      powerUpTypes={powerUps.powerUpTypes}
      activePowerUps={powerUps.activePowerUps}
      onTileClick={handleTileClick}
      onPowerUpCollect={handlePowerUpCollect}
      onReset={handleResetGame}
    />
  );
};

// Main App component with error boundary
const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
    >
      <BirthdayPianoSurprise />
    </ErrorBoundary>
  );
};

export default App;
