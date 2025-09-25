import { useState, useCallback, useEffect } from 'react';

export const usePowerUps = () => {
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({
    invincible: { active: false, timeLeft: 0 },
    slowMotion: { active: false, timeLeft: 0 },
    scoreMultiplier: { active: false, timeLeft: 0, multiplier: 1 }
  });

  // Power-up types configuration
  const powerUpTypes = {
    heart: { emoji: '💖', color: 'from-red-400 to-pink-500', effect: 'Restore Life' },
    star: { emoji: '⭐', color: 'from-yellow-400 to-orange-500', effect: 'Invincible' },
    lightning: { emoji: '⚡', color: 'from-blue-400 to-purple-500', effect: 'Slow Motion' },
    rainbow: { emoji: '🌈', color: 'from-purple-400 to-pink-500', effect: 'Double Points' },
    golden: { emoji: '✨', color: 'from-yellow-300 to-yellow-600', effect: '3x Multiplier' }
  };

  // Update active power-ups timer
  useEffect(() => {
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
  }, []);

  // Spawn power-ups randomly
  const spawnPowerUp = useCallback(() => {
    if (Math.random() < 0.15) { // 15% chance to spawn power-up
      const types = Object.keys(powerUpTypes);
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const newPowerUp = {
        id: Date.now() + Math.random(),
        type: randomType,
        column: Math.floor(Math.random() * 4),
        y: -80,
        speed: 3
      };
      
      setPowerUps(prev => [...prev, newPowerUp]);
    }
  }, [powerUpTypes]);

  // Handle power-up collection
  const collectPowerUp = useCallback((powerUpId, type, onLifeRestore, onPlayNote) => {
    setPowerUps(prev => prev.filter(p => p.id !== powerUpId));
    
    switch (type) {
      case 'heart':
        onLifeRestore(prev => Math.min(prev + 1, 5)); // Max 5 lives
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
    
    // Play collection sound
    try {
      onPlayNote(523.25, 200); // High C
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, []);

  // Update power-up positions
  const updatePowerUpPositions = useCallback(() => {
    setPowerUps(prev => prev.map(powerUp => ({
      ...powerUp,
      y: powerUp.y + powerUp.speed
    })).filter(powerUp => powerUp.y < 500)); // Remove power-ups that fall off screen
  }, []);

  // Reset power-ups
  const resetPowerUps = useCallback(() => {
    setPowerUps([]);
    setActivePowerUps({
      invincible: { active: false, timeLeft: 0 },
      slowMotion: { active: false, timeLeft: 0 },
      scoreMultiplier: { active: false, timeLeft: 0, multiplier: 1 }
    });
  }, []);

  return {
    powerUps,
    activePowerUps,
    powerUpTypes,
    spawnPowerUp,
    collectPowerUp,
    updatePowerUpPositions,
    resetPowerUps
  };
};
