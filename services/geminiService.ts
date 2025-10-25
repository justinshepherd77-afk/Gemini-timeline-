
import type { Query, SummaryResult, TimelineEvent, PersonSummary, PersonInDepth, FamilyTreeNode, EventInDepth, HistoricalEchoLink } from '../types';

// This helper function centralizes all calls to our secure Netlify function,
// which acts as a proxy to the Gemini API.
async function callNetlifyFunction(task: string, payload: any) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, payload }),
  });

  if (!response.ok) {
    // Try to parse the new structured error message from the server.
    const errorData = await response.json().catch(() => ({ 
      error: { message: 'Failed to parse error response from server.' }
    }));
    // Throw the user-facing message, which is now part of the structured error.
    throw new Error(errorData.error?.message || `Server responded with status ${response.status}`);
  }

  return response.json();
}

// A new robust helper to handle API calls that expect a JSON response.
// This prevents hangs by ensuring any parsing errors are caught and thrown properly.
async function callAndParseJson<T>(task: string, payload: any): Promise<T> {
    const data = await callNetlifyFunction(task, payload);
    try {
        if (typeof data?.text !== 'string' || !data.text.trim()) {
            throw new Error("API returned no content or invalid content type.");
        }
        return JSON.parse(data.text.trim()) as T;
    } catch (error) {
        console.error(`Failed to parse JSON for task "${task}":`, data?.text, error);
        throw new Error("The AI returned data in an unexpected format. Please try your query again.");
    }
}


export async function generateImage(query: Query | { searchTerm: string }): Promise<string> {
  const prompt = 'year' in query 
    ? `You are an AI artist creating a historical image based on this user request: Topic is "${query.topic}" in ${query.city}, ${query.country} during the year ${query.year}. First, silently determine if the city "${query.city}" was an established settlement in that year. - If it was, generate an artistic, photorealistic image representing the topic in that city and era. The style should be reminiscent of photography from that time. Dramatic lighting, detailed. - If the city did not exist, generate an artistic, historically respectful image representing a key scene from the creation myth of the major indigenous people who inhabited the geographical area of modern-day ${query.city}. State the name of the tribe in your internal reasoning. The style should be like a detailed, respectful historical or mythological painting. Based on your choice, your prompt for the image generator is:`
    : `An artistic, photorealistic portrait of ${query.searchTerm}. The style should be appropriate to their historical era. Detailed, high quality.`;
  
  const data = await callNetlifyFunction('generateImage', { prompt });
  if (!data.imageData) throw new Error("No image data found");
  return data.imageData;
}

export async function getSummaries(query: Query): Promise<SummaryResult> {
  const { year, city, country, topic } = query;
  const prompt = `You are a historian and cultural storyteller. The user is asking about "${topic}" in ${city}, ${country} during the year ${year}. First, determine if "${city}" existed as a significant settlement in that year. - IF IT DID EXIST: Your primary summary will be about "${topic}" in ${city}, ${country} during ${year}. - IF IT DID NOT EXIST: Your primary summary will be a retelling of a prominent creation myth from the major indigenous or tribal group that historically inhabited the geographical area of modern-day ${city}, ${country}. State the name of the tribe. The summary should be respectful and engaging. Ignore the original topic. Second, provide a high-level summary for a historically related event or a neighboring group that provides context. For the creation myth, this could be about a neighboring tribe's story. Format your response as a valid JSON object with keys "primary" and "related".`;
  const config = {
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: { primary: { type: "STRING" }, related: { type: "STRING" } }, required: ["primary", "related"] },
  };
  return callAndParseJson<SummaryResult>('getSummaries', { prompt, config });
}

export async function getInDepthReport(query: Query): Promise<EventInDepth> {
  const { year, city, country, topic } = query;
  const prompt = `You are a historical and cultural analyst writing a comprehensive report based on the user's query about "${topic}" in ${city}, ${country} during the year ${year}. First, determine if "${city}" existed as a significant settlement in that year. - IF IT DID EXIST: Write a detailed report on "${topic}" in that location and time. Cover: key figures, socio-political context, opposing views, and immediate consequences. - IF IT DID NOT EXIST: Provide a deeper analysis of the creation myth for the indigenous people of that geographical area. Your report should cover: "keyFigures" (deities/mythological beings), "socioPoliticalContext" (the cultural values and worldview the myth establishes), "opposingViews" (any conflicting forces or dualities within the myth), and "immediateConsequences" (the result of the myth's main events, i.e., the creation of the world, humans, etc.). Respond as a valid JSON object with keys: "keyFigures", "socioPoliticalContext", "opposingViews", "immediateConsequences".`;
  const config = {
      responseMimeType: "application/json",
      responseSchema: { type: "OBJECT", properties: { keyFigures: { type: "STRING" }, socioPoliticalContext: { type: "STRING" }, opposingViews: { type: "STRING" }, immediateConsequences: { type: "STRING" } }, required: ["keyFigures", "socioPoliticalContext", "opposingViews", "immediateConsequences"] },
  };
  return callAndParseJson<EventInDepth>('getInDepthReport', { prompt, config });
}

export async function getTimeline(query: Query): Promise<TimelineEvent[]> {
    const { year, city, country, topic } = query;
    const prompt = `You are a historical and cultural archivist. The user is interested in the year ${year} in the area of modern-day ${city}, ${country} regarding "${topic}". First, determine if "${city}" existed as a significant settlement in ${year}. - IF IT DID EXIST: The main event is "${topic}" in ${city}, ${country} during ${year}. Create a timeline with 3 significant preceding and 3 significant succeeding events related to this. - IF IT DID NOT EXIST: The "main event" is the creation myth of the indigenous people in that geographical area. Create a narrative timeline of the key events *within the creation myth itself*. Structure this with 'preceding' events (what existed before creation), the 'main' event (the act of creation), and 'succeeding' events (the immediate aftermath, like the creation of humans or animals). For each of the total events, provide a short, interesting detail. Return the data as a valid JSON array of objects with keys: "year" (use descriptive terms like "Primordial Time" for the myth), "event", "type", and an optional "interestingDetail".`;
    const config = {
        responseMimeType: "application/json",
        responseSchema: { type: "ARRAY", items: { type: "OBJECT", properties: { year: { type: "STRING" }, event: { type: "STRING" }, type: { type: "STRING", enum: ["preceding", "main", "succeeding"] }, interestingDetail: { type: "STRING" } }, required: ["year", "event", "type"] } },
    };
    return callAndParseJson<TimelineEvent[]>('getTimeline', { prompt, config });
}

export async function classifySearchTerm(term: string): Promise<'person' | 'topic'> {
    const prompt = `Is the following search term more likely a specific person's name or a general topic/event? Respond with only the word "person" or "topic". Term: "${term}"`;
    const data = await callNetlifyFunction('classifySearchTerm', { prompt });
    const result = data.text.trim().toLowerCase();
    return result === 'person' ? 'person' : 'topic';
}

export async function getTopicSummary(term: string): Promise<string> {
    const prompt = `Provide a concise, one-paragraph summary of the historical topic: "${term}". This should serve as an outline for a book report.`;
    const data = await callNetlifyFunction('getTopicSummary', { prompt });
    return data.text;
}

export async function getPersonSummary(term: string): Promise<PersonSummary> {
    const prompt = `You are a biographer creating an outline for a book report on "${term}". Provide a general overview, a summary of immediate family, and list three key life events. Respond as a single JSON object with keys "overview", "family", and "keyEvents".`;
    const config = {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { overview: { type: "STRING" }, family: { type: "STRING" }, keyEvents: { type: "STRING" } }, required: ["overview", "family", "keyEvents"] },
    };
    return callAndParseJson<PersonSummary>('getPersonSummary', { prompt, config });
}

export async function getPersonInDepth(term: string): Promise<PersonInDepth> {
    const prompt = `You are a historical analyst writing a comprehensive report on "${term}". Provide an in-depth report covering these areas: 1. **friendsAndAssociates**: Notable friends and associates. 2. **influencesAndMentors**: Major influences and mentors. 3. **achievements**: Significant achievements over time. 4. **funnyAnecdotes**: Known funny anecdotes. 5. **embarrassingStories**: Known embarrassing stories. 6. **conspiracyTheories**: Any conspiracy theories associated with them. 7. **enemies**: Known enemies or rivals. 8. **notableQuotes**: Famous or interesting quotes attributed to them. 9. **contextualAnalysis**: Expand the picture. How did they influence related events or people? Connect them to the world around them. If information for a field is not available, return an empty string. Respond as a single JSON object.`;
    const config = {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { friendsAndAssociates: { type: "STRING" }, influencesAndMentors: { type: "STRING" }, achievements: { type: "STRING" }, funnyAnecdotes: { type: "STRING" }, embarrassingStories: { type: "STRING" }, conspiracyTheories: { type: "STRING" }, enemies: { type: "STRING" }, notableQuotes: { type: "STRING" }, contextualAnalysis: { type: "STRING" } }, required: ["friendsAndAssociates", "influencesAndMentors", "achievements", "funnyAnecdotes", "embarrassingStories", "conspiracyTheories", "enemies", "notableQuotes", "contextualAnalysis"] },
    };
    return callAndParseJson<PersonInDepth>('getPersonInDepth', { prompt, config });
}

export async function getSixDegreesOfSeparation(term: string): Promise<HistoricalEchoLink[]> {
    const prompt = `You are a historian specializing in causality and long-term consequences, tracing "Echoes Through History". Start with a significant decision, action, or influence by "${term}". Then, create a causal chain of 4 to 6 steps showing how that initial action led to a significant, and perhaps unexpected, future event or outcome many years or decades later. Each step in the chain should be a clear "cause and effect" link to the previous one. For each step, provide a title for the event/action, the year it occurred, and a description of its consequence that leads to the next step. Return this as a valid JSON array of objects. Each object must have keys: "year", "title", and "consequence". The first object in the array should be the initial action by "${term}".`;
    const config = {
        responseMimeType: "application/json",
        responseSchema: { type: "ARRAY", items: { type: "OBJECT", properties: { year: { type: "STRING" }, title: { type: "STRING" }, consequence: { type: "STRING" } }, required: ["year", "title", "consequence"] } },
    };
    return callAndParseJson<HistoricalEchoLink[]>('getSixDegreesOfSeparation', { prompt, config });
}

export async function getFamilyTree(term: string): Promise<FamilyTreeNode> {
    // Defines a schema for a tree up to 2 levels deep to avoid circular dependencies.
    const leafNodeSchema = {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, relation: { type: "STRING" } },
        required: ['name', 'relation']
    };

    const parentNodeSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            relation: { type: "STRING" },
            children: { type: "ARRAY", items: leafNodeSchema }
        },
        required: ['name', 'relation']
    };
    
    const familyTreeNodeSchema = {
        type: "OBJECT",
        properties: {
            name: { type: "STRING" },
            relation: { type: "STRING" },
            children: { type: "ARRAY", items: parentNodeSchema }
        },
        required: ['name', 'relation']
    };
    
    const prompt = `Generate a family tree for "${term}". The structure must be a nested JSON object. The root object represents "${term}" and should have the relation "Self". Each object must have "name", "relation", and an optional "children" array of similar objects. CRITICAL: To prevent a stack overflow error, the nesting depth of the tree MUST be strictly limited. Include only immediate parents, spouse(s), and children. You may include grandparents and grandchildren, but go no further than one generation up from parents and one generation down from children.`;
    const config = { responseMimeType: "application/json", responseSchema: familyTreeNodeSchema };
    return callAndParseJson<FamilyTreeNode>('getFamilyTree', { prompt, config });
}
