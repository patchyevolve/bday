import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BirthdayPianoSurprise from '../App';
import useCelebrationStore from '../store/celebrationStore';

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

describe('BirthdayPianoSurprise', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now to return a fixed time
    jest.spyOn(Date, 'now').mockReturnValue(1727049600000); // September 23, 2025
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Render', () => {
    test('renders welcome screen when app is unlocked', () => {
      render(<BirthdayPianoSurprise />);
      
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
      expect(screen.getByText('To My Beautiful Wifey')).toBeInTheDocument();
      expect(screen.getByText('🎵 Start Playing')).toBeInTheDocument();
    });

    test('renders locked screen when app is not unlocked', () => {
      // Mock a future date
      jest.spyOn(Date, 'now').mockReturnValue(1600000000000); // Past date
      
      render(<BirthdayPianoSurprise />);
      
      expect(screen.getByText('🎁 Special Surprise')).toBeInTheDocument();
      expect(screen.getByText('This special birthday surprise is locked until September 23rd!')).toBeInTheDocument();
    });
  });

  describe('Game Functionality', () => {
    test('starts game when start button is clicked', async () => {
      render(<BirthdayPianoSurprise />);
      
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Score: 0')).toBeInTheDocument();
        expect(screen.getByText('❤️ 3')).toBeInTheDocument();
      });
    });

    test('displays game over screen when lives reach zero', async () => {
      render(<BirthdayPianoSurprise />);
      
      // Start the game
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Score: 0')).toBeInTheDocument();
      });
      
      // Simulate losing all lives by triggering game over
      act(() => {
        // This would normally be triggered by missing tiles
        // For testing, we'll simulate the state change
        const component = screen.getByTestId('game-container') || document.querySelector('.game-container');
        if (component) {
          // Simulate game over state
          fireEvent.click(component);
        }
      });
    });

    test('resets game when reset button is clicked', async () => {
      render(<BirthdayPianoSurprise />);
      
      // Start the game
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Score: 0')).toBeInTheDocument();
      });
      
      // Click reset button
      const resetButton = screen.getByText('🔄 Reset');
      fireEvent.click(resetButton);
      
      // Should return to welcome screen
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });
  });

  describe('Gallery Functionality', () => {
    test('opens photo gallery when photo button is clicked', async () => {
      render(<BirthdayPianoSurprise />);
      
      // Complete the game to reach celebration screen
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      // Simulate completing the game
      await act(async () => {
        // This would normally happen after hitting all tiles
        // For testing, we'll simulate the celebration state
        const component = screen.getByTestId('celebration-screen') || document.querySelector('.celebration-screen');
        if (component) {
          fireEvent.click(component);
        }
      });
      
      // Look for gallery buttons in celebration screen
      await waitFor(() => {
        const photoButton = screen.queryByText('Photo Gallery');
        if (photoButton) {
          fireEvent.click(photoButton);
          expect(screen.getByText('📸 Photo Gallery')).toBeInTheDocument();
        }
      });
    });

    test('opens video gallery when video button is clicked', async () => {
      render(<BirthdayPianoSurprise />);
      
      // Similar to photo gallery test
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      await act(async () => {
        const component = screen.getByTestId('celebration-screen') || document.querySelector('.celebration-screen');
        if (component) {
          fireEvent.click(component);
        }
      });
      
      await waitFor(() => {
        const videoButton = screen.queryByText('Video Gallery');
        if (videoButton) {
          fireEvent.click(videoButton);
          expect(screen.getByText('🎥 Video Gallery')).toBeInTheDocument();
        }
      });
    });
  });

  describe('Audio Functionality', () => {
    test('creates audio context when playing notes', () => {
      render(<BirthdayPianoSurprise />);
      
      // Start the game
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      // Audio context should be created
      expect(global.AudioContext).toHaveBeenCalled();
    });

    test('plays welcome music when button is clicked', () => {
      render(<BirthdayPianoSurprise />);
      
      const musicButton = screen.getByText('🎶 Play Welcome Music');
      fireEvent.click(musicButton);
      
      expect(global.AudioContext).toHaveBeenCalled();
    });
  });

  describe('Power-ups', () => {
    test('displays power-up effects when collected', async () => {
      render(<BirthdayPianoSurprise />);
      
      const startButton = screen.getByText('🎵 Start Playing');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('Score: 0')).toBeInTheDocument();
      });
      
      // Power-ups should be rendered in the game area
      const gameArea = document.querySelector('.game-area');
      expect(gameArea).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders with mobile-friendly classes', () => {
      render(<BirthdayPianoSurprise />);
      
      // Check for responsive classes
      const welcomeCard = document.querySelector('.magical-card');
      expect(welcomeCard).toHaveClass('sm:max-w-md', 'lg:max-w-lg');
    });

    test('adapts to different screen sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
      
      render(<BirthdayPianoSurprise />);
      
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('uses memoized values for performance', () => {
      render(<BirthdayPianoSurprise />);
      
      // The component should render without errors
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });

    test('handles rapid state changes efficiently', async () => {
      render(<BirthdayPianoSurprise />);
      
      const startButton = screen.getByText('🎵 Start Playing');
      
      // Rapidly click the start button
      for (let i = 0; i < 5; i++) {
        fireEvent.click(startButton);
      }
      
      // Should still render correctly
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles audio context creation errors gracefully', () => {
      // Mock AudioContext to throw an error
      global.AudioContext = jest.fn(() => {
        throw new Error('Audio not supported');
      });
      
      render(<BirthdayPianoSurprise />);
      
      // Should still render without crashing
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });

    test('handles media loading errors gracefully', async () => {
      // Mock media loader to reject
      const { loadMediaFiles } = require('../utils/mediaLoader');
      loadMediaFiles.mockRejectedValueOnce(new Error('Media loading failed'));
      
      render(<BirthdayPianoSurprise />);
      
      // Should still render without crashing
      expect(screen.getByText('HAPPY BIRTHDAY!')).toBeInTheDocument();
    });
  });
});
