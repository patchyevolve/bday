// Function to get file dimensions
export const getImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const getVideoDimensions = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    video.src = URL.createObjectURL(file);
  });
};

// Function to generate video thumbnail
export const generateVideoThumbnail = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
    };

    video.src = URL.createObjectURL(file);
    video.currentTime = 1; // Capture frame at 1 second
  });
};

// Function to validate file types
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type);
};

export const isValidVideoFile = (file) => {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  return validTypes.includes(file.type);
};

// Function to organize media in a grid
export const organizeMediaGrid = (items) => {
  return items.sort((a, b) => {
    // Sort by aspect ratio to create a more pleasing grid
    const ratioA = a.width / a.height;
    const ratioB = b.width / b.height;
    return Math.abs(1 - ratioA) - Math.abs(1 - ratioB);
  });
};
