import { loadMediaFiles } from '../../utils/mediaLoader';

// Mock fetch for testing
global.fetch = jest.fn();

describe('MediaLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads media files successfully', async () => {
    const mockPictures = [
      { id: '1', url: 'test1.jpg', alt: 'Test Photo 1' },
      { id: '2', url: 'test2.jpg', alt: 'Test Photo 2' }
    ];
    
    const mockVideos = [
      { id: '1', url: 'test1.mp4', alt: 'Test Video 1' },
      { id: '2', url: 'test2.mp4', alt: 'Test Video 2' }
    ];

    // Mock successful fetch responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPictures)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVideos)
      });

    const result = await loadMediaFiles();

    expect(result).toEqual({
      pictures: mockPictures,
      videos: mockVideos
    });
  });

  test('handles fetch errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    const result = await loadMediaFiles();

    expect(result).toEqual({
      pictures: [],
      videos: []
    });
  });

  test('handles malformed JSON responses', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

    const result = await loadMediaFiles();

    expect(result).toEqual({
      pictures: [],
      videos: []
    });
  });
});
