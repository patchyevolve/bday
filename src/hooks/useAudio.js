import { useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef(null);
  const activeOscillatorsRef = useRef([]);
  const backgroundMusicRef = useRef(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a single note with ADSR envelope
  const playNote = useCallback((frequency, duration = 300) => {
    try {
      const audioContext = initAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      
      // ADSR envelope for smoother sound
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
      gainNode.gain.setValueAtTime(0.05, now + duration / 1000 - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
      
      // Add to active oscillators array
      activeOscillatorsRef.current.push(oscillator);
      
      // Remove from active array when note ends
      oscillator.onended = () => {
        activeOscillatorsRef.current = activeOscillatorsRef.current.filter(osc => osc !== oscillator);
      };
      
      // Clean up old oscillators (keep max 6 simultaneous notes for performance)
      if (activeOscillatorsRef.current.length > 6) {
        const oldestOsc = activeOscillatorsRef.current.shift();
        try {
          oldestOsc.stop();
        } catch (e) {
          // Already stopped
        }
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, [initAudioContext]);

  // Play gentle welcome music
  const playWelcomeMusic = useCallback(() => {
    const audioContext = initAudioContext();
    
    const playGentleChord = (frequencies, delay = 0) => {
      setTimeout(() => {
        frequencies.forEach((freq) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          
          const now = audioContext.currentTime;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.05, now + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
          
          oscillator.start(now);
          oscillator.stop(now + 2.5);
        });
      }, delay);
    };

    // Play a softer, more harmonious melody
    playGentleChord([261.63, 329.63, 392.00], 0);    // C major chord
    playGentleChord([293.66, 369.99, 440.00], 1200); // D major chord  
    playGentleChord([261.63, 329.63, 392.00], 2400); // C major chord
  }, [initAudioContext]);

  // Play background music with Happy Birthday melody
  const playBackgroundMusic = useCallback((happyBirthdayNotes) => {
    const audioContext = initAudioContext();

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
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

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

      // Schedule next note
      backgroundMusicRef.current = setTimeout(() => playMelodyNote(noteIndex + 1), note.duration);
    };

    playMelodyNote(0);
  }, [initAudioContext]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      clearTimeout(backgroundMusicRef.current);
      backgroundMusicRef.current = null;
    }
  }, []);

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
