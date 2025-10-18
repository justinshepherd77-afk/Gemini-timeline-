
import { GoogleGenAI, Modality } from "@google/genai";
import type { Context } from "@netlify/functions";

// This is the single, secure entry point for all Gemini API calls.
// The API key is stored securely in Netlify's environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { task, payload } = await req.json();
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

        if (!response.candidates || response.candidates.length === 0) {
            const feedback = response.promptFeedback;
            const blockReason = feedback?.blockReason;
            throw new Error(`Image generation failed. The request may have been blocked. Reason: ${blockReason || 'Unknown'}`);
        }

        // Add more robust check for empty content to prevent crashes.
        const imageCandidate = response.candidates[0];
        if (!imageCandidate.content || !imageCandidate.content.parts || imageCandidate.content.parts.length === 0) {
          throw new Error("The API returned an image response, but it contained no content parts.");
        }

        const imageData = imageCandidate.content.parts.find(p => p.inlineData)?.inlineData?.data;
        if (!imageData) throw new Error("No image data found in the response.");
        return new Response(JSON.stringify({ imageData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
      
      // All other tasks are handled here. They share a similar structure.
      default:
        response = await ai.models.generateContent({
            model: model,
            contents: payload.prompt,
            config: payload.config,
        });

        if (!response.candidates || response.candidates.length === 0) {
            const feedback = response.promptFeedback;
            const blockReason = feedback?.blockReason;
            const safetyRatings = feedback?.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
            let errorMessage = "No content generated. The request may have been blocked.";
            if (blockReason) errorMessage += ` Reason: ${blockReason}.`;
            if (safetyRatings) errorMessage += ` Safety Ratings: [${safetyRatings}].`;
            throw new Error(errorMessage);
        }

        // Add more robust check for empty content to prevent crashes.
        const candidate = response.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          throw new Error("The API returned a response, but it contained no content.");
        }

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in Gemini function:', error);
    return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
    );
  }
};
