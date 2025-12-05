import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_CHAT, SYSTEM_INSTRUCTION_VISION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChatResponse = async (history: {role: string, parts: string}[], message: string) => {
  try {
    const model = 'gemini-2.5-flash';
    // Convert history to format expected by @google/genai if using chat session, 
    // but for simple stateless request (simpler for this demo structure), we'll just send prompt.
    // However, to maintain context, let's use the chat feature.
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_CHAT,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      }))
    });

    const result = await chat.sendMessage({ message: message });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const analyzePlantImage = async (base64Image: string) => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this plant image for diseases. Provide diagnosis and remedies in Bengali and English."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_VISION,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};