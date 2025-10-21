import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for image processing
});

export interface Ingredient {
  name: string;
  confidence?: number;
}

export interface Recipe {
  title: string;
  usedIngredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
}

export interface AnalyzeResponse {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

export const analyzeImages = async (files: File[]): Promise<AnalyzeResponse> => {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`image_${index}`, file);
  });

  try {
    const response = await api.post<AnalyzeResponse>('/api/analyze/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze images');
    }
    throw new Error('An unexpected error occurred');
  }
};

export default api;

