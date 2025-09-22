import { useState, useCallback } from 'react';

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTile, setCurrentTile] = useState(0);
  const [tilesHit, setTilesHit] = useState(0);
  const [tilesSpawned, setTilesSpawned] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [endlessMode, setEndlessMode] = useState(false);
  const [showChoiceMenu, setShowChoiceMenu] = useState(false);
  const [showSpecialPoem, setShowSpecialPoem] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameCompleted(false);
    setShowCelebration(false);
    setCurrentTile(0);
    setScore(0);
    setGameOver(false);
    setLives(3);
    setTilesHit(0);
    setTilesSpawned(0);
    setEndlessMode(false);
    setShowChoiceMenu(false);
    setShowSpecialPoem(false);
    setCombo(0);
    setMaxCombo(0);
  }, []);

  return {
    // State
    gameStarted,
    gameCompleted,
    showCelebration,
    currentTile,
    tilesHit,
    tilesSpawned,
    score,
    gameOver,
    lives,
    endlessMode,
    showChoiceMenu,
    showSpecialPoem,
    combo,
    maxCombo,
    
    // Setters
    setGameStarted,
    setGameCompleted,
    setShowCelebration,
    setCurrentTile,
    setTilesHit,
    setTilesSpawned,
    setScore,
    setGameOver,
    setLives,
    setEndlessMode,
    setShowChoiceMenu,
    setShowSpecialPoem,
    setCombo,
    setMaxCombo,
    
    // Actions
    resetGame
  };
};
