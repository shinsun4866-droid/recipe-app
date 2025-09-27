
import React, { useState, useCallback } from 'react';
import { generateRecipes, generateRecipeImage } from './services/geminiService';
import type { Recipe } from './types';
import RecipeCard from './components/RecipeCard';
import LoadingSpinner from './components/LoadingSpinner';

const SMART_STORE_URL = "https://smartstore.naver.com/chipumsong";
const HEADER_IMAGE_URL = "https://raw.githubusercontent.com/shinsun4866-droid/cheepoom/main/choopoom.jpg";

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseAndEnhanceRecipes = useCallback(async (responseText: string): Promise<Recipe[]> => {
    const recipeStrings = responseText.split('---').filter(s => s.trim().includes('요리 이름:'));
    
    const parsedRecipes: Recipe[] = recipeStrings.map(str => {
      const cleanedStr = str.trim();
      const nameMatch = cleanedStr.match(/요리 이름:\s*(.*)/);
      const summaryMatch = cleanedStr.match(/총평:\s*(.*)/);
      const usedIngredientsMatch = cleanedStr.match(/입력한 재료:\s*(.*)/);
      const additionalIngredientsMatch = cleanedStr.match(/추가로 필요한 재료:\s*(.*)/);
      const instructionsMatch = cleanedStr.match(/간단한 레시피:\s*([\s\S]*)/);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : '알 수 없는 요리',
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        usedIngredients: usedIngredientsMatch ? usedIngredientsMatch[1].trim() : '',
        additionalIngredients: additionalIngredientsMatch ? additionalIngredientsMatch[1].trim() : '',
        instructions: instructionsMatch ? instructionsMatch[1].trim() : '',
        imageUrl: null,
        rawText: cleanedStr,
      };
    });

    const imagePromises = parsedRecipes.map(recipe => generateRecipeImage(recipe.name));
    const images = await Promise.all(imagePromises);

    return parsedRecipes.map((recipe, index) => ({
      ...recipe,
      imageUrl: images[index],
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) {
      setError("재료를 먼저 입력해주세요!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const responseText = await generateRecipes(ingredients);
      const enhancedRecipes = await parseAndEnhanceRecipes(responseText);
      setRecipes(enhancedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fullRecipeTextForCopy = recipes.map(r => r.rawText).join("\n\n---\n\n");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <a href={SMART_STORE_URL} target="_blank" rel="noopener noreferrer" title="치품송 구매 페이지로 이동">
            <img 
              src={HEADER_IMAGE_URL} 
              alt="치품송 구매하러 가기" 
              className="w-full rounded-xl shadow-lg mb-2 transition-transform duration-300 hover:scale-105"
            />
          </a>
          <p className="text-sm text-gray-500">▲ 금복상회 치품송 공식 스토어</p>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mt-6">🥗 오늘 뭐 먹지?</h1>
          <h2 className="text-xl text-gray-600 mt-2">🌱 있는 재료로 뚝딱!</h2>
        </header>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <p className="text-gray-700 mb-4">
            금복상회 치품송이 제안하는 제로웨이스트 쿠킹앱입니다. 냉장고에 남은 재료를 입력하면 오늘의 한 끼를 추천, 추가재료와 조리법을 알려 드립니다!
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="예: 치품송, 파프리카, 양파, 계란, 올리브유"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow duration-200"
              aria-label="재료 입력"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-lg flex items-center justify-center"
            >
              {isLoading ? '생성 중...' : '추천 레시피 받기 🍽️'}
            </button>
          </form>
        </div>
        
        {isLoading && <LoadingSpinner />}
        
        {recipes.length > 0 && (
          <section>
             <hr className="my-8 border-gray-300" />
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">✨ 수석 셰프 추천요리 ✨</h3>
            <div>
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} />
              ))}
            </div>
            
            <div className="mt-10">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                <h4 className="font-bold mb-2">📋 아래 상자 안의 텍스트를 복사해서 공유하세요!</h4>
                <pre className="bg-white p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                  <code>{fullRecipeTextForCopy.trim()}</code>
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
