import { useRef, useCallback, useEffect } from 'react';
import { GAME_CONFIG } from '../constants/gameData';

export const useGameLoop = ({
  gameStarted,
  gameOver,
  gameCompleted,
  tilesSpawned,
  endlessMode,
  activePowerUps,
  happyBirthdayNotes,
  onSpawnTile,
  onUpdateTiles,
  onUpdatePowerUps,
  onSpawnPowerUp,
  onLoseLife,
  onGameOver
}) => {
  const gameLoopRef = useRef(null);
  const lastTileSpawnRef = useRef(0);
  const animationFrameRef = useRef(null);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver || gameCompleted) return;

    const currentTime = Date.now();
    
    // Spawn new tiles with dynamic timing
    const baseInterval = activePowerUps.slowMotion.active ? 2500 : GAME_CONFIG.BASE_SPAWN_INTERVAL;
    const spawnInterval = Math.max(baseInterval - (tilesSpawned * 100), GAME_CONFIG.MIN_SPAWN_INTERVAL);
    
    // In endless mode, keep spawning tiles indefinitely
    const shouldSpawn = endlessMode ? true : tilesSpawned < happyBirthdayNotes.length;
    
    if (currentTime - lastTileSpawnRef.current > spawnInterval && shouldSpawn) {
      const noteIndex = endlessMode ? tilesSpawned % happyBirthdayNotes.length : tilesSpawned;
      const newTile = {
        id: Date.now() + Math.random(),
        note: happyBirthdayNotes[noteIndex],
        column: Math.floor(Math.random() * 4),
        y: -80,
        speed: activePowerUps.slowMotion.active ? 
          (2 + Math.floor(tilesSpawned / 5)) : 
          (GAME_CONFIG.BASE_TILE_SPEED + Math.floor(tilesSpawned / 3)),
        noteIndex: noteIndex,
        spawned: true
      };
      
      onSpawnTile(newTile);
      lastTileSpawnRef.current = currentTime;
      
      // Chance to spawn power-up
      onSpawnPowerUp();
    }

    // Update tile positions
    onUpdateTiles((prevTiles) => {
      return prevTiles.map(tile => ({
        ...tile,
        y: tile.y + tile.speed
      })).filter(tile => {
        // Remove tiles that hit bottom (lose life unless invincible)
        if (tile.y > GAME_CONFIG.DANGER_ZONE_HEIGHT) {
          if (!activePowerUps.invincible.active) {
            onLoseLife();
          }
          return false;
        }
        return true;
      });
    });

    // Update power-up positions
    onUpdatePowerUps();

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameStarted, 
    gameOver, 
    gameCompleted, 
    tilesSpawned, 
    endlessMode, 
    activePowerUps, 
    happyBirthdayNotes,
    onSpawnTile,
    onUpdateTiles,
    onUpdatePowerUps,
    onSpawnPowerUp,
    onLoseLife
  ]);

  // Start game loop when game starts
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCompleted) {
      // Use requestAnimationFrame for smooth 60fps performance
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, gameCompleted, gameLoop]);

  // Handle game over when lives reach 0
  useEffect(() => {
    if (gameOver) {
      onGameOver();
    }
  }, [gameOver, onGameOver]);

  return {
    startGameLoop: () => {
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    },
    stopGameLoop: () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };
};
