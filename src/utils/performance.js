// Performance optimization utilities

// Debounce function to limit function calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
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

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Check if device supports hardware acceleration
export const supportsHardwareAcceleration = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!gl;
};

// Get device performance tier
export const getDevicePerformanceTier = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return 'low';
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    // Check for high-end GPUs
    if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Intel Iris')) {
      return 'high';
    }
  }
  
  // Check memory
  if (navigator.deviceMemory && navigator.deviceMemory >= 4) {
    return 'medium';
  }
  
  return 'low';
};

// Optimize animations based on device performance
export const getOptimizedAnimationSettings = () => {
  const performanceTier = getDevicePerformanceTier();
  
  switch (performanceTier) {
    case 'high':
      return {
        maxFloatingElements: 24,
        animationQuality: 'high',
        enableParticles: true,
        enableShadows: true
      };
    case 'medium':
      return {
        maxFloatingElements: 16,
        animationQuality: 'medium',
        enableParticles: true,
        enableShadows: false
      };
    case 'low':
    default:
      return {
        maxFloatingElements: 8,
        animationQuality: 'low',
        enableParticles: false,
        enableShadows: false
      };
  }
};

// Preload critical resources
export const preloadResources = () => {
  // Preload audio context
  if (typeof window !== 'undefined' && window.AudioContext) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Suspend immediately to avoid auto-play issues
    audioContext.suspend();
  }
};

// Memory management utilities
export const createMemoryManager = () => {
  const cache = new Map();
  const maxCacheSize = 50;
  
  return {
    set: (key, value) => {
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    get: (key) => cache.get(key),
    clear: () => cache.clear(),
    size: () => cache.size
  };
};
