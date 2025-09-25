import { useEffect, useState, useCallback } from 'react';

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileDevice);
      setIsTouchDevice(isTouchDevice);
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Optimize touch interactions
  const optimizeTouchEvents = useCallback((element) => {
    if (!element) return;

    // Prevent default touch behaviors that might interfere
    const preventDefault = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent zoom on multi-touch
      }
    };

    // Add touch event listeners
    element.addEventListener('touchstart', preventDefault, { passive: false });
    element.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      element.removeEventListener('touchstart', preventDefault);
      element.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  // Get optimized game settings for mobile
  const getMobileGameSettings = useCallback(() => {
    if (!isMobile) {
      return {
        tileSize: 'normal',
        animationQuality: 'high',
        enableHapticFeedback: false,
        touchSensitivity: 'normal'
      };
    }

    // Mobile-specific optimizations
    const settings = {
      tileSize: devicePixelRatio > 2 ? 'large' : 'normal',
      animationQuality: devicePixelRatio > 2 ? 'medium' : 'low',
      enableHapticFeedback: true,
      touchSensitivity: 'high'
    };

    // Adjust for low-end devices
    if (navigator.deviceMemory && navigator.deviceMemory < 2) {
      settings.animationQuality = 'low';
      settings.enableHapticFeedback = false;
    }

    return settings;
  }, [isMobile, devicePixelRatio]);

  // Haptic feedback for mobile
  const triggerHapticFeedback = useCallback((type = 'light') => {
    if (!isTouchDevice || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 10, 10],
      error: [50, 50, 50]
    };

    navigator.vibrate(patterns[type] || patterns.light);
  }, [isTouchDevice]);

  // Optimize viewport for mobile
  const optimizeViewport = useCallback(() => {
    if (!isMobile) return;

    // Add viewport meta tag if not present
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    // Optimize viewport settings
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }, [isMobile]);

  // Prevent zoom on input focus (iOS Safari)
  const preventZoomOnFocus = useCallback(() => {
    if (!isMobile) return;

    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
      });

      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
      });
    });
  }, [isMobile]);

  // Initialize mobile optimizations
  useEffect(() => {
    if (isMobile) {
      optimizeViewport();
      preventZoomOnFocus();
    }
  }, [isMobile, optimizeViewport, preventZoomOnFocus]);

  return {
    isMobile,
    isTouchDevice,
    orientation,
    devicePixelRatio,
    optimizeTouchEvents,
    getMobileGameSettings,
    triggerHapticFeedback,
    optimizeViewport
  };
};
