import { GoogleGenAI } from "@google/genai";
import { blobToBase64 } from "./audioService";

// Initialize Gemini Client
// Requires process.env.API_KEY to be set
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const base64Data = await blobToBase64(audioBlob);
    
    // Determine mime type (default to webm or wav based on browser, but generic check helps)
    const mimeType = audioBlob.type || 'audio/webm';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Please transcribe the audio into text exactly as spoken. The language is Russian. Do not add any introductory or concluding phrases, just return the transcription."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw new Error("Failed to transcribe audio.");
  }
};