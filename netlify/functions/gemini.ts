
import { GoogleGenAI, Modality } from "@google/genai";
import type { Context } from "@netlify/functions";

// Helper to create a structured JSON error response
const createErrorResponse = (message: string, statusCode: number, details?: any) => {
  console.error(`[Function Error] Status: ${statusCode}, Message: ${message}`, details ? `Details: ${JSON.stringify(details)}` : '');
  return new Response(
    JSON.stringify({
      error: { message, details }
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export default async (req: Request, context: Context) => {
  console.log(`[Function Invoked] Method: ${req.method}`);
  
  if (req.method !== 'POST') {
    return createErrorResponse('Method Not Allowed', 405);
  }

  if (!process.env.API_KEY) {
    return createErrorResponse('Server configuration error: API_KEY is not set.', 500);
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY || process.env.API_KEY });

  try {
    const { task, payload } = await req.json();
    console.log(`[Task Received] Task: "${task}"`);

    if (!task || !payload) {
      return createErrorResponse('Invalid request body: "task" and "payload" are required.', 400);
    }
    
    let response;
    
    const model = (task === 'getInDepthReport' || task === 'getPersonInDepth' || task === 'getSixDegreesOfSeparation') 
        ? 'gemini-2.5-pro' 
        : 'gemini-2.5-flash';

    console.log(`[Model Selected] Using model: "${model}" for task: "${task}"`);

    switch (task) {
      case 'generateImage':
        console.log('[Image Gen] Calling Gemini for image generation.');
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: payload.prompt }] },
          config: { responseModalities: [Modality.IMAGE] },
        });

        if (!response.candidates || response.candidates.length === 0) {
            const feedback = response.promptFeedback;
            const blockReason = feedback?.blockReason;
            const safetyRatings = feedback?.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
            let userMessage = "Image generation failed. Your request may have been blocked due to safety filters.";
            return createErrorResponse(userMessage, 400, { blockReason, safetyRatings });
        }
        
        const imagePart = response.candidates[0]?.content?.parts?.find(p => p.inlineData);
        const imageData = imagePart?.inlineData?.data;

        if (!imageData) {
            return createErrorResponse("Image generation failed: No image data was found in the AI's response.", 500);
        }
        
        console.log('[Image Gen] Successfully received image data.');
        return new Response(JSON.stringify({ imageData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
      
      default:
        console.log('[Text Gen] Calling Gemini for text generation.');
        response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: payload.prompt }] }],
            config: payload.config,
        });

        if (!response.candidates || response.candidates.length === 0) {
            const feedback = response.promptFeedback;
            const blockReason = feedback?.blockReason;
            const safetyRatings = feedback?.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ');
            let userMessage = "The request was blocked. Please try modifying your query.";
            return createErrorResponse(userMessage, 400, { blockReason, safetyRatings });
        }

        const textContent = response.text;
        console.log('[Text Gen] Successfully received text content.');

        return new Response(JSON.stringify({ text: textContent }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('[Unhandled Error] Raw error object:', error);
    
    let errorMessage = 'An internal server error occurred.';
    let statusCode = 500;
    let errorDetails: any = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error: String(error) };

    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        statusCode = 401;
        errorMessage = 'Authentication Error: The provided API key is not valid.';
      } else if (error.message.toLowerCase().includes('deadline exceeded')) {
        statusCode = 504;
        errorMessage = 'The request to the AI service timed out. Please try again with a simpler query.';
      } else if (error instanceof SyntaxError) {
        statusCode = 400;
        errorMessage = 'Invalid request format. Could not parse JSON body.';
      }
    }

    return createErrorResponse(errorMessage, statusCode, errorDetails);
  }
};
