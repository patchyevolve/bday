// Utility to load only actual media files that exist
export const loadMediaFiles = async () => {
  try {
    const pictures = [];
    const videos = [];
    
    // Add all known pictures directly - they exist in the folder
    const knownPictures = [
      '1000019084.jpg',
      '1000019108.jpg',
      '1000021998.jpg',
      '1000022003.jpg',
      '1000022083.jpg',
      '1000022097.jpg',
      '1000022105.jpg',
      '1000022107.jpg',
      '1000023294.jpg',
      '1000023324.jpg',
      '1000030195.jpg',
      '1000035734.jpg',
      '1000039421.webp',
      'IMG_20240825_142128.jpg',
      'IMG_20240825_211740.jpg',
      'IMG_20241027_150603.jpg',
      'IMG_20241027_150639.jpg',
      'IMG_20241027_151413.jpg',
      'IMG_20241027_162807.jpg',
      'IMG_20241027_183632.jpg',
      'IMG_20241027_184031.jpg',
      'IMG_20241222_101359.jpg',
      'IMG_20241222_101618.jpg',
      'IMG_20241222_140150.jpg',
      'IMG_20241229_232452.jpg',
      'IMG_20241229_233514.jpg',
      'IMG_20250209_220050.jpg',
      'IMG_20250223_160858.jpg',
      'IMG_20250223_163017.jpg',
      'IMG_20250316_133255.jpg',
      'IMG_20250316_142946-COLLAGE.jpg',
      'IMG_20250316_142950.jpg',
      'IMG_20250316_142959.jpg',
      'IMG_20250316_143006.jpg',
      'IMG_20250316_143019.jpg',
      'IMG_20250316_171434.jpg',
      'IMG_20250316_171440_1.jpg',
      'IMG_20250316_171820.jpg',
      'IMG_20250316_171828.jpg',
      'IMG_8263 (1).JPG'
    ];
    
    // Add pictures directly without HEAD check since files exist
    knownPictures.forEach((filename, i) => {
      pictures.push({
        id: i + 1,
        url: `/media/pictures/${filename}`,
        alt: `Memory ${i + 1}`,
        filename: filename
      });
    });
    
    // Add the video directly since it exists
    const knownVids = [
      'video_20241114_165013.mp4',
      'video_20240923_163515.mp4',
      'video_20241219_215310.mp4'
    ];

    knownVids.forEach((filename, i)=>{
    videos.push({
      id: i + 1,
      url: `/media/videos/${filename}`,
      alt: `Video ${i + 1}`,
      filename: filename
    });
    });
    
    console.log('Media loader returning:', { pictures, videos });
    return { pictures, videos };
  } catch (error) {
    console.error('Error loading media files:', error);
    // Return empty arrays if there's an error
    return { pictures: [], videos: [] };
  }
};

// Function to add new files manually (for future use)
export const addNewMediaFile = (type, filename, alt) => {
  const url = `/media/${type}/${filename}`;
  return {
    id: Date.now() + Math.random(),
    url: url,
    alt: alt || filename,
    filename: filename
  };
};
