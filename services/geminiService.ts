
import { GoogleGenAI } from "@google/genai";
import { PROMPT_TEMPLATE } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateRecipes(ingredients: string): Promise<string> {
  const fullPrompt = `${PROMPT_TEMPLATE}\n**입력 재료:** ${ingredients}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("레시피 생성 중 오류가 발생했습니다.");
  }
}

export async function generateRecipeImage(recipeName: string): Promise<string | null> {
  const imagePrompt = `A realistic and delicious photo of '${recipeName}', minimalist style, bright background, professional food photography`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    // Don't throw, just return null so the app can continue without an image
    return null;
  }
}
