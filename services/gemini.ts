
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCodeSnippet = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert web developer. Generate a simple, standalone HTML/CSS/JS code snippet for: "${prompt}". 
      The code should be a single HTML block containing <style> and <script> tags if needed. 
      Do not include markdown formatting like \`\`\`html. Just return the raw code.`,
    });
    return response.text || '<!-- No code generated -->';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "<!-- Error generating code. Please check API Key. -->";
  }
};

export const performOCR = async (base64Image: string): Promise<string> => {
  try {
    // Default to jpeg if not found
    let mimeType = 'image/jpeg';
    let data = base64Image;

    // Detect mime type from data URI scheme (e.g. data:image/png;base64,...)
    if (base64Image.includes(';base64,')) {
        const parts = base64Image.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        data = parts[1];
    } else if (base64Image.includes(',')) {
        // Fallback for other data URI formats
        const parts = base64Image.split(',');
        if (parts[0].includes(':') && parts[0].includes(';')) {
             mimeType = parts[0].split(':')[1].split(';')[0];
        }
        data = parts[1];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: "Extract all text from this image. Return only the text, no conversational filler. Preserve line breaks and basic layout where possible." }
        ]
      }
    });
    return response.text || '';
  } catch (error) {
    console.error("OCR Error:", error);
    return "Error extracting text. Please ensure the image is clear and try again.";
  }
};

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("GenAI Error:", error);
    return "Error processing request.";
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            },
            // No special config needed for basic generation
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};
