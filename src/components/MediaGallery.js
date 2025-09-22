import React, { useState, useEffect } from 'react';

const MediaGallery = ({ type }) => {
  const [media, setMedia] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch the media files from the server
    // For now, we'll check the public folder
    const fetchMedia = async () => {
      try {
        const response = await fetch(`/api/media/${type}`);
        const data = await response.json();
        setMedia(data);
      } catch (error) {
        console.error('Error fetching media:', error);
        setMedia([]);
      }
    };

    fetchMedia();
  }, [type]);

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setShowGallery(true);
  };

  if (!showGallery) {
    return (
      <div className="w-full h-full">
        <button
          onClick={() => setShowGallery(true)}
          className="w-full h-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
          <span className="text-4xl">
            {type === 'photos' ? '📸' : '🎥'}
          </span>
          <span className="text-white/80 text-sm">
            {media.length === 0
              ? `No ${type} uploaded yet`
              : `View ${type} (${media.length})`}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900/90 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">
            {type === 'photos' ? '📸 Photos' : '🎥 Videos'}
          </h3>
          <button
            onClick={() => {
              setShowGallery(false);
              setSelectedMedia(null);
            }}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {media.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <p className="text-4xl mb-4">
                {type === 'photos' ? '📸' : '🎥'}
              </p>
              <p>No {type} have been uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMediaClick(item)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                  {type === 'photos' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview */}
        {selectedMedia && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
            {type === 'photos' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.name}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-[90vh]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;
