const fs = require('fs');
const path = require('path');

// API endpoint to get media files
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const mediaPath = path.join(process.cwd(), 'public', 'media');
    const picturesPath = path.join(mediaPath, 'pictures');
    const videosPath = path.join(mediaPath, 'videos');

    // Supported file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

    // Get pictures
    let pictures = [];
    if (fs.existsSync(picturesPath)) {
      const pictureFiles = fs.readdirSync(picturesPath);
      pictures = pictureFiles
        .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()))
        .map((file, index) => ({
          id: index + 1,
          url: `/media/pictures/${file}`,
          alt: `Memory ${index + 1}`,
          filename: file
        }));
    }

    // Get videos
    let videos = [];
    if (fs.existsSync(videosPath)) {
      const videoFiles = fs.readdirSync(videosPath);
      videos = videoFiles
        .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
        .map((file, index) => ({
          id: index + 1,
          url: `/media/videos/${file}`,
          alt: `Video ${index + 1}`,
          filename: file
        }));
    }

    res.status(200).json({ pictures, videos });
  } catch (error) {
    console.error('Error reading media files:', error);
    res.status(500).json({ message: 'Error reading media files' });
  }
}
