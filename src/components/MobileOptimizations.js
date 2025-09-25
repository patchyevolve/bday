import React, { useEffect, useRef, useCallback } from 'react';
import { isMobile, isTouchDevice, getOptimalFrameRate, getAdaptiveQualitySettings } from '../utils/performanceOptimizations';

/**
 * Mobile-specific optimizations component
 * Handles touch events, performance adjustments, and mobile-specific UI
 */
const MobileOptimizations = ({ children, onTouchStart, onTouchEnd, onTouchMove }) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const lastTouchTimeRef = useRef(0);
  const touchCooldown = 100; // Minimum time between touches in ms

  // Optimize for mobile devices
  useEffect(() => {
    if (isMobile()) {
      // Prevent zoom on double tap
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }, false);

      // Prevent context menu on long press
      document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });

      // Optimize viewport for mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      // Add mobile-specific CSS classes
      document.body.classList.add('mobile-device');
      
      // Set optimal frame rate
      const frameRate = getOptimalFrameRate();
      document.documentElement.style.setProperty('--game-fps', frameRate);
    }

    return () => {
      document.body.classList.remove('mobile-device');
    };
  }, []);

  // Handle touch events with performance optimizations
  const handleTouchStart = useCallback((event) => {
    const now = Date.now();
    if (now - lastTouchTimeRef.current < touchCooldown) {
      return;
    }
    lastTouchTimeRef.current = now;

    touchStartRef.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: now
    };

    if (onTouchStart) {
      onTouchStart(event);
    }
  }, [onTouchStart]);

  const handleTouchEnd = useCallback((event) => {
    if (!touchStartRef.current) return;

    const now = Date.now();
    touchEndRef.current = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
      time: now,
      duration: now - touchStartRef.current.time
    };

    // Determine if this was a tap, swipe, or long press
    const deltaX = Math.abs(touchEndRef.current.x - touchStartRef.current.x);
    const deltaY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);
    const duration = touchEndRef.current.duration;

    if (duration < 200 && deltaX < 10 && deltaY < 10) {
      // Quick tap
      event.preventDefault();
      if (onTouchEnd) {
        onTouchEnd(event, 'tap');
      }
    } else if (duration > 500) {
      // Long press
      if (onTouchEnd) {
        onTouchEnd(event, 'longpress');
      }
    } else if (deltaX > 10 || deltaY > 10) {
      // Swipe
      if (onTouchEnd) {
        onTouchEnd(event, 'swipe');
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onTouchEnd]);

  const handleTouchMove = useCallback((event) => {
    if (onTouchMove) {
      onTouchMove(event);
    }
  }, [onTouchMove]);

  // Add touch event listeners
  useEffect(() => {
    if (isTouchDevice()) {
      const element = document.querySelector('.game-area') || document.body;
      
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);

  return (
    <div className="mobile-optimizations">
      {children}
    </div>
  );
};

/**
 * Touch-friendly button component
 */
export const TouchButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  touchFeedback = true,
  ...props 
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(true);
  }, [disabled]);

  const handleTouchEnd = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(false);
    if (onClick) {
      onClick(e);
    }
  }, [disabled, onClick]);

  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    if (disabled) return;
    setIsPressed(false);
  }, [disabled]);

  return (
    <button
      className={`
        touch-button 
        ${touchFeedback ? 'touch-feedback' : ''} 
        ${isPressed ? 'pressed' : ''} 
        ${disabled ? 'disabled' : ''} 
        ${className}
      `.trim()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Responsive grid component that adapts to screen size
 */
export const ResponsiveGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '1rem',
  className = ''
}) => {
  const [screenSize, setScreenSize] = React.useState('mobile');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const currentColumns = columns[screenSize] || columns.mobile;

  return (
    <div
      className={`responsive-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap: gap
      }}
    >
      {children}
    </div>
  );
};

/**
 * Lazy loading image component
 */
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = null,
  className = '',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div ref={imgRef} className={`lazy-image-container ${className}`}>
      {!isLoaded && placeholder && (
        <div className="lazy-image-placeholder">
          {placeholder}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          {...props}
        />
      )}
    </div>
  );
};

export default MobileOptimizations;
