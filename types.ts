
export interface Recipe {
  name: string;
  summary: string;
  usedIngredients: string;
  additionalIngredients: string;
  instructions: string;
  imageUrl: string | null;
  rawText: string;
}
