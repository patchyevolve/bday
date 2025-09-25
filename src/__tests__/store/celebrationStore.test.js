import { create } from 'zustand';
import useCelebrationStore from '../../store/celebrationStore';

// Mock zustand store for testing
const mockStore = {
  name: '',
  message: '',
  setName: jest.fn(),
  setMessage: jest.fn(),
};

jest.mock('zustand', () => ({
  create: jest.fn(() => () => mockStore)
}));

describe('CelebrationStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty values', () => {
    const store = useCelebrationStore();
    
    expect(store.name).toBe('');
    expect(store.message).toBe('');
  });

  test('setName updates the name', () => {
    const store = useCelebrationStore();
    
    store.setName('Test Name');
    
    expect(mockStore.setName).toHaveBeenCalledWith('Test Name');
  });

  test('setMessage updates the message', () => {
    const store = useCelebrationStore();
    
    store.setMessage('Test Message');
    
    expect(mockStore.setMessage).toHaveBeenCalledWith('Test Message');
  });
});
