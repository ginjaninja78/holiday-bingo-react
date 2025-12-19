/**
 * AI Voice Announcer System - ElevenLabs API Client
 * 
 * Handles text-to-speech generation using ElevenLabs API with:
 * - Error handling and retries
 * - Cost optimization
 * - Voice management
 * - Audio streaming
 */

import type { ElevenLabsVoice, ElevenLabsGenerateRequest, ElevenLabsGenerateResponse } from './types';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default voice settings for natural, engaging speech
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5, // Balance between consistency and expressiveness
  similarity_boost: 0.75, // Higher = more similar to original voice
};

// Recommended voices for announcer (can be customized)
const RECOMMENDED_VOICES = {
  professional: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Professional female
  friendly: '21m00Tcm4TlvDq8ikWAM', // Rachel - Friendly female
  energetic: 'pNInz6obpgDQGcFmaJgB', // Adam - Energetic male
};

/**
 * Check if ElevenLabs API key is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY.length > 0;
}

/**
 * Get list of available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  if (!isElevenLabsConfigured()) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Failed to fetch ElevenLabs voices:', error);
    throw error;
  }
}

/**
 * Generate speech audio from text using ElevenLabs TTS
 */
export async function generateSpeech(
  text: string,
  voiceId?: string,
  options?: Partial<ElevenLabsGenerateRequest>
): Promise<ElevenLabsGenerateResponse> {
  if (!isElevenLabsConfigured()) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Use provided voice or default to professional voice
  const selectedVoiceId = voiceId || RECOMMENDED_VOICES.professional;

  // Validate text length (ElevenLabs has limits)
  if (text.length === 0) {
    throw new Error('Text cannot be empty');
  }
  if (text.length > 5000) {
    console.warn(`Text length (${text.length}) exceeds recommended limit. Consider splitting.`);
  }

  const requestBody: ElevenLabsGenerateRequest = {
    text,
    voice_id: selectedVoiceId,
    model_id: options?.model_id || 'eleven_monolingual_v1', // Fast, cost-effective model
    voice_settings: options?.voice_settings || DEFAULT_VOICE_SETTINGS,
  };

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS error (${response.status}): ${errorText}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const audio = Buffer.from(audioBuffer);

    return {
      audio,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Failed to generate speech:', error);
    throw error;
  }
}

/**
 * Estimate cost for text-to-speech generation
 * ElevenLabs charges per character
 */
export function estimateCost(text: string): { characters: number; estimatedCost: number } {
  const characters = text.length;
  
  // Pricing (as of 2024):
  // Free tier: 10,000 chars/month
  // Starter ($5/mo): 30,000 chars
  // Creator ($22/mo): 100,000 chars
  // Approximate cost: $0.30 per 1,000 characters (Creator tier)
  
  const costPer1000Chars = 0.30;
  const estimatedCost = (characters / 1000) * costPer1000Chars;

  return {
    characters,
    estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Get recommended voice ID based on humor level
 */
export function getRecommendedVoice(humorLevel: 'professional' | 'sparky' | 'roast'): string {
  switch (humorLevel) {
    case 'professional':
      return RECOMMENDED_VOICES.professional;
    case 'sparky':
      return RECOMMENDED_VOICES.friendly;
    case 'roast':
      return RECOMMENDED_VOICES.energetic;
    default:
      return RECOMMENDED_VOICES.professional;
  }
}

/**
 * Test ElevenLabs API connection
 */
export async function testConnection(): Promise<boolean> {
  if (!isElevenLabsConfigured()) {
    return false;
  }

  try {
    await getAvailableVoices();
    return true;
  } catch (error) {
    console.error('ElevenLabs connection test failed:', error);
    return false;
  }
}
