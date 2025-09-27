import { GoogleGenerativeAI } from "@google/generativeai";
import { PROMPT_TEMPLATE } from '../constants';

// Vercel 환경 변수를 가져오는 올바른 방법으로 수정합니다.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  // 사용자에게 보여줄 더 친절한 오류 메시지
  throw new Error("API 키가 설정되지 않았습니다. Vercel 대시보드에서 VITE_GEMINI_API_KEY를 설정했는지 확인해주세요.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// 이미지 생성을 위해 보다 적합한 모델을 사용할 수 있습니다. (예: imagen 모델)
const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

export async function generateRecipes(ingredients: string): Promise<string> {
  const fullPrompt = `${PROMPT_TEMPLATE}\n**입력 재료:** ${ingredients}`;
  
  try {
    const result = await textModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("레시피 생성 중 오류가 발생했습니다.");
  }
}

export async function generateRecipeImage(recipeName: string): Promise<string | null> {
  const imagePrompt = `A realistic and delicious photo of '${recipeName}', minimalist style, bright background, professional food photography`;

  try {
    const result = await imageModel.generateContent(imagePrompt);
    const response = await result.response;
    
    // 모델 응답 구조에 따라 이미지 데이터 추출 방식이 달라질 수 있습니다.
    if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
        const imageData = response.candidates[0].content.parts[0].inlineData;
        return `data:${imageData.mimeType};base64,${imageData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null; // 이미지가 없어도 앱이 멈추지 않도록 합니다.
  }
}


