import { useEffect, useCallback, useRef } from 'react';

export const useAccessibility = () => {
  const focusableElementsRef = useRef([]);
  const currentFocusIndexRef = useRef(0);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event) => {
    const { key, target } = event;
    
    switch (key) {
      case 'Tab':
        // Let browser handle default tab navigation
        break;
        
      case 'Enter':
      case ' ':
        // Activate focused element
        if (target && typeof target.click === 'function') {
          event.preventDefault();
          target.click();
        }
        break;
        
      case 'Escape':
        // Close modals or return to previous screen
        const escapeEvent = new CustomEvent('accessibility-escape');
        window.dispatchEvent(escapeEvent);
        break;
        
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Handle arrow key navigation for game tiles
        if (target.closest('.game-area')) {
          event.preventDefault();
          handleArrowNavigation(key, target);
        }
        break;
        
      default:
        break;
    }
  }, []);

  // Handle arrow key navigation in game area
  const handleArrowNavigation = useCallback((key, currentTarget) => {
    const gameTiles = document.querySelectorAll('.game-tile');
    if (gameTiles.length === 0) return;

    const currentIndex = Array.from(gameTiles).indexOf(currentTarget);
    let newIndex = currentIndex;

    switch (key) {
      case 'ArrowLeft':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        newIndex = Math.min(gameTiles.length - 1, currentIndex + 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - 4); // Assuming 4 columns
        break;
      case 'ArrowDown':
        newIndex = Math.min(gameTiles.length - 1, currentIndex + 4);
        break;
    }

    if (newIndex !== currentIndex && gameTiles[newIndex]) {
      gameTiles[newIndex].focus();
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Focus management
  const trapFocus = useCallback((container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Skip to content functionality
  const createSkipLink = useCallback(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    return skipLink;
  }, []);

  return {
    announceToScreenReader,
    trapFocus,
    createSkipLink,
    handleKeyDown
  };
};
