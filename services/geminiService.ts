
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ValidationResult, Quest, QuestType, QuestDifficulty, RolePreferences, AppSettings, UserStats, DiscoveryResult, AppRole } from '../types';

const cleanJson = (text: string | undefined): string => {
  if (!text) return "[]";
  const jsonRegex = /\{[\s\S]*\}|\[[\s\S]*\]/;
  const jsonMatch = text.match(jsonRegex);
  return jsonMatch ? jsonMatch[0] : (text.trim().startsWith('[') ? "[]" : "{}");
};

/**
 * identifyDiscovery: For free-roam lens mode.
 */
export async function identifyDiscovery(base64Image: string): Promise<DiscoveryResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const prompt = `Identify the most interesting object in this photo for a neighborhood discovery game.
    Provide a name, a fun description (2 sentences max), and assign a rarity: Common, Uncommon, Rare, or Legendary.
    Respond in JSON: { "name": string, "description": string, "rarity": string, "xpValue": number }.
    XP should scale with rarity (50 to 500). Use warm, neighborhood-friendly language.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          rarity: { type: Type.STRING },
          xpValue: { type: Type.NUMBER }
        },
        required: ["name", "description", "rarity", "xpValue"]
      }
    }
  });

  return JSON.parse(cleanJson(response.text) || "{}");
}

export async function generateAIQuests(
  prompt: string,
  count: number = 5,
  rolePrefs?: RolePreferences,
  settings?: AppSettings,
  activeRoles: AppRole[] = ['Explorer'],
  preferredType?: QuestType
): Promise<Quest[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const region = settings?.country || 'International';

  const enhancedPrompt = `
    Act as a neighborhood guide and quest designer. 
    Task: Create exactly ${count} scavenger hunt quests.
    Location Context: ${region}.
    User Interests: ${prompt}
    Active User Roles: ${activeRoles.join(', ')}.
    ${preferredType ? `Primary Quest Category: ${preferredType}` : ''}

    Rules for Quest Types:
    - DAILY: Quick 1-step finds.
    - STORY: Multi-chapter (2-3 steps) with a narrative theme.
    - COMMUNITY: Shared interest items (e.g., local art, street signs).
    - COMPETITIVE: Speed-based or specific detail finds.
    - TEAM: Co-op objectives.
    - BOUNTY: Rare, specific, or hard-to-find items.

    Rules for Role Integration:
    - Student: Include educational facts or academic observations in description.
    - Competitor: Focus on specific, challenging details.
    - Explorer: Focus on physical landmarks or nature.
    - Creator: Focus on aesthetic or unique designs.

    Guidelines:
    - Use friendly, everyday language. AVOID sci-fi/military jargon like "uplink", "tactical", "target secured".
    - Use "Find", "Observe", "Share Discovery".
    - Provide a valid imagePrompt for each quest or story step.

    Response format: Return a JSON array of Quest objects matching the app's Type definition.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    contents: enhancedPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: Object.values(QuestType) },
            difficulty: { type: Type.STRING, enum: Object.values(QuestDifficulty) },
            xpReward: { type: Type.NUMBER },
            coinReward: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING, description: "Main object to find" },
            roleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficultyTier: { type: Type.NUMBER, description: "1-5" },
            storyLine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  rewardXP: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["title", "description", "type", "difficulty", "xpReward", "coinReward", "imagePrompt", "roleTags", "difficultyTier"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(cleanJson(response.text) || "[]");
    return data.map((q: any) => {
      let coverImage = '/assets/quests/daily_explorer.png';

      const type = q.type as QuestType;
      const roles = (q.roleTags || []) as AppRole[];

      if (type === QuestType.STORY) coverImage = '/assets/quests/story_adventure.png';
      else if (type === QuestType.COMMUNITY) coverImage = '/assets/quests/community_discovery.png';
      else if (type === QuestType.COMPETITIVE) coverImage = '/assets/quests/competitive_battle.png';
      else if (type === QuestType.TEAM) coverImage = '/assets/quests/team_coop.png';
      else if (type === QuestType.BOUNTY) coverImage = '/assets/quests/bounty_rare.png';
      else if (type === QuestType.DAILY) {
        if (roles.includes('Student')) coverImage = '/assets/quests/daily_student.png';
        else if (roles.includes('Competitor')) coverImage = '/assets/quests/daily_competitor.png';
        else if (roles.includes('Creator')) coverImage = '/assets/quests/daily_creator.png';
        else coverImage = '/assets/quests/daily_explorer.png';
      }

      return {
        ...q,
        id: `ai-${Math.random().toString(36).substr(2, 9)}`,
        coverImage,
        currentStep: q.storyLine ? 1 : undefined,
        steps: q.storyLine ? q.storyLine.length : 1,
        storyLine: q.storyLine?.map((s: any) => ({ ...s, isCompleted: false, isLocked: s.id !== 1 }))
      };
    });
  } catch (e) {
    return [];
  }
}

export async function findNearbyQuestLocations(lat: number, lng: number, topic: string): Promise<Quest[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Act as a neighborhood guide. Suggest 3 interesting things to find related to "${topic}" near ${lat}, ${lng}. 
    Focus on items in parks, common spaces, or residential areas. 
    Use everyday, friendly language. No technical jargon.
    Return a valid JSON array of Quest objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            type: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            coinReward: { type: Type.NUMBER },
            imagePrompt: { type: Type.STRING, description: "Object to find" },
            roleTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficultyTier: { type: Type.NUMBER }
          },
          required: ["title", "description", "type", "difficulty", "xpReward", "coinReward", "imagePrompt", "roleTags"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(cleanJson(response.text) || "[]");
    return data.map((q: any) => {
      let coverImage = '/assets/quests/community_discovery.png';
      if (q.type === QuestType.BOUNTY) coverImage = '/assets/quests/bounty_rare.png';

      return {
        ...q,
        id: `loc-${Math.random().toString(36).substr(2, 9)}`,
        type: q.type as QuestType,
        difficulty: q.difficulty as QuestDifficulty,
        location: { lat, lng },
        coverImage
      };
    });
  } catch (e) {
    return [];
  }
}

export async function validateQuestImage(
  base64Image: string,
  objective: string,
  userStats?: UserStats
): Promise<ValidationResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const prompt = `Check if this photo contains a "${objective}". 
    PERSONA: You are a friendly neighborhood guide. 
    STRICT WORDING: AVOID: "Validation", "Secure", "Agent", "Tactical", "Uplink".
    USE: "Great find!", "I see it!", "Excellent work!", "Discovery recorded".
    
    Respond in JSON: success (bool), confidence (0-1), message (friendly feedback), detectedItems (string array).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER },
          message: { type: Type.STRING },
          detectedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["success", "confidence", "message", "detectedItems"]
      }
    }
  });

  return JSON.parse(cleanJson(response.text) || "{}");
}

export async function chatWithAssistant(message: string, history: any[] = []): Promise<{ text: string; sources?: { uri: string; title: string }[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const contents = history.map(h => ({
    role: h.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    contents,
    config: {
      systemInstruction: "You are the Quest Lens Neighborhood Guide. Be warm, helpful, and professional. Avoid all sci-fi or technical jargon. Use Google Search to provide interesting facts about discoveries.",
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title
    })) || [];

  return {
    text: response.text || "I'm sorry, I'm having trouble responding right now.",
    sources
  };
}

export async function speakResponse(text: string): Promise<ArrayBuffer | undefined> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // TTS can be performed by multimodal 3-flash-preview
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return undefined;

  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
