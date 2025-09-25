import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BirthdayPianoSurprise from '../App';

// Mock the store
jest.mock('../store/celebrationStore', () => ({
  __esModule: true,
  default: () => ({
    setName: jest.fn(),
    setMessage: jest.fn(),
  }),
}));

// Mock the media loader
jest.mock('../utils/mediaLoader', () => ({
  loadMediaFiles: jest.fn(() => Promise.resolve({
    pictures: [
      { id: '1', url: 'test1.jpg', alt: 'Test Photo 1' },
      { id: '2', url: 'test2.jpg', alt: 'Test Photo 2' }
    ],
    videos: [
      { id: '1', url: 'test1.mp4', alt: 'Test Video 1' },
      { id: '2', url: 'test2.mp4', alt: 'Test Video 2' }
    ]
  }))
}));

// Mock the KukuMessage component
jest.mock('../components/KukuMessage', () => {
  return function MockKukuMessage({ isVisible, onClose }) {
    return isVisible ? (
      <div data-testid="kuku-message">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

// Mock the FloatingHeartsBackground component
jest.mock('../components/FloatingHeartsBackground', () => {
  return function MockFloatingHeartsBackground() {
    return <div data-testid="floating-hearts">Floating Hearts</div>;
  };
});

// Mock the mobile optimizations components
jest.mock('../components/MobileOptimizations', () => {
  return function MockMobileOptimizations({ children }) {
    return <div data-testid="mobile-optimizations">{children}</div>;
  };
});

// Mock the performance monitor
jest.mock('../components/PerformanceMonitor', () => ({
  __esModule: true,
  default: function MockPerformanceMonitor() {
    return <div data-testid="performance-monitor">Performance Monitor</div>;
  },
  usePerformanceOptimization: () => ({
    qualitySettings: {
      particleCount: 15,
      animationQuality: 'high',
      blurEffects: true,
      maxTilesOnScreen: 4,
      powerUpSpawnRate: 0.1,
      audioQuality: 'high',
      maxConcurrentSounds: 4
    },
    isLowPerformance: false
  }),
  useFrameRateLimit: () => ({
    limitFrameRate: jest.fn(),
    cancelFrameRateLimit: jest.fn()
  })
}));

// Mock performance optimizations
jest.mock('../utils/performanceOptimizations', () => ({
  isMobile: () => false,
  isTouchDevice: () => false,
  getOptimalFrameRate: () => 60,
  getOptimalSpawnRate: () => 800,
  getOptimalTileSpeed: () => 3,
  getAdaptiveQualitySettings: () => ({
    particleCount: 15,
    animationQuality: 'high',
    blurEffects: true,
    maxTilesOnScreen: 4,
    powerUpSpawnRate: 0.1,
    audioQuality: 'high',
    maxConcurrentSounds: 4
  }),
  AudioManager: jest.fn().mockImplementation(() => ({
    addOscillator: jest.fn(),
    removeOscillator: jest.fn(),
    cleanup: jest.fn()
  })),
  throttle: jest.fn((fn) => fn),
  debounce: jest.fn((fn) => fn)
}));

// Mock AudioContext
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
    onended: null
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  })),
  destination: {},
  currentTime: 0,
  state: 'running'
};

global.AudioContext = jest.fn(() => mockAudioContext);
global.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock window methods
Object.defineProperty(window, 'setTimeout', {
  writable: true,
  value: jest.fn((fn) => {
    fn();
    return 1;
  })
});

Object.defineProperty(window, 'clearTimeout', {
  writable: true,
  value: jest.fn()
});

describe('BirthdayPianoSurprise - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now to return a fixed time (September 23, 2025)
    jest.spyOn(Date, 'now').mockReturnValue(1727049600000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders welcome screen when app is unlocked', () => {
    render(<BirthdayPianoSurprise />);
    
    expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    expect(screen.getByText('To My Beautiful Wifey')).toBeInTheDocument();
    expect(screen.getByText('🎵 Start Playing')).toBeInTheDocument();
  });

  test('renders locked screen when app is not unlocked', () => {
    // Mock a past date
    jest.spyOn(Date, 'now').mockReturnValue(1600000000000);
    
    render(<BirthdayPianoSurprise />);
    
    expect(screen.getByText('🎁 Special Surprise')).toBeInTheDocument();
    expect(screen.getByText('This special birthday surprise is locked until September 23rd!')).toBeInTheDocument();
  });

  test('renders mobile optimizations wrapper', () => {
    render(<BirthdayPianoSurprise />);
    
    expect(screen.getByTestId('mobile-optimizations')).toBeInTheDocument();
  });

  test('renders performance monitor in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(<BirthdayPianoSurprise />);
    
    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('does not render performance monitor in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(<BirthdayPianoSurprise />);
    
    expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  test('renders floating hearts background', () => {
    render(<BirthdayPianoSurprise />);
    
    expect(screen.getByTestId('floating-hearts')).toBeInTheDocument();
  });

  test('handles component rendering without errors', () => {
    expect(() => {
      render(<BirthdayPianoSurprise />);
    }).not.toThrow();
  });
});
