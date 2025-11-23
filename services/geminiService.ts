import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from "../types";

// NOTE: In a real Chrome Extension, you typically proxy this request through a background service worker
// or require the user to input their key in the options page.
// Since we cannot ask for input in the code, we assume env availability.

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    // In a real extension, you might fetch this from chrome.storage
    const apiKey = process.env.API_KEY || '';
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
};

export const suggestCategoryForRepo = async (
  repoName: string,
  description: string
): Promise<AISuggestion | null> => {
  const client = getClient();
  if (!client) {
    console.warn("Gemini API Key not found.");
    return null;
  }

  const prompt = `
    Analyze this GitHub repository.
    Name: ${repoName}
    Description: ${description}

    Suggest a single, short category name (max 15 chars) that best fits this repo (e.g., "Frontend", "Database", "DevOps", "AI").
    Also suggest a hex color code that fits the "vibe" of the category or repo language.
    Provide a short reasoning (max 10 words).
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryName: { type: Type.STRING },
            colorHex: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["categoryName", "colorHex", "reasoning"],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AISuggestion;
    }
    return null;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};
