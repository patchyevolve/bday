import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

const FloatingHeartsBackground = ({ 
  heartCount = 12, 
  opacity = 0.2, 
  animationDuration = 8,
  pulseDuration = 10,
  size = 'w-5 h-5',
  color = 'text-pink-200'
}) => {
  // Generate stable heart positions that don't change on re-render
  const heartPositions = useMemo(() => 
    [...Array(heartCount)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * animationDuration,
      pulseDelay: Math.random() * pulseDuration
    })), [heartCount, animationDuration, pulseDuration]
  );

  return (
    <>
      {heartPositions.map((heart, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          data-testid="heart-container"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            opacity: opacity,
            animation: `heartFloat ${animationDuration}s ease-in-out infinite`,
            animationDelay: `${heart.animationDelay}s`
          }}
        >
          <Heart 
            className={`${size} ${color} floating-heart`}
            data-testid="floating-heart"
            style={{
              animation: `heartPulse ${pulseDuration}s ease-in-out infinite`,
              animationDelay: `${heart.pulseDelay}s`
            }}
          />
        </div>
      ))}
    </>
  );
};

export default FloatingHeartsBackground;
