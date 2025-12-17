import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Song } from '../types';

export const generateLyrics = async (apiKey: string, videoTitle: string, userHint?: string): Promise<Song> => {
  if (!apiKey) throw new Error('API Key is required');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an AI Lyrics Curator for "Singlue".
    Task: Extract or generate synchronized lyrics for the song in this video: "${videoTitle}".
    Additional Context/Hint: "${userHint || ''}".

    Requirements:
    1. Identify the Artist and Title.
    2. detailed lyrics with 3 parts for each line:
       - time: Approximate start time in seconds (number).
       - source: Original lyrics text.
       - pron: Pronunciation (Romanized for Korean/Japanese/etc, or IPA/phonetic for others if needed, but simple Romanization is preferred for ease). If English, leave empty or same.
       - trans: Translation to Korean (if source is not Korean). If source is Korean, translate to English.
    
    Return ONLY a JSON object with this structure (no markdown code blocks):
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "lyrics": [
        { "time": 0, "source": "...", "pron": "...", "trans": "..." },
        ...
      ]
    }
    
    Make sure timing is as accurate as possible for specific lines.
  `;

  try {
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
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate lyrics. Please check your API Key and try again.');
  }
};

export const enrichLyrics = async (apiKey: string, currentSong: Song): Promise<Song> => {
  if (!apiKey) throw new Error('API Key is required');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepare a simplified version of lyrics to send to save tokens, or just send the source/time
  const lyricsToEnrich = currentSong.lyrics.map(l => ({ time: l.time, source: l.source }));

  const prompt = `
    You are an AI Lyrics Curator for "Singlue".
    Task: Enrich the provided lyrics with Pronunciation and Translation.

    Song Info:
    Title: "${currentSong.title}"
    Artist: "${currentSong.artist}"

    Input Lyrics (JSON):
    ${JSON.stringify(lyricsToEnrich)}

    Requirements:
    1. Keep the "time" and "source" EXACTLY as provided. Do not add or remove lines.
    2. Fill in "pron": Pronunciation (Romanized for Korean/Japanese/etc). If source is English, leave empty.
    3. Fill in "trans": Translation to Korean (if source is not Korean). If source is Korean, translate to English.
    
    Return ONLY a JSON object with this structure (no markdown code blocks):
    {
      "lyrics": [
         { "time": 0, "source": "...", "pron": "...", "trans": "..." },
         ...
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    // Merge back ensuring safety
    // Ideally existing structure is maintained.
    return {
      ...currentSong,
      lyrics: data.lyrics
    };
  } catch (error) {
    console.error('Gemini Enrichment Error:', error);
    throw new Error('Failed to enrich lyrics. Please check your API Key and try again.');
  }
};
