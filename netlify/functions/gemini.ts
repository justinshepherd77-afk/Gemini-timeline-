import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Handler } from "@netlify/functions";

// This is the single, secure entry point for all Gemini API calls.
// The API key is stored securely in Netlify's environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { task, payload } = JSON.parse(event.body || '{}');
    let response;
    
    // The model is chosen based on the task for performance and cost.
    const model = (task === 'getInDepthReport' || task === 'getPersonInDepth' || task === 'getSixDegreesOfSeparation') 
        ? 'gemini-2.5-pro' 
        : 'gemini-2.5-flash';

    switch (task) {
      case 'generateImage':
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: { responseModalities: [Modality.IMAGE] },
        });
        // The image data is large, so we extract only what's needed.
        const imageData = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data;
        if (!imageData) throw new Error("No image data found");
        return { statusCode: 200, body: JSON.stringify({ imageData }) };
      
      // All other tasks are handled here. They share a similar structure.
      default:
        response = await ai.models.generateContent({
            model: model,
            contents: payload.prompt,
            config: payload.config,
        });
        return { statusCode: 200, body: JSON.stringify({ text: response.text }) };
    }
  } catch (error) {
    console.error('Error in Gemini function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }),
    };
  }
};

export { handler };
