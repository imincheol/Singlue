import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Song } from '../types';

// List of models to try in order of preference
const MODELS = [
  'gemini-3-pro-preview', // Newest state-of-the-art model
  'gemini-1.5-flash-002', // Latest stable flash
  'gemini-1.5-flash',     // Standard flash alias
  'gemini-1.5-flash-001', // Older stable flash
  'gemini-1.5-pro',       // Higher capacity, fallback
  'gemini-2.0-flash-exp'  // Experimental
];

export const generateLyrics = async (apiKey: string, videoTitle: string, userLanguage: string, userHint?: string): Promise<Song> => {
  if (!apiKey) throw new Error('API Key is required');

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
    You are an AI Lyrics Curator for "Singlue".
    Task: Extract or generate synchronized lyrics for the song in this video: "${videoTitle}".
    Additional Context/Hint: "${userHint || ''}".

    Requirements:
       - pron: Object with 'ko', 'en', and '${userLanguage}' keys (if different).
       - trans: Object with 'ko', 'en', and '${userLanguage}' keys (if different).
       - country_code: ISO 3166-1 alpha-2 code indicating the country of origin/main language of the song (e.g. "KR" for Korean, "VN" for Vietnamese, "US" for English, "JP" for Japanese).
    
    Structure Example:
    {
      "time": 0, 
      "source": "Xin chào", 
      "pron": { "ko": "씬 짜오", "en": "Xin chao" }, 
      "trans": { "ko": "안녕", "en": "Hello", "vi": "Xin chào" }
    }
    
    Detailed Rules:
    - Always provide "ko" (Korean) and "en" (English) for both "pron" and "trans".
    - If User Language ("${userLanguage}") is not "ko" or "en", also provide it.
    - "pron.ko": Hangul pronunciation.
    - "pron.en": Romanized pronunciation.
    - "trans.ko": Korean translation.
    - "trans.en": English translation.
    - If source is already Korean, "trans.ko" can be empty/same.
    - If source is already English, "trans.en" can be empty/same.
    - **Vietnamese Pronunciation Standard**: When transcribing Vietnamese lyrics to other languages (ko/en), STRICTLY use Northern Vietnamese pronunciation (Hanoi standard).
      - Consonant Rules (Northern): 
        - 'r', 'd', 'gi' -> pronounced as 'z' (Korean 'ㅈ' or 'ㅉ', English 'z')
        - 'v' -> pronounced as 'v' (Korean 'ㅂ/ㅂㅂ', NOT 'y/j' sound)
        - 'ch', 'tr' -> pronounced as 'ch' (Korean 'ㅊ/ㅉ')
      - Examples:
        - "rộng" -> "쫑" (ko), "zong/jong" (en) [Northern], NOT "롱/공/쿰" (Southern)
        - "vẫn" -> "번" (ko), "vun" (en) [Northern], NOT "언/연" (Southern)
        - "dù" -> "주" (ko), "zu" (en) [Northern], NOT "유" (Southern)
        - "Không" -> "콩" (ko), "khong" (en)
        - "Cảm ơn" -> "깜 언" (ko), "cam un" (en)
    
    Return ONLY a JSON object with this structure (no markdown code blocks):
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "country_code": "ISO Code",
      "lyrics": [
        { "time": 0, "source": "...", "pron": "...", "trans": "..." },
        ...
      ]
    }
    
    Make sure timing is as accurate as possible for specific lines.
  `;

  let lastError: any;

  for (const modelName of MODELS) {
    try {
      console.log(`Attempting to generate lyrics with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up potential markdown formatting
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      return {
        id: crypto.randomUUID(), // Generate a temp ID
        ...data
      } as Song;
    } catch (error: any) {
      console.warn(`Failed with model ${modelName}:`, error.message || error);
      lastError = error;
      // Continue to next model
    }
  }

  console.error('All Gemini models failed:', lastError);
  throw new Error('Failed to generate lyrics with all available models. Please check your API Key and try again.');
};

export const enrichLyrics = async (apiKey: string, currentSong: Song, userLanguage: string): Promise<Song> => {
  if (!apiKey) throw new Error('API Key is required');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Prepare a simplified version of lyrics to send to save tokens, or just send the source/time
  const lyricsToEnrich = currentSong.lyrics.map(l => ({ time: l.time, source: l.source }));

  const prompt = `
    You are an AI Lyrics Curator for "Singlue".
    Task: Enrich the provided lyrics with Pronunciation and Translation.

    Song Info:
    Title: "${currentSong.title}"
    Artist: "${currentSong.artist}"

    Goal:
    1. Fill in "pron" object: { "ko": "...", "en": "...", "${userLanguage}": "..." }
    2. Fill in "trans" object: { "ko": "...", "en": "...", "${userLanguage}": "..." }
    3. Determine the song's country of origin as "country_code" (e.g. "KR", "VN").

    Input Lyrics (JSON):
    ${JSON.stringify(lyricsToEnrich)}

    Requirements:
    2. Fill in "pron" object: { "ko": "...", "en": "...", "${userLanguage}": "..." }
    3. Fill in "trans" object: { "ko": "...", "en": "...", "${userLanguage}": "..." }

    Structure Example:
    {
      "time": 0, 
      "source": "Xin chào", 
      "pron": { "ko": "씬 짜오", "en": "Xin chao" }, 
      "trans": { "ko": "안녕", "en": "Hello", "vi": "Xin chào" }
    }

    Rules:
    - Always provide "ko" (Korean) and "en" (English).
    - If User Language ("${userLanguage}") is not "ko" or "en", also provide it.
    - "pron.ko": Hangul pronunciation.
    - "pron.en": Romanized pronunciation.
    - "trans.ko": Korean translation.
    - "trans.en": English translation.
    - Maintain strict JSON format.
    - **Vietnamese Pronunciation Standard**: When transcribing Vietnamese lyrics to other languages (ko/en), STRICTLY use Northern Vietnamese pronunciation (Hanoi standard).
      - Consonant Rules (Northern): 
        - 'r', 'd', 'gi' -> pronounced as 'z' (Korean 'ㅈ' or 'ㅉ', English 'z')
        - 'v' -> pronounced as 'v' (Korean 'ㅂ/ㅂㅂ', NOT 'y/j' sound)
        - 'ch', 'tr' -> pronounced as 'ch' (Korean 'ㅊ/ㅉ')
      - Examples:
        - "rộng" -> "쫑" (ko), "zong/jong" (en) [Northern], NOT "롱/공/쿰" (Southern)
        - "vẫn" -> "번" (ko), "vun" (en) [Northern], NOT "언/연" (Southern)
        - "dù" -> "주" (ko), "zu" (en) [Northern], NOT "유" (Southern)
        - "Không" -> "콩" (ko), "khong" (en)
        - "Cảm ơn" -> "깜 언" (ko), "cam un" (en)
    
    Return ONLY a JSON object with this structure (no markdown code blocks):
    {
      "country_code": "ISO Code",
      "lyrics": [
         { "time": 0, "source": "...", "pron": "...", "trans": "..." },
         ...
      ]
    }
  `;

  let lastError: any;

  for (const modelName of MODELS) {
    try {
      console.log(`Attempting to enrich lyrics with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      // Merge back ensuring safety and preserving existing languages
      const mergedLyrics = currentSong.lyrics.map((existingLine, index) => {
        const newLine = data.lyrics[index];

        // If structure doesn't match or newLine is missing, keep existing and warn
        if (!newLine) {
          console.warn(`Line mismatch at index ${index} during enrichment`);
          return existingLine;
        }

        return {
          ...existingLine,
          // Merge pronunciation keys (e.g. keep 'fr' while adding 'vi')
          pron: {
            ...(typeof existingLine.pron === 'object' ? existingLine.pron : {}),
            ...(typeof newLine.pron === 'object' ? newLine.pron : {})
          },
          // Merge translation keys
          trans: {
            ...(typeof existingLine.trans === 'object' ? existingLine.trans : {}),
            ...(typeof newLine.trans === 'object' ? newLine.trans : {})
          }
        };
      });

      return {
        ...currentSong,
        country_code: data.country_code || currentSong.country_code,
        lyrics: mergedLyrics
      };
    } catch (error: any) {
      console.warn(`Failed with model ${modelName}:`, error.message || error);
      lastError = error;
      // Continue to next model
    }
  }

  console.error('All Gemini models failed enrichment:', lastError);
  throw new Error('Failed to enrich lyrics. Please check your API Key and try again.');
};

export const parseVideoMetadata = async (apiKey: string, videoTitle: string): Promise<{ title: string; artist: string; country_code?: string }> => {
  if (!apiKey) throw new Error('API Key is required');

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
    You are an expert music metadata curator.
    Task: Extract the clean "title", "artist", and "country_code" from the following YouTube video title.
    Video Title: "${videoTitle}"

    Rules:
    - Remove unnecessary tags like [MV], (Official Video), [Lyrics], etc.
    - Separate artist and song title accurately.
    - Determine the "country_code" (ISO 3166-1 alpha-2, e.g., KR, US, VN, JP) based on the language of the title/artist or known origin.
    - Return ONLY a JSON object: { "title": "...", "artist": "...", "country_code": "..." }
  `;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      return {
        title: data.title || videoTitle,
        artist: data.artist || 'Unknown Artist',
        country_code: data.country_code
      };
    } catch (error: any) {
      console.warn(`Metadata parse failed with model ${modelName}:`, error.message);
    }
  }

  // Final fallback
  return { title: videoTitle, artist: 'Unknown Artist' };
};
