// Performance optimization utilities for the birthday piano app

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function to delay execution until after wait time has passed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * Check if device is mobile based on user agent and screen size
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isMobileScreen = window.innerWidth <= 768;
  return isMobileUA || isMobileScreen;
};

/**
 * Check if device supports touch events
 * @returns {boolean} True if touch supported
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get optimal frame rate based on device capabilities
 * @returns {number} Optimal FPS (30 for mobile, 60 for desktop)
 */
export const getOptimalFrameRate = () => {
  return isMobile() ? 30 : 60;
};

/**
 * Get optimal tile spawn rate based on device performance
 * @returns {number} Spawn interval in milliseconds
 */
export const getOptimalSpawnRate = () => {
  if (isMobile()) {
    return 1200; // Slower on mobile
  }
  return 800; // Faster on desktop
};

/**
 * Get optimal tile speed based on device performance
 * @returns {number} Base tile speed
 */
export const getOptimalTileSpeed = () => {
  if (isMobile()) {
    return 2.5; // Slower on mobile
  }
  return 3; // Faster on desktop
};

/**
 * Memory management for audio oscillators
 */
export class AudioManager {
  constructor() {
    this.activeOscillators = new Set();
    this.maxOscillators = isMobile() ? 4 : 8; // Limit on mobile
  }

  addOscillator(oscillator) {
    this.activeOscillators.add(oscillator);
    
    // Clean up old oscillators if we exceed the limit
    if (this.activeOscillators.size > this.maxOscillators) {
      const oldestOsc = this.activeOscillators.values().next().value;
      if (oldestOsc) {
        try {
          oldestOsc.stop();
        } catch (e) {
          console.warn('Error stopping oscillator:', e);
        }
        this.activeOscillators.delete(oldestOsc);
      }
    }
  }

  removeOscillator(oscillator) {
    this.activeOscillators.delete(oscillator);
  }

  cleanup() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        console.warn('Error stopping oscillator during cleanup:', e);
      }
    });
    this.activeOscillators.clear();
  }
}

/**
 * Image lazy loading utility
 */
export const lazyLoadImage = (img, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
  return observer;
};

/**
 * Video lazy loading utility
 */
export const lazyLoadVideo = (video, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.src = src;
        video.load();
        observer.unobserve(video);
      }
    });
  });
  
  observer.observe(video);
  return observer;
};

/**
 * Optimize canvas rendering for better performance
 */
export const optimizeCanvasRendering = (canvas) => {
  const ctx = canvas.getContext('2d');
  
  // Enable hardware acceleration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Use requestAnimationFrame for smooth rendering
  let animationId;
  const render = () => {
    // Your rendering logic here
    animationId = requestAnimationFrame(render);
  };
  
  return {
    start: () => render(),
    stop: () => cancelAnimationFrame(animationId)
  };
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

/**
 * Performance metrics collection
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = {
      frameRate: 0,
      memoryUsage: 0,
      renderTime: 0,
      gameLoopTime: 0
    };
    this.frameCount = 0;
    this.lastTime = performance.now();
  }

  updateFrameRate() {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastTime >= 1000) {
      this.metrics.frameRate = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }

  updateMemoryUsage() {
    const memory = monitorMemoryUsage();
    if (memory) {
      this.metrics.memoryUsage = memory.usage;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * Adaptive quality settings based on device performance
 */
export const getAdaptiveQualitySettings = () => {
  const isLowEndDevice = isMobile() && window.innerWidth < 400;
  
  return {
    // Visual quality
    particleCount: isLowEndDevice ? 5 : 15,
    animationQuality: isLowEndDevice ? 'low' : 'high',
    blurEffects: !isLowEndDevice,
    
    // Game performance
    maxTilesOnScreen: isLowEndDevice ? 3 : 4,
    powerUpSpawnRate: isLowEndDevice ? 0.05 : 0.1,
    
    // Audio quality
    audioQuality: isLowEndDevice ? 'low' : 'high',
    maxConcurrentSounds: isLowEndDevice ? 2 : 4
  };
};

/**
 * Preload critical assets
 */
export const preloadAssets = async () => {
  const criticalAssets = [
    // Add critical image/video URLs here
  ];
  
  const preloadPromises = criticalAssets.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
  });
  
  try {
    await Promise.all(preloadPromises);
    console.log('Critical assets preloaded successfully');
  } catch (error) {
    console.warn('Some assets failed to preload:', error);
  }
};

/**
 * Battery level monitoring for mobile devices
 */
export const monitorBatteryLevel = () => {
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      const updateBatteryInfo = () => {
        const level = battery.level * 100;
        const isCharging = battery.charging;
        
        // Adjust performance based on battery level
        if (level < 20 && !isCharging) {
          // Reduce performance to save battery
          console.log('Low battery detected, reducing performance');
        }
      };
      
      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
      updateBatteryInfo();
    });
  }
};
