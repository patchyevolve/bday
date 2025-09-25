import { useRef, useCallback, useEffect } from 'react';
import { createMemoryManager } from '../utils/performance';

export const usePerformanceOptimizedAudio = () => {
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef([]);
  const backgroundMusicRef = useRef(null);
  const memoryManager = useRef(createMemoryManager());
  const audioPool = useRef([]);
  const maxPoolSize = 10;

  // Initialize audio context with performance optimizations
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Optimize audio context for better performance
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
    return audioContextRef.current;
  }, []);

  // Create audio pool for better performance
  const createAudioPool = useCallback(() => {
    const audioContext = initAudioContext();
    for (let i = 0; i < maxPoolSize; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      audioPool.current.push({
        oscillator,
        gainNode,
        inUse: false
      });
    }
  }, [initAudioContext]);

  // Get available audio from pool
  const getPooledAudio = useCallback(() => {
    const available = audioPool.current.find(item => !item.inUse);
    if (available) {
      available.inUse = true;
      return available;
    }
    return null;
  }, []);

  // Return audio to pool
  const returnToPool = useCallback((audioItem) => {
    if (audioItem) {
      audioItem.inUse = false;
      // Reset audio properties
      audioItem.gainNode.gain.cancelScheduledValues(0);
      audioItem.oscillator.frequency.cancelScheduledValues(0);
    }
  }, []);

  // Optimized note playing with pooling
  const playNote = useCallback((frequency, duration = 300) => {
    try {
      const audioContext = initAudioContext();
      const audioItem = getPooledAudio();
      
      if (!audioItem) {
        // Fallback to creating new audio if pool is empty
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        playNoteWithAudio(oscillator, gainNode, frequency, duration, audioContext);
        return;
      }

      const { oscillator, gainNode } = audioItem;
      playNoteWithAudio(oscillator, gainNode, frequency, duration, audioContext);
      
      // Return to pool after duration
      setTimeout(() => {
        returnToPool(audioItem);
      }, duration + 100);
      
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, [initAudioContext, getPooledAudio, returnToPool]);

  // Helper function to play note with given audio components
  const playNoteWithAudio = useCallback((oscillator, gainNode, frequency, duration, audioContext) => {
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    const now = audioContext.currentTime;
    
    // Optimized ADSR envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
    gainNode.gain.setValueAtTime(0.05, now + duration / 1000 - 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
    
    // Add to active oscillators for cleanup
    activeOscillatorsRef.current.push(oscillator);
    
    // Remove from active array when note ends
    oscillator.onended = () => {
      activeOscillatorsRef.current = activeOscillatorsRef.current.filter(osc => osc !== oscillator);
    };
  }, []);

  // Optimized welcome music with caching
  const playWelcomeMusic = useCallback(() => {
    const cacheKey = 'welcome_music';
    const cached = memoryManager.current.get(cacheKey);
    
    if (cached) {
      // Use cached version
      return;
    }

    const audioContext = initAudioContext();
    
    const playGentleChord = (frequencies, delay = 0) => {
      setTimeout(() => {
        frequencies.forEach((freq) => {
          const audioItem = getPooledAudio();
          if (audioItem) {
            const { oscillator, gainNode } = audioItem;
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'sine';
            
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.05, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
            
            oscillator.start(now);
            oscillator.stop(now + 2.5);
            
            setTimeout(() => returnToPool(audioItem), 2500);
          }
        });
      }, delay);
    };

    // Play melody
    playGentleChord([261.63, 329.63, 392.00], 0);
    playGentleChord([293.66, 369.99, 440.00], 1200);
    playGentleChord([261.63, 329.63, 392.00], 2400);
    
    // Cache this music
    memoryManager.current.set(cacheKey, true);
  }, [initAudioContext, getPooledAudio, returnToPool, memoryManager]);

  // Optimized background music
  const playBackgroundMusic = useCallback((happyBirthdayNotes) => {
    const audioContext = initAudioContext();

    // Stop any existing background music
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
    }

    const playMelodyNote = (noteIndex = 0) => {
      if (noteIndex >= happyBirthdayNotes.length) {
        backgroundMusicRef.current = setTimeout(() => playMelodyNote(0), 2000);
        return;
      }

      const note = happyBirthdayNotes[noteIndex];
      const audioItem = getPooledAudio();
      
      if (audioItem) {
        const { oscillator, gainNode } = audioItem;
        
        oscillator.frequency.setValueAtTime(note.frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        const now = audioContext.currentTime;
        
        // Softer background music volume
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.2);
        gainNode.gain.setValueAtTime(0.04, now + note.duration / 1000 - 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.duration / 1000);

        oscillator.start(now);
        oscillator.stop(now + note.duration / 1000);

        // Return to pool after note
        setTimeout(() => returnToPool(audioItem), note.duration + 100);
      }

      // Schedule next note
      backgroundMusicRef.current = setTimeout(() => playMelodyNote(noteIndex + 1), note.duration);
    };

    playMelodyNote(0);
  }, [initAudioContext, getPooledAudio, returnToPool]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
  }, []);

  // Initialize audio pool on mount
  useEffect(() => {
    createAudioPool();
  }, [createAudioPool]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all active oscillators
      activeOscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      
      // Stop background music
      if (backgroundMusicRef.current) {
        clearTimeout(backgroundMusicRef.current);
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      // Clear memory
      memoryManager.current.clear();
    };
  }, []);

  return {
    playNote,
    playWelcomeMusic,
    playBackgroundMusic,
    stopBackgroundMusic,
    initAudioContext
  };
};
