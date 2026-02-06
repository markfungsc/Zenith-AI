
import { GoogleGenAI, Type } from "@google/genai";
import { Workout, NutritionInfo, AIAnalysis, PlannerRoutine, UserProfile } from "../types";

// Initialize AI with the environment API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeWorkouts = async (workouts: Workout[], profile: UserProfile): Promise<AIAnalysis> => {
  const workoutData = JSON.stringify(workouts);
  const profileData = JSON.stringify(profile);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded for complex reasoning
      contents: [{
        parts: [{
          text: `Analyze these workouts for a user with this profile: ${profileData}. Workouts: ${workoutData}. Identify muscle imbalances and provide highly personalized recommendations based on their goals and stats.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            muscleImbalances: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            progressScore: { type: Type.NUMBER, description: "Score from 0 to 100" }
          },
          required: ["muscleImbalances", "recommendations", "progressScore"]
        }
      }
    });

    if (!response.text) throw new Error("No response text from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Analysis API Error:", error);
    return {
      muscleImbalances: ["Log more data for deep analysis"],
      recommendations: ["Keep consistent with your training schedule"],
      progressScore: 50
    };
  }
};

export const generatePlan = async (profile: UserProfile, frequency: number): Promise<PlannerRoutine[]> => {
  const profileData = JSON.stringify(profile);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded for high-quality complex text generation
      contents: [{
        parts: [{
          text: `Create a ${frequency} day per week fitness plan for this user: ${profileData}. 
          IMPORTANT: Based on their 1Rep Max (1RM) and 8Rep Max (8RM) values, calculate and suggest specific weights and rep ranges for each exercise. 
          If a lift isn't listed in their PRs, estimate a safe starting weight based on their body weight (${profile.weight}kg).
          Provide the output in JSON format.`
        }]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.STRING },
                    reps: { type: Type.STRING },
                    target: { type: Type.STRING },
                    suggestedWeight: { type: Type.STRING, description: "Calculated weight in kg based on user PRs" },
                    suggestedReps: { type: Type.STRING, description: "Target rep range" },
                    notes: { type: Type.STRING, description: "Why this weight/rep was chosen" }
                  },
                  required: ["name", "sets", "reps", "target", "suggestedWeight"]
                }
              }
            },
            required: ["day", "exercises"]
          }
        }
      }
    });

    if (!response.text) throw new Error("No response text from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Planner API Error:", error);
    // Fallback if API fails to prevent white screen
    return [];
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<NutritionInfo> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash is fine for image captioning/extraction
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Identify the food and estimate the nutritional macros (protein, carbs, fat, calories)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER }
          },
          required: ["foodName", "calories", "protein", "carbs", "fat"]
        }
      }
    });

    if (!response.text) throw new Error("No response text from AI");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Food Analysis API Error:", error);
    throw error;
  }
};
