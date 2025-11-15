
import { GoogleGenAI, Chat } from "@google/genai";
import { PERSONA_PROMPTS } from '../constants';
import { Persona } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Please provide a valid API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

export const startChat = (persona: Persona): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: PERSONA_PROMPTS[persona],
    },
  });
  return chat;
};
