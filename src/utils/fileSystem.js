import { v4 as uuidv4 } from 'uuid';
import {
  getImageDimensions,
  getVideoDimensions,
  generateVideoThumbnail,
  isValidImageFile,
  isValidVideoFile
} from './mediaUtils';

const BASE_URL = process.env.PUBLIC_URL;

export const scanMediaDirectory = async (type) => {
  try {
    const response = await fetch(`${BASE_URL}/api/scan-media?type=${type}`);
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error scanning media directory:', error);
    return [];
  }
};

export const uploadMedia = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${BASE_URL}/api/upload-media`, {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Failed to upload media');
  }
};

export const deleteMedia = async (filename, type) => {
  try {
    const response = await fetch(`${BASE_URL}/api/delete-media`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, type }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error deleting media:', error);
    throw new Error('Failed to delete media');
  }
};

export const processMediaFile = async (file, type) => {
  const id = uuidv4();
  const url = URL.createObjectURL(file);
  
  let dimensions;
  let thumbnail;
  
  if (type === 'pictures' && isValidImageFile(file)) {
    dimensions = await getImageDimensions(file);
    thumbnail = url;
  } else if (type === 'videos' && isValidVideoFile(file)) {
    dimensions = await getVideoDimensions(file);
    thumbnail = await generateVideoThumbnail(file);
  } else {
    throw new Error('Invalid file type');
  }

  return {
    id,
    url,
    thumbnail,
    name: file.name,
    type,
    size: file.size,
    lastModified: file.lastModified,
    ...dimensions,
  };
};
