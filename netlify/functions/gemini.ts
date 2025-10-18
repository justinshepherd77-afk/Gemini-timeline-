import { GoogleGenAI, Modality } from "@google/genai";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // The API key is stored securely in Netlify's environment variables.
  // We check for it inside the handler to ensure the function can load
  // and provide a graceful error if the key is missing.
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set");
    return new Response(
        JSON.stringify({ error: 'Server configuration error: The API_KEY is not set.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
    );
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    
    let errorMessage = 'An internal server error occurred.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      // Provide more specific feedback for common issues
      if (errorMessage.includes('API key not valid')) {
        statusCode = 401; // Unauthorized
        errorMessage = 'Authentication Error: The API key is not valid. Please verify the API_KEY in your server environment variables.';
      } else if (errorMessage.toLowerCase().includes('timed out') || errorMessage.toLowerCase().includes('deadline exceeded')) {
        statusCode = 504; // Gateway Timeout
        errorMessage = 'The request to the AI service timed out. The query may be too complex or the service is under high load. Please try again with a simpler query.';
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};