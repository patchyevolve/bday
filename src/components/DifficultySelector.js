import React from 'react';
import { DIFFICULTY_LEVELS } from '../hooks/useGameState';

const DifficultySelector = ({ currentDifficulty, onSelect, isMobile }) => {
  if (isMobile) return null; // Don't show on mobile

  return (
    <div className="difficulty-selector">
      <h3 className="text-lg font-semibold mb-2">Select Difficulty:</h3>
      <div className="flex gap-2">
        {Object.values(DIFFICULTY_LEVELS).map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentDifficulty.id === level.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            aria-label={`Select ${level.name} difficulty`}
            aria-pressed={currentDifficulty.id === level.id}
          >
            {level.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
