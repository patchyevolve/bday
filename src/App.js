import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import useCelebrationStore from './store/celebrationStore';
import { Heart, Music, Lock, Clock } from 'lucide-react';
import FloatingHeartsBackground from './components/FloatingHeartsBackground';
import KukuMessage from './components/KukuMessage';
import { loadMediaFiles } from './utils/mediaLoader';
import MobileOptimizations, { TouchButton, ResponsiveGrid, LazyImage } from './components/MobileOptimizations';
import PerformanceMonitor, { usePerformanceOptimization, useFrameRateLimit } from './components/PerformanceMonitor';
import { 
  isMobile, 
  isTouchDevice, 
  getOptimalFrameRate, 
  getOptimalSpawnRate, 
  getOptimalTileSpeed,
  getAdaptiveQualitySettings,
  AudioManager,
  throttle,
  debounce
} from './utils/performanceOptimizations';
import './styles/mobile-optimizations.css';

const BirthdayPianoSurprise = () => {
  const { setName, setMessage } = useCelebrationStore();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  // const [currentTile, setCurrentTile] = useState(0); // Unused variable
  const [tilesHit, setTilesHit] = useState(0);
  const [tilesSpawned, setTilesSpawned] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentPoem, setCurrentPoem] = useState('');
  const [fallingTiles, setFallingTiles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [endlessMode, setEndlessMode] = useState(false);
  const [showChoiceMenu, setShowChoiceMenu] = useState(false);
  

  const [showSpecialPoem, setShowSpecialPoem] = useState(false);
  const [showKukuMessage, setShowKukuMessage] = useState(false);
  const [welcomeMusicStarted, setWelcomeMusicStarted] = useState(false);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({
    invincible: { active: false, timeLeft: 0 },
    slowMotion: { active: false, timeLeft: 0 },
    scoreMultiplier: { active: false, timeLeft: 0, multiplier: 1 }
  });
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Performance optimization hooks
  const { qualitySettings, isLowPerformance } = usePerformanceOptimization();
  const { limitFrameRate, cancelFrameRateLimit } = useFrameRateLimit(getOptimalFrameRate());
  
  // Audio manager for better memory management
  const audioManagerRef = useRef(new AudioManager());

  // Gallery state variables
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [videos, setVideos] = useState([]);
  const [, setMediaLoading] = useState(true);

  // Generate floating elements for welcome screen with adaptive quality
  const floatingElements = useMemo(() => {
    const elements = [];
    const particleCount = qualitySettings.particleCount;
    
    // Hearts
    for (let i = 0; i < Math.min(8, particleCount); i++) {
      elements.push({
        type: 'heart',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
        size: 4 + Math.random() * 2
      });
    }
    // Music notes
    for (let i = 0; i < Math.min(6, particleCount); i++) {
      elements.push({
        type: 'note',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 8,
        size: 3 + Math.random() * 2
      });
    }
    // Sparkles
    for (let i = 0; i < Math.min(10, particleCount); i++) {
      elements.push({
        type: 'sparkle',
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 10,
        size: 2 + Math.random() * 1.5
      });
    }
    return elements;
  }, [qualitySettings.particleCount]);
  
  // Audio context and oscillators ref
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef(new Set());
  const gameLoopRef = useRef(null);
  const lastTileSpawnRef = useRef(0);
  const backgroundMusicRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  
  // Target date: Setting to a past date to unlock the app
  const targetDate = useMemo(() => new Date('2025-09-23T00:00:00'), []);
  
  // Happy Birthday melody (simplified notes) - wrapped in useMemo for performance
  const happyBirthdayNotes = useMemo(() => [
    { note: 'C', frequency: 261.63, duration: 500 },
    { note: 'C', frequency: 261.63, duration: 250 },
    { note: 'D', frequency: 293.66, duration: 750 },
    { note: 'C', frequency: 261.63, duration: 750 },
    { note: 'F', frequency: 349.23, duration: 750 },
    { note: 'E', frequency: 329.63, duration: 1500 },
    { note: 'C', frequency: 261.63, duration: 500 },
    { note: 'C', frequency: 261.63, duration: 250 },
    { note: 'D', frequency: 293.66, duration: 750 },
    { note: 'C', frequency: 261.63, duration: 750 },
    { note: 'G', frequency: 392.00, duration: 750 },
    { note: 'F', frequency: 349.23, duration: 1500 }
  ], []);

  // Power-up types
  const powerUpTypes = useMemo(() => ({
    heart: { emoji: '💖', color: 'from-red-400 to-pink-500', effect: 'Restore Life' },
    star: { emoji: '⭐', color: 'from-yellow-400 to-orange-500', effect: 'Invincible' },
    lightning: { emoji: '⚡', color: 'from-blue-400 to-purple-500', effect: 'Slow Motion' },
    rainbow: { emoji: '🌈', color: 'from-purple-400 to-pink-500', effect: 'Double Points' },
    golden: { emoji: '✨', color: 'from-yellow-300 to-yellow-600', effect: '3x Multiplier' }
  }), []);
  

  // Romantic poems collection
  const poems = useMemo(() => [
    "In your eyes, I see the stars,\nIn your smile, my world ignites.\nEvery moment spent with you,\nMakes everything feel right. ✨",
    
    "You are my sunshine on cloudy days,\nMy rainbow after every storm.\nWith you, life becomes a beautiful song,\nAnd love takes its perfect form. 🌈",
    
    "Like flowers bloom in spring,\nMy love for you grows each day.\nYou're the melody in my heart,\nThe words I long to say. 🌸",
    
    "Your laughter is my favorite sound,\nYour happiness, my greatest treasure.\nIn this dance of life we share,\nYou're my rhythm and my measure. 💃",
    
    "When I count my blessings,\nI count you twice, maybe thrice.\nYou've made my world so beautiful,\nMy heart's own paradise. 💖",
    
    "You're the coffee to my morning,\nThe stars to my night sky.\nWith you, every ordinary moment\nBecomes a reason to fly high. ☕✨",
    
    "Time stands still when you're near,\nThe world fades away but you.\nIn your arms I find my home,\nIn your heart, my dreams come true. 🏠💕",
    
    "You paint colors in my gray days,\nBring music to my silent nights.\nWith every kiss, every touch,\nYou make everything feel right. 🎨🎵",
    
    "Distance means nothing when love means everything,\nMiles apart but hearts as one.\nEvery sunset brings me closer\nTo the day our love has won. 🌅❤️",
    
    "In a world of temporary things,\nYou are my constant, my forever.\nThrough seasons change and years go by,\nMy love for you will fade never. 🌿♾️",
    
    "You're the answer to my prayers,\nThe wish upon my shooting star.\nNo matter where life takes us,\nYou'll always be my guiding star. ⭐🙏",
    
    "Every heartbeat whispers your name,\nEvery breath carries your love.\nYou're my earth, my moon, my sun,\nMy blessing sent from above. 🌍🌙☀️",
    
    "In your smile I find my courage,\nIn your voice I hear my song.\nWith you beside me always,\nI know where I belong. 😊🎶",
    
    "Love letters written in the stars,\nPromises made with morning dew.\nEvery day I fall deeper,\nMore madly in love with you. 💌⭐",
    
    "You're my favorite notification,\nMy sweetest dream come true.\nIn this crazy, busy world,\nMy peace is found in you. 📱💤"
  ], []);

  // Special custom poem
  const specialPoem = useMemo(() => 
    "In depths of heart, a love resides,\nA flame that burns, a love that guides.\nA love so pure, so strong, so true,\nA love for you, forever new.\n\nWith every beat, my heart does yearn,\nFor your sweet love, a wish to learn.\nA love that grows, with every day,\nA love that shines, come what may.\n\nYour eyes, a star, a guiding light,\nYour smile, a sun, so warm and bright.\nYour touch, a solace, soft and deep,\nYour love, a treasure, I'll forever keep.\n\nSo let us vow, to love and care,\nTo face life's storms, together we'll share.\nA bond unbroken, a love divine,\nForever yours, and ever mine. 💖"
  , []);
  
  // Check if app should be unlocked
  useEffect(() => {
    // Force unlock the app
    //setIsUnlocked(true);
    
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
  }, [targetDate]);
  
  // Select random poem on component mount
  useEffect(() => {
    if (isUnlocked) {
      const randomPoem = poems[Math.floor(Math.random() * poems.length)];
      setCurrentPoem(randomPoem);
    }
  }, [isUnlocked, poems]);


  // Play gentle welcome music (without dingling sound)
  const playWelcomeMusic = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const playGentleChord = (frequencies, delay = 0) => {
      setTimeout(() => {
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          
          const now = audioContext.currentTime;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.05, now + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
          
          oscillator.start(now);
          oscillator.stop(now + 2.5);
        });
      }, delay);
    };

    // Play a softer, more harmonious melody
    playGentleChord([261.63, 329.63, 392.00], 0);    // C major chord
    playGentleChord([293.66, 369.99, 440.00], 1200); // D major chord  
    playGentleChord([261.63, 329.63, 392.00], 2400); // C major chord
  }, []);

  // Update active power-ups timer
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCompleted) {
      const interval = setInterval(() => {
        setActivePowerUps(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].active && updated[key].timeLeft > 0) {
              updated[key].timeLeft -= 100;
              if (updated[key].timeLeft <= 0) {
                updated[key].active = false;
                if (key === 'scoreMultiplier') {
                  updated[key].multiplier = 1;
                }
              }
            }
          });
          return updated;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, gameCompleted]);

  // Track occupied columns to prevent overlap
  const occupiedColumns = useRef(new Set());
  const gameSpeed = useRef(1);

  // Define spawnPowerUp first since it's used by spawnNewTile
  const spawnPowerUp = useCallback(() => {
    if (powerUps.length >= 2) return; // Max 2 power-ups at once
    
    const availableColumns = [0, 1, 2, 3].filter(col => {
      // Check if column is occupied by a tile or another power-up
      const isColumnOccupied = fallingTiles.some(tile => tile.column === col) || 
                              powerUps.some(pu => pu.column === col);
      return !isColumnOccupied;
    });
    
    if (availableColumns.length === 0) return;
    
    const column = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    const types = Object.keys(powerUpTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newPowerUp = {
      id: Date.now() + Math.random(),
      type: type,
      column: column,
      y: -80,
      speed: 1.5 + (gameSpeed.current * 1.5), // Slightly slower than tiles
      width: 60,
      height: 60
    };
    
    setPowerUps(prev => [...prev, newPowerUp]);
  }, [powerUps, fallingTiles, powerUpTypes, gameSpeed]);

  const spawnNewTile = useCallback(() => {
    if (fallingTiles.length >= 4) {
      // Check if there are any columns that should be marked as unoccupied
      const occupiedSet = new Set(fallingTiles.map(tile => tile.column));
      if (occupiedSet.size < 4) {
        // Some columns are actually free, update the occupiedColumns ref
        occupiedColumns.current = occupiedSet;
      } else {
        return; // All columns are actually occupied
      }
    }
    
    const now = Date.now();
    const gameTime = (now - gameStartTimeRef.current) / 1000; // Convert to seconds
    
    // Speed progression:
    // - First 30 seconds: base speed (1.5x)
    // - Next 10 seconds: gradually increase to 2x
    // - After 40 seconds: stay at 2x
    let speedMultiplier = 1.5;
    if (gameTime > 30 && gameTime <= 40) {
      // Ramp up from 1.5x to 2x over 10 seconds
      const progress = (gameTime - 30) / 10; // 0 to 1 over 10 seconds
      speedMultiplier = 1.5 + (0.5 * progress);
    } else if (gameTime > 40) {
      // Stay at 2x after 40 seconds
      speedMultiplier = 2;
    }
    
    // Get available columns (0-3)
    const availableColumns = [0, 1, 2, 3].filter(col => !occupiedColumns.current.has(col));
    if (availableColumns.length === 0) return; // All columns occupied
    
    const column = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    const noteIndex = endlessMode ? tilesSpawned % happyBirthdayNotes.length : Math.min(tilesSpawned, happyBirthdayNotes.length - 1);
    
    const newTile = {
      id: now + Math.random(),
      note: happyBirthdayNotes[noteIndex],
      column: column,
      y: -80,
      speed: getOptimalTileSpeed() * speedMultiplier, // Adaptive base speed
      noteIndex: noteIndex,
      spawned: true
    };
    
    // Update occupied columns
    const newOccupied = new Set(occupiedColumns.current);
    newOccupied.add(column);
    occupiedColumns.current = newOccupied;
    
    setFallingTiles(prev => [...prev, newTile]);
    setTilesSpawned(prev => prev + 1);
    
    // Spawn power-up with lower probability to prevent clutter
    if (Math.random() < 0.1) { // 10% chance for power-up
      spawnPowerUp();
    }
  }, [fallingTiles, tilesSpawned, happyBirthdayNotes, endlessMode, spawnPowerUp]);

  const updateTiles = useCallback(() => {
    setFallingTiles(prevTiles => {
      // First, update all tile positions
      const updatedTiles = prevTiles.map(tile => ({
        ...tile,
        y: tile.y + tile.speed,
        speed: tile.speed + 0.01 // Gradually increase speed
      }));
      
      // Then check for tiles that need to be removed
      const remainingTiles = [];
      const newOccupied = new Set();
      
      updatedTiles.forEach(tile => {
        if (tile.y < 500) { // If tile is still on screen
          remainingTiles.push(tile);
          newOccupied.add(tile.column);
        } else if (tile.y >= 500 && !activePowerUps.invincible.active) {
          // Only penalize if not in invincible mode
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return Math.max(0, newLives); // Ensure lives don't go below 0
          });
          setCombo(0);
        }
      });
      
      // Update the occupied columns ref
      occupiedColumns.current = newOccupied;
      
      return remainingTiles;
    });
  }, [activePowerUps.invincible.active]);

  const updatePowerUps = useCallback(() => {
    setPowerUps(prevPowerUps => {
      // Update positions of existing power-ups
      const updatedPowerUps = prevPowerUps.map(powerUp => ({
        ...powerUp,
        y: powerUp.y + powerUp.speed
      }));
      
      // Remove power-ups that are off screen
      return updatedPowerUps.filter(powerUp => powerUp.y < 500);
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gameCompleted) return;
    
    const gameLoop = setInterval(() => {
      updateTiles();
      updatePowerUps();
      
    // Spawn new tiles at intervals with adaptive rate
    const now = Date.now();
    const baseSpawnRate = getOptimalSpawnRate();
    const spawnInterval = Math.max(baseSpawnRate - (gameSpeed.current * 100), 300); // Faster spawning as speed increases
      
      if (now - lastTileSpawnRef.current > spawnInterval) {
        spawnNewTile();
        lastTileSpawnRef.current = now;
      }
      
    }, 1000/60); // ~60 FPS
    
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, gameCompleted, updateTiles, updatePowerUps, spawnNewTile]);

  // Play background music with Happy Birthday melody
  const playBackgroundMusic = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Stop any existing background music
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
    }

    const playMelodyNote = (noteIndex = 0) => {
      if (noteIndex >= happyBirthdayNotes.length) {
        // Restart melody after a pause
        backgroundMusicRef.current = setTimeout(() => playMelodyNote(0), 2000);
        return;
      }

      const note = happyBirthdayNotes[noteIndex];
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      const now = audioContext.currentTime;
      
      // Softer background music volume
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(isMuted ? 0.00001 : 0.08, now + 0.05); // Gentle attack
      gainNode.gain.exponentialRampToValueAtTime(isMuted ? 0.00001 : 0.04, now + 0.2); // Soft decay
      gainNode.gain.setValueAtTime(isMuted ? 0.00001 : 0.04, now + note.duration / 1000 - 0.1); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + note.duration / 1000); // Release

      oscillator.start(now);
      oscillator.stop(now + note.duration / 1000);

      // Schedule next note
      backgroundMusicRef.current = setTimeout(() => playMelodyNote(noteIndex + 1), note.duration);
    };

    playMelodyNote(0);
  }, [happyBirthdayNotes, isMuted]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
  }, []);

  // Start background music when celebration screen shows
  useEffect(() => {
    if (showCelebration && !isMuted) {
      // Small delay to ensure the screen has rendered
      const timer = setTimeout(() => {
        playBackgroundMusic();
      }, 500);
      return () => clearTimeout(timer);
    } else if (!showCelebration) {
      stopBackgroundMusic();
    }
  }, [showCelebration, isMuted, playBackgroundMusic, stopBackgroundMusic]);

  // Load media files only once on component mount
  useEffect(() => {
    const loadMedia = async () => {
      setMediaLoading(true);
      try {
        const mediaData = await loadMediaFiles();
        console.log('Loaded media data:', mediaData);
        setPictures(mediaData.pictures);
        setVideos(mediaData.videos);
        console.log('Videos set:', mediaData.videos);
      } catch (error) {
        console.error('Error loading media:', error);
        // Fallback to empty arrays
        setPictures([]);
        setVideos([]);
      } finally {
        setMediaLoading(false);
      }
    };

    loadMedia();
  }, []); // Only run once on mount

  // Cleanup audio manager on unmount
  useEffect(() => {
    return () => {
      audioManagerRef.current?.cleanup();
    };
  }, []);

  // Game loop for falling tiles - optimized with interval instead of requestAnimationFrame
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver || gameCompleted) return;

    const currentTime = Date.now();
    
    // Spawn new tiles every 2 seconds, but increase frequency as game progresses
    const baseInterval = activePowerUps.slowMotion.active ? 2500 : 1500;
    const spawnInterval = Math.max(baseInterval - (tilesSpawned * 100), 800); // Faster spawning over time
    
    // In endless mode, keep spawning tiles indefinitely
    // In normal mode, spawn tiles until we have enough for the full melody
    const shouldSpawn = endlessMode ? true : tilesSpawned < happyBirthdayNotes.length + 2; // Extra tiles to ensure completion
    
    if (currentTime - lastTileSpawnRef.current > spawnInterval && shouldSpawn) {
      const noteIndex = endlessMode ? tilesSpawned % happyBirthdayNotes.length : Math.min(tilesSpawned, happyBirthdayNotes.length - 1);
      const newTile = {
        id: Date.now() + Math.random(), // Better unique ID
        note: happyBirthdayNotes[noteIndex],
        column: Math.floor(Math.random() * 4), // 4 columns
        y: -80, // Start above screen
        speed: activePowerUps.slowMotion.active ? 
          (2 + Math.floor(tilesSpawned / 5)) : 
          (4 + Math.floor(tilesSpawned / 3)), // Slower in slow motion
        noteIndex: noteIndex,
        spawned: true
      };
      
      setFallingTiles(prev => [...prev, newTile]);
      setTilesSpawned(prev => prev + 1);
      lastTileSpawnRef.current = currentTime;
      
      // Chance to spawn power-up
      spawnPowerUp();
    }

    // Update tile positions
    setFallingTiles(prev => prev.map(tile => ({
      ...tile,
      y: tile.y + tile.speed
    })).filter(tile => {
      // Remove tiles that hit bottom (lose life unless invincible)
      if (tile.y > 450) { // Adjusted for game container height
        if (!activePowerUps.invincible.active) {
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return newLives;
          });
          setCombo(0); // Reset combo on miss
        }
        return false;
      }
      return true;
    }));

    // Update power-up positions
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      y: powerUp.y + powerUp.speed
    })).filter(powerUp => powerUp.y < 500)); // Remove power-ups that fall off screen
  }, [gameStarted, gameOver, gameCompleted, tilesSpawned, happyBirthdayNotes, endlessMode, activePowerUps.slowMotion.active, activePowerUps.invincible.active, spawnPowerUp]);
  


  // Start game loop when game starts - using frame rate limiting for optimal performance
  useEffect(() => {
    if (gameStarted && !gameOver && !gameCompleted) {
      gameStartTimeRef.current = Date.now();
      
      // Use frame rate limiting for optimal performance
      const frameTime = 1000 / getOptimalFrameRate();
      gameLoopRef.current = setInterval(gameLoop, frameTime);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      cancelFrameRateLimit();
    };
  }, [gameStarted, gameOver, gameCompleted, gameLoop, cancelFrameRateLimit]);
  
  // Play a musical note
  const playNote = useCallback((frequency, duration) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    const now = audioContext.currentTime;
    
    // ADSR envelope for smoother sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
    gainNode.gain.setValueAtTime(0.05, now + duration / 1000 - 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
    
    // Use audio manager for better memory management
    audioManagerRef.current.addOscillator(oscillator);
    
    // Clean up when note ends
    oscillator.onended = () => {
      audioManagerRef.current.removeOscillator(oscillator);
    };
  }, []);

  // Handle power-up collection
  const collectPowerUp = useCallback((powerUpId, type) => {
    setPowerUps(prev => {
      const powerUp = prev.find(p => p.id === powerUpId);
      if (!powerUp) return prev;
      
      // Add visual collection effect
      const collectionElement = document.createElement('div');
      collectionElement.className = 'absolute pointer-events-none z-50';
      collectionElement.style.left = `${(powerUp.column * 25) + 12.5}%`;
      collectionElement.style.top = `${powerUp.y + 30}px`;
      collectionElement.innerHTML = `
        <div class="text-3xl animate-bounce" style="animation-duration: 0.8s;">
          ${powerUpTypes[type].emoji}
        </div>
        <div class="text-yellow-300 text-xl animate-ping" style="animation-duration: 1s;">
          ✨✨✨
        </div>
      `;
      document.querySelector('.game-area')?.appendChild(collectionElement);
      
      // Remove collection effect after animation
      setTimeout(() => {
        if (collectionElement.parentNode) {
          collectionElement.parentNode.removeChild(collectionElement);
        }
      }, 1500);
      
      return prev.filter(p => p.id !== powerUpId);
    });
    
    // Apply power-up effect
    switch (type) {
      case 'heart':
        setLives(prev => Math.min(prev + 1, 5)); // Max 5 lives
        break;
      case 'star':
        setActivePowerUps(prev => ({
          ...prev,
          invincible: { active: true, timeLeft: 5000 }
        }));
        break;
      case 'lightning':
        setActivePowerUps(prev => ({
          ...prev,
          slowMotion: { active: true, timeLeft: 8000 }
        }));
        break;
      case 'rainbow':
        setActivePowerUps(prev => ({
          ...prev,
          scoreMultiplier: { active: true, timeLeft: 10000, multiplier: 2 }
        }));
        break;
      case 'golden':
        setActivePowerUps(prev => ({
          ...prev,
          scoreMultiplier: { active: true, timeLeft: 8000, multiplier: 3 }
        }));
        break;
      default:
        break;
    }
    
    // Play collection sound - Commented out to remove sound
    // try {
    //   playNote(523.25, 200); // High C
    // } catch (error) {
    //   console.log('Audio playback failed:', error);
    // }
  }, [powerUpTypes]);

  const handleTileClick = useCallback((tileId) => {
    // Play the note immediately for better feedback
    try {
      playNote(261.63, 300); // Quick feedback sound
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
          playNote(tile.note.frequency, tile.note.duration);
        } catch (error) {
          console.log('Audio playback failed:', error);
        }
      }, 50);
      
      // Add visual feedback - create a burst effect
      const burstElement = document.createElement('div');
      burstElement.className = 'absolute pointer-events-none z-50';
      burstElement.style.left = `${(tile.column * 25) + 12.5}%`;
      burstElement.style.top = `${tile.y + 30}px`;
      burstElement.innerHTML = `
        <div class="text-2xl animate-bounce" style="animation-duration: 0.6s;">
          ${tile.note.note}
        </div>
        <div class="text-yellow-300 text-lg animate-ping" style="animation-duration: 0.8s;">
          ✨
        </div>
      `;
      document.querySelector('.game-area').appendChild(burstElement);
      
      // Remove burst effect after animation
      setTimeout(() => {
        if (burstElement.parentNode) {
          burstElement.parentNode.removeChild(burstElement);
        }
      }, 1000);
      
      // Remove the clicked tile immediately
      return prev.filter(t => t.id !== tileId);
    });
    
    // Update score with multiplier and combo
    const baseScore = 10;
    const multiplier = activePowerUps.scoreMultiplier.active ? activePowerUps.scoreMultiplier.multiplier : 1;
    const comboBonus = Math.floor(combo / 5); // Bonus every 5 combo
    const finalScore = baseScore * multiplier + comboBonus;
    
    setScore(prevScore => prevScore + finalScore);
    setCombo(prev => {
      const newCombo = prev + 1;
      setMaxCombo(current => Math.max(current, newCombo));
      return newCombo;
    });
    
    setTilesHit(prevHit => {
      const newHit = prevHit + 1;
      
      // Check if game is completed - need to hit all tiles
      if (newHit >= happyBirthdayNotes.length) {
        if (endlessMode) {
          // In endless mode, continue spawning tiles
          setTilesSpawned(0);
          setTilesHit(0);
          return 0; // Reset hit count for endless mode
        } else {
          // Show choice menu after game completion
          setTimeout(() => {
            setGameCompleted(true);
            setShowChoiceMenu(true);
            setName("Beautiful Wifey");
            setMessage("Happy Birthday! You've unlocked a special surprise.");
          }, 500);
        }
      }
      
      return newHit;
    });
  }, [happyBirthdayNotes.length, endlessMode, activePowerUps.scoreMultiplier.active, activePowerUps.scoreMultiplier.multiplier, combo, setName, setMessage, playNote]);
  
  // Handler for opening Kuku message
  const openKukuMessage = useCallback(() => {
    console.log('Opening Kuku message, current state:', showKukuMessage);
    setShowKukuMessage(true);
    console.log('Kuku message state set to true');
  }, [showKukuMessage]);
  
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setShowCelebration(false);
    setScore(0);
    setFallingTiles([]);
    setGameOver(false);
    setLives(3);
    setTilesHit(0);
    setTilesSpawned(0);
    setEndlessMode(false);
    setShowChoiceMenu(false);
    setShowSpecialPoem(false);
    setShowKukuMessage(false);
    setPowerUps([]);
    setActivePowerUps({
      invincible: { active: false, timeLeft: 0 },
      slowMotion: { active: false, timeLeft: 0 },
      scoreMultiplier: { active: false, timeLeft: 0, multiplier: 1 }
    });
    setCombo(0);
    setMaxCombo(0);
    lastTileSpawnRef.current = 0;
    
    // Cancel any running game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    // Generate new poem
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];
    setCurrentPoem(randomPoem);
  };
  
  if (!isUnlocked) {
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center px-4 relative overflow-hidden">
        {/* Floating Elements Background */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
        
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
  }
  
  if (showCelebration) {
    return (
      <>
      <div className="min-h-screen dynamic-bg flex items-center justify-center relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Floating Elements Background */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
        
        
        
        <div className="relative z-10 text-center max-w-xs sm:max-w-md lg:max-w-lg mx-4 w-full mt-4">
          <div className="glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-200 mb-3 animate-pulse neon-title">
              HAPPY BIRTHDAY! 
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 soft-subtitle">To My Beautiful Wifey</p>
            
            {/* Transparent Gallery Buttons with Blurred Background */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Photo Gallery Button */}
              <button 
                onClick={() => {
                  setShowPhotoGallery(true);
                }}
                className="group relative overflow-hidden rounded-2xl h-32 sm:h-40 transition-all duration-300 hover:scale-105"
              >
                {/* Background Images Collage */}
                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2">
                  {pictures.slice(0, 4).map((picture, index) => (
                    <div key={picture.id} className="relative overflow-hidden rounded-lg">
                      <img
                        src={picture.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover filter blur-sm group-hover:blur-none transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Transparent Overlay with Text */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📸</div>
                  <p className="text-white font-bold text-lg drop-shadow-lg">Photo Gallery</p>
                  <p className="text-white/90 text-sm drop-shadow-md">View memories</p>
                </div>
              </button>

              {/* Video Gallery Button */}
              <button 
                onClick={() => {
                  setShowVideoGallery(true);
                }}
                className="group relative overflow-hidden rounded-2xl h-32 sm:h-40 transition-all duration-300 hover:scale-105"
              >
                {/* Background Video Preview */}
                <div className="absolute inset-0 p-2">
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    {videos.length > 0 ? (
                      <video
                        src={videos[0]?.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        preload="metadata"
                        playsInline
                        onError={(e) => {
                          console.log('Video preview error:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-4xl">🎥</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Transparent Overlay with Text */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🎥</div>
                  <p className="text-white font-bold text-lg drop-shadow-lg">Video Gallery</p>
                  <p className="text-white/90 text-sm drop-shadow-md">Watch moments</p>
                </div>
              </button>
            </div>

            {/* Kuku Message Button - Positioned under gallery buttons */}
            <div className="mb-6">
              <button
                onClick={() => {
                  console.log('Kuku button clicked!');
                  openKukuMessage();
                }}
                className="btn-solid-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-3xl h-24 sm:h-23 text-sm sm:text-base md:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
              >
                
                {/* Glow effect for Kuku Message Button */}
                <div className="absolute inset-0 rounded-2xl shadow-2xl group-hover:shadow-pink-500/50 transition-all duration-300" 
                style={{
                  boxShadow: '0 0 30px rgba(238, 20, 129, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)'
                }}>
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform duration-300">💖</div>
                  <p className="text-white font-bold text-lg sm:text-xl drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300">
                    For My Beautiful Kuku
                  </p>
                  <p className="text-white/90 text-sm drop-shadow-md">Special message</p>
                </div>
                
              </button>
            </div>
            


          </div>
          
          <div className="glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center flex-wrap">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 text-red-300" />
              <span className="text-center">A Poem Just For You</span>
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 ml-1 sm:ml-2 text-red-300" />
            </h3>
            <p className="text-white/90 whitespace-pre-line text-sm sm:text-base md:text-lg leading-relaxed">
              {currentPoem}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => {
                stopBackgroundMusic();
                resetGame();
              }}
              className="btn-solid-1 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              🎵 Play Again
            </button>
            <button
              onClick={() => {
                const randomPoem = poems[Math.floor(Math.random() * poems.length)];
                setCurrentPoem(randomPoem);
              }}
              className="btn-solid-2 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              💝 New Poem
            </button>
            <button
              onClick={() => setShowSpecialPoem(true)}
              className="btn-solid-3 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              ✨ Special Poem
            </button>
          </div>
        </div>
        {/* Kuku Message Modal */}
        <KukuMessage 
                  isVisible={showKukuMessage} 
                  onClose={() => setShowKukuMessage(false)} 
                />
        
        {/* Mute Button - Fixed Position Bottom Left */}
        <button
          onClick={async () => {
            console.log('Mute button clicked, current state:', isMuted);
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            
            // Handle audio context resume if needed
            if (!newMutedState && audioContextRef.current && audioContextRef.current.state === 'suspended') {
              try {
                await audioContextRef.current.resume();
              } catch (error) {
                console.log('Failed to resume audio context:', error);
              }
            }
            
            // Stop current background music if muting
            if (newMutedState) {
              stopBackgroundMusic();
            } else {
              // Restart background music if unmuting
              setTimeout(() => {
                playBackgroundMusic();
              }, 100); // Small delay to ensure state is updated
            }
          }}
          className="fixed bottom-6 left-6 z-50 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-4 transition-all duration-200 hover:scale-110 group shadow-lg"
          title={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-white/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white/80 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
        
        {/* Special Poem Sliding Panel */}
        <div className={`fixed inset-0 z-30 transition-transform duration-500 ease-in-out ${showSpecialPoem ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSpecialPoem(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl dynamic-bg shadow-2xl overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">✨ Special Poem ✨</h2>
                <button
                  onClick={() => setShowSpecialPoem(false)}
                  className="glass-effect hover:glass-effect-dark text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
                >
                  ✕
                </button>
              </div>
              
              <div className="glass-effect-dark rounded-3xl p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">💖</div>
                  <h3 className="text-2xl font-bold text-white mb-2">From My Heart to Yours</h3>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-300 to-red-300 mx-auto rounded-full"></div>
                </div>
                
                <div className="text-white/95 text-lg leading-relaxed whitespace-pre-line font-serif text-center">
                  {specialPoem}
                </div>
                
                <div className="text-center mt-8">
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-300 to-red-300 mx-auto rounded-full mb-4"></div>
                  <p className="text-white/80 italic text-sm">Written with all my love 💕</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Love message in bottom right */}
        <div className="fixed bottom-4 right-4 z-20">
          <div className="glass-effect rounded-2xl px-4 py-2 animate-pulse">
            <p className="text-white/90 text-sm font-medium italic">
              I love you my darling kuku 💕
            </p>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal - Rendered at root level for proper floating overlay */}
      {showPhotoGallery && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md">
          {/* Close Button */}
          <button
            onClick={() => setShowPhotoGallery(false)}
            className="absolute top-6 right-6 z-[10000] text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Gallery Title */}
          <div className="absolute top-6 left-6 z-[10000]">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">📸</span>
              Photo Gallery
            </h3>
          </div>
          
          {/* Full Screen Gallery Grid */}
          <div className="w-full h-full p-6 pt-24 overflow-y-auto">
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
              {pictures.map((picture, index) => {
                // Random heights for masonry effect
                const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-60', 'h-80'];
                const randomHeight = heights[index % heights.length];
                
                return (
                  <div
                    key={picture.id}
                    className={`relative ${randomHeight} rounded-2xl overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl break-inside-avoid mb-4`}
                    onClick={() => setSelectedPhoto(picture)}
                  >
                    <img
                      src={picture.url}
                      alt={picture.alt || `Memory ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-semibold drop-shadow-lg">
                          {picture.alt || `Memory ${index + 1}`}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-purple-400/60 rounded-2xl transition-all duration-300"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Video Gallery Modal - Rendered at root level for proper floating overlay */}
      {showVideoGallery && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md">
          {/* Close Button */}
          <button
            onClick={() => setShowVideoGallery(false)}
            className="absolute top-6 right-6 z-[10000] text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Gallery Title */}
          <div className="absolute top-6 left-6 z-[10000]">
            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🎥</span>
              Video Gallery
            </h3>
          </div>
          
          {/* Full Screen Video Grid */}
          <div className="w-full h-full p-6 pt-24 overflow-y-auto">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {console.log('Rendering videos:', videos)}
              {videos.length === 0 && (
                <div className="text-white text-center py-8">
                  <p>No videos found. Loading...</p>
                  <p className="text-sm text-white/70 mt-2">Check console for loading errors</p>
                </div>
              )}
              {videos.map((video, index) => {
                // Different aspect ratios for variety
                const aspectRatios = ['aspect-video', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]'];
                const randomAspect = aspectRatios[index % aspectRatios.length];
                
                return (
                  <div
                    key={video.id}
                    className={`relative ${randomAspect} rounded-2xl overflow-hidden group cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl break-inside-avoid mb-6`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      preload="metadata"
                      playsInline
                      onMouseEnter={(e) => {
                        e.target.currentTime = 0;
                        e.target.play().catch(err => console.log('Video play failed:', err));
                      }}
                      onMouseLeave={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                      onError={(e) => {
                        console.log('Video error:', e, video.url);
                        e.target.style.display = 'none';
                      }}
                      onLoadedMetadata={(e) => {
                        e.target.currentTime = 0.1;
                      }}
                      onCanPlay={(e) => {
                        console.log('Video can play:', video.url);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-semibold drop-shadow-lg">
                          {video.alt || `Video ${index + 1}`}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 group-hover:bg-black/70 rounded-full p-6 transition-all duration-300">
                        <svg className="w-12 h-12 text-white transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-blue-400/60 rounded-2xl transition-all duration-300"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal - Rendered at root level for proper floating overlay */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 rounded-full p-4 transition-all duration-200 hover:scale-110 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.alt}
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Image info */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white text-xl font-semibold">{selectedPhoto.alt || 'Memory'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal - Rendered at root level for proper floating overlay */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 rounded-full p-4 transition-all duration-200 hover:scale-110 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Video */}
            <video
              src={selectedVideo.url}
              controls
              autoPlay
              className="w-full h-full object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Video info */}
            <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-white text-xl font-semibold">{selectedVideo.alt || 'Video'}</p>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }
  
  if (!gameStarted) {
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center relative overflow-hidden">
        {/* Floating Hearts Background */}
        <FloatingHeartsBackground 
          heartCount={15} 
          opacity={0.25} 
          animationDuration={12}
          pulseDuration={15}
          size="w-6 h-6"
          color="text-pink-200"
        />
        
        {/* Floating Elements Background */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
        
        <div className="magical-card glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-xs sm:max-w-md lg:max-w-lg mx-4 relative z-10 w-full">
          
          {/* Happy Birthday Title */}
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-white bg-clip-text bg-gradient-to-r from-pink-400 via-red-800 to-yellow-300">
              HAPPY BIRTHDAY!
            </h1>
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="absolute w-full h-full bg-gradient-to-r from-pink-400/20 via-red-400/20 to-yellow-300/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400/30 via-red-400/30 to-yellow-300/30 rounded-lg blur opacity-75 animate-pulse"></div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 soft-subtitle">To My Beautiful Wifey</p>
          

          {/* Piano Keys Preview */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-center space-x-1 mb-3 sm:mb-4">
              {['C', 'D', 'E', 'F', 'G'].map((note, i) => (
                <div
                  key={note}
                  className="piano-key w-6 h-12 sm:w-8 sm:h-16 bg-white rounded-b-lg shadow-lg flex items-end justify-center pb-1 sm:pb-2 text-xs font-bold text-gray-700 animate-pulse cursor-pointer"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>

          <Music className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white mx-auto mb-3 sm:mb-4 animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">🎵 Falling Piano Tiles</h2>
          
          <div className="space-y-2 sm:space-y-3">
            <TouchButton
              onClick={() => {
                setGameStarted(true);
                if (!welcomeMusicStarted) {
                  playWelcomeMusic();
                  setWelcomeMusicStarted(true);
                }
              }}
              className="w-full btn-solid-1 btn-bounce text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full text-xl sm:text-2xl font-bold hover:scale-105 transform transition-all duration-300 shadow-lg"
              touchFeedback={true}
            >
              🎵 Start Playing
            </TouchButton>
            
            <button
              onClick={() => {
                if (!welcomeMusicStarted) {
                  playWelcomeMusic();
                  setWelcomeMusicStarted(true);
                }
              }}
              className="btn-solid-2 btn-bounce text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold hover:scale-105 transition-all duration-300"
              style={{animationDelay: '0.2s'}}
            >
              🎶 Play Welcome Music
            </button>
          </div>
        </div>

        {/* Love message in corner */}
        <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 z-20">
          <div className="glass-effect rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1 sm:py-2">
            <p className="text-white/90 text-xs sm:text-sm font-medium italic typewriter">
              Made with love just for you 🎵
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Choice Menu after completing all tiles
  if (showChoiceMenu && gameCompleted) {
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center px-4 relative overflow-hidden">
        
        {/* Floating Elements Background */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
        
        <div className="glass-effect-dark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center max-w-xs sm:max-w-md w-full relative z-10">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Congratulations!</h1>
          <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base">You successfully completed "Happy Birthday"!</p>
          <div className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-white text-base sm:text-lg">Final Score: {score}</p>
            <p className="text-white/80 text-xs sm:text-sm">Max Combo: {maxCombo} 🔥</p>
            <p className="text-white/80 text-xs sm:text-sm">Perfect Performance! 🌟</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => {
                setShowChoiceMenu(false);
                resetGame();
              }}
              className="w-full btn-solid-1 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              🎵 Play Again
            </button>
            
            <button
              onClick={() => {
                setEndlessMode(true);
                setShowChoiceMenu(false);
                setGameCompleted(false);
                setTilesHit(0);
                setTilesSpawned(0);
              }}
              className="w-full btn-solid-1 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              🎮 Endless Mode
            </button>
            
            <button
              onClick={() => {
                setShowChoiceMenu(false);
                setShowCelebration(true);
                playBackgroundMusic();
              }}
              className="w-full btn-solid-2 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
            >
              💝 See Your Surprise
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen dynamic-bg flex items-center justify-center relative overflow-hidden">
        {/* Floating Hearts Background */}
        {/* Floating Elements Background */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
        
        <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md mx-4 relative z-10">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-3xl font-bold text-white mb-4">Game Over!</h1>
          <p className="text-white/90 mb-4">You missed too many tiles!</p>
          <div className="glass-effect rounded-2xl p-4 mb-6">
            <p className="text-white text-lg">Final Score: {score}</p>
            <p className="text-white/80 text-sm">Max Combo: {maxCombo} 🔥</p>
            <p className="text-white/80 text-sm">Tiles Hit: {Math.floor(score / 10)}</p>
            <p className="text-white/80 text-sm mt-2">Lives Available: {lives}</p>
          </div>
          
          <div className="space-y-3">
            {lives > 0 && (
              <button
                onClick={() => {
                  // Continue playing by using one life
                  setGameOver(false);
                  setLives(lives - 1);
                  // Reset falling tiles
                  setFallingTiles([]);
                  // Reset combo
                  setCombo(0);
                  // Start the game loop again
                  if (gameLoopRef.current) {
                    clearInterval(gameLoopRef.current);
                  }
                  gameLoopRef.current = setInterval(gameLoop, 50); // 20 FPS for smoother performance
                }}
                className="glass-effect rounded-2xl px-3 py-2 text-lg font-bold hover:scale-105 transition-all duration-300 text-white"
              >
                💖 Continue (Use 1 Life)
              </button>
            )}
            
            <button
              onClick={resetGame}
              className="glass-effect rounded-2xl px-3 py-2 text-lg font-bold hover:scale-105 transition-all duration-300 text-white"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <MobileOptimizations
      onTouchStart={(e) => {
        // Handle touch start events
        if (e.target.closest('.game-tile')) {
          e.preventDefault();
        }
      }}
      onTouchEnd={(e, gesture) => {
        // Handle touch end events
        if (gesture === 'tap' && e.target.closest('.game-tile')) {
          e.preventDefault();
        }
      }}
    >
      <div className="min-h-screen dynamic-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements Background */}
      {floatingElements.map((element, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animation: `welcomeFloat 12s ease-in-out infinite`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.type === 'heart' && (
              <Heart 
                className={`text-pink-300 animate-pulse floating-heart`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '3s'
                }}
              />
            )}
            {element.type === 'note' && (
              <Music 
                className={`text-blue-200 animate-bounce floating-music`}
                style={{
                  width: `${element.size * 4}px`,
                  height: `${element.size * 4}px`,
                  animationDuration: '2.5s'
                }}
              />
            )}
            {element.type === 'sparkle' && (
              <div 
                className={`bg-yellow-300 rounded-full animate-ping floating-sparkle`}
                style={{
                  width: `${element.size * 2}px`,
                  height: `${element.size * 2}px`,
                  animationDuration: '4s'
                }}
              />
            )}
          </div>
        ))}
      
      {/* Game Container */}
      <div className="game-container glass-effect-dark rounded-3xl p-6 w-96 h-[600px] relative overflow-hidden z-10">
        {/* Game UI Header */}
        <div className="flex justify-between items-center text-white mb-2">
          <div className="score-display glass-effect rounded-xl px-3 py-1">
            <p className="text-xs font-bold">Score: {score}</p>
          </div>
          <div className="glass-effect rounded-xl px-3 py-1">
            <p className="text-xs font-semibold">❤️ {lives}</p>
          </div>
          <div className="glass-effect rounded-xl px-3 py-1">
            <p className="text-xs font-semibold">Hit: {tilesHit}/{endlessMode ? '∞' : happyBirthdayNotes.length}</p>
          </div>
          {endlessMode && (
            <button
              onClick={resetGame}
              className="glass-effect rounded-xl px-3 py-1 text-xs font-semibold hover:scale-105 transition-all duration-300"
            >
              🚪 Exit
            </button>
          )}
        </div>

        {/* Combo and Power-up Status */}
        <div className="flex justify-between items-center text-white mb-2">
          <div className={`glass-effect rounded-xl px-3 py-1 ${combo > 0 ? 'combo-effect' : ''}`}>
            <p className="text-xs font-semibold">🔥 Combo: {combo}</p>
          </div>
          <div className="glass-effect rounded-xl px-3 py-1">
            <p className="text-xs font-semibold">🏆 Best: {maxCombo}</p>
          </div>
        </div>

        {/* Active Power-ups Display */}
        {(activePowerUps.invincible.active || activePowerUps.slowMotion.active || activePowerUps.scoreMultiplier.active) && (
          <div className="flex justify-center space-x-2 mb-2">
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
        <div className={`game-area relative h-[500px] overflow-hidden rounded-2xl ${activePowerUps.invincible.active ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''} ${activePowerUps.slowMotion.active ? 'ring-4 ring-blue-400 ring-opacity-60' : ''}`}>
          <div className="h-full grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map(column => (
              <div key={column} className="relative bg-white/5 border-l border-r border-white/10">
                {/* Column background lines */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="column-line h-16 border-b border-white/10"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Falling Tiles */}
          {fallingTiles.map(tile => (
            <div
              key={tile.id}
              className="absolute z-20"
              style={{
                left: `${(tile.column * 25) + 0.5}%`,
                top: `${tile.y}px`,
                width: '23%',
                height: '60px'
              }}
            >
              <TouchButton
                onClick={() => handleTileClick(tile.id)}
                className="game-tile w-full h-full text-white font-bold text-lg rounded-lg cursor-pointer select-none"
                touchFeedback={true}
                style={{
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <div className="relative z-10">
                  {tile.note.note}
                  <div className="text-xs opacity-90">🎵</div>
                </div>
              </TouchButton>
            </div>
          ))}

          {/* Power-ups */}
          {powerUps.map(powerUp => (
            <div
              key={powerUp.id}
              className="absolute z-20"
              style={{
                left: `${(powerUp.column * 25) + 0.5}%`,
                top: `${powerUp.y}px`,
                width: '23%',
                height: '60px'
              }}
            >
              <TouchButton
                onClick={() => collectPowerUp(powerUp.id, powerUp.type)}
                className="power-up w-full h-full text-white font-bold text-2xl rounded-lg cursor-pointer select-none"
                touchFeedback={true}
                style={{
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                title={powerUpTypes[powerUp.type].effect}
              >
                <div className="relative z-10">
                  {powerUpTypes[powerUp.type].emoji}
                </div>
              </TouchButton>
            </div>
          ))}

          {/* Bottom danger zone indicator */}
          <div className="danger-zone absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white/90 text-xs font-bold">
              ⚠️ Danger Zone ⚠️
            </div>
          </div>
        </div>

        {/* Game completed message */}
        {gameCompleted && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-sm rounded-3xl">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl text-lg font-bold animate-bounce shadow-2xl text-center">
              <div className="mb-2"> Perfect! </div>
            </div>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={resetGame}
            className="glass-effect text-white px-3 py-2 rounded-full hover:scale-105 transition-all duration-300 text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      
      </div>
      
      {/* Performance Monitor - only in development */}
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
    </MobileOptimizations>
  );
};

export default BirthdayPianoSurprise;