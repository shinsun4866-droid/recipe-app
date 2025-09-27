
import React from 'react';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold items
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Numbered lists
      if (line.match(/^\d+\.\s/)) {
        return <p key={index} className="mb-1 ml-4" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 my-4">
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={`AI가 생성한 '${recipe.name}' 이미지`} className="w-full h-64 object-cover" />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">이미지 생성 중...</span>
        </div>
      )}
      <div className="p-6">
        {renderFormattedText(recipe.rawText)}
      </div>
    </div>
  );
};

export default RecipeCard;
