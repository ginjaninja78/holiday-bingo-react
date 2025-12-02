/**
 * Modular AI Voice Integration
 * Supports ElevenLabs, Hume, and OpenAI voice APIs
 * Server-side only - never expose to client
 */

import type { VoiceConfig, VoiceAnnouncementRequest } from "../shared/gameTypes";

interface VoiceProvider {
  synthesize(text: string): Promise<Buffer>;
  transcribe?(audioBuffer: Buffer): Promise<string>;
}

/**
 * ElevenLabs Voice Provider
 */
class ElevenLabsProvider implements VoiceProvider {
  private apiKey: string;
  private voiceId: string;

  constructor(apiKey: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM") {
    this.apiKey = apiKey;
    this.voiceId = voiceId;
  }

  async synthesize(text: string): Promise<Buffer> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

/**
 * Hume AI Voice Provider
 */
class HumeProvider implements VoiceProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string): Promise<Buffer> {
    // Hume API implementation
    // Note: This is a placeholder - actual Hume API may differ
    const response = await fetch("https://api.hume.ai/v0/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hume-Api-Key": this.apiKey,
      },
      body: JSON.stringify({
        text,
        voice: "default",
      }),
    });

    if (!response.ok) {
      throw new Error(`Hume API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

/**
 * OpenAI Voice Provider (using TTS API)
 */
class OpenAIProvider implements VoiceProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string): Promise<Buffer> {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy",
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([audioBuffer as any], { type: "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI Whisper API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
  }
}

/**
 * Voice Manager - Factory for voice providers
 */
export class VoiceManager {
  private provider: VoiceProvider | null = null;
  private config: VoiceConfig;

  constructor(config: VoiceConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    if (!this.config.enabled) {
      return;
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn(`[VoiceManager] No API key found for ${this.config.provider}`);
      return;
    }

    switch (this.config.provider) {
      case "elevenlabs":
        this.provider = new ElevenLabsProvider(
          apiKey,
          this.config.voiceId
        );
        break;
      case "hume":
        this.provider = new HumeProvider(apiKey);
        break;
      case "openai":
        this.provider = new OpenAIProvider(apiKey);
        break;
      default:
        console.warn(`[VoiceManager] Unknown provider: ${this.config.provider}`);
    }
  }

  private getApiKey(): string | undefined {
    switch (this.config.provider) {
      case "elevenlabs":
        return process.env.ELEVENLABS_API_KEY;
      case "hume":
        return process.env.HUME_API_KEY;
      case "openai":
        return process.env.OPENAI_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * Generate voice announcement for called image
   */
  async announceImage(request: VoiceAnnouncementRequest): Promise<Buffer | null> {
    if (!this.provider || !this.config.enabled) {
      return null;
    }

    try {
      const text = this.generateAnnouncementText(request);
      return await this.provider.synthesize(text);
    } catch (error) {
      console.error("[VoiceManager] Failed to generate announcement:", error);
      return null;
    }
  }

  /**
   * Transcribe host voice input (for interactive AI)
   */
  async transcribeHostAudio(audioBuffer: Buffer): Promise<string | null> {
    if (!this.provider || !this.config.enabled) {
      return null;
    }

    if ("transcribe" in this.provider && this.provider.transcribe) {
      try {
        return await this.provider.transcribe(audioBuffer);
      } catch (error) {
        console.error("[VoiceManager] Failed to transcribe audio:", error);
        return null;
      }
    }

    return null;
  }

  /**
   * Generate natural announcement text with personality
   */
  private generateAnnouncementText(request: VoiceAnnouncementRequest): string {
    const phrases = [
      `Next up, we have ${request.imageDescription}`,
      `Calling ${request.imageDescription}`,
      `Look for ${request.imageDescription}`,
      `We've got ${request.imageDescription}`,
      `${request.imageDescription} is on the board`,
    ];

    // Add some personality variations
    const personality = [
      "Alright folks, ",
      "Here we go, ",
      "And now, ",
      "",
      "Listen up, ",
    ];

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const randomPersonality =
      personality[Math.floor(Math.random() * personality.length)];

    return randomPersonality + randomPhrase;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeProvider();
  }

  /**
   * Check if voice is enabled and ready
   */
  isReady(): boolean {
    return this.config.enabled && this.provider !== null;
  }
}

/**
 * Global voice manager instance
 */
let globalVoiceManager: VoiceManager | null = null;

export function getVoiceManager(): VoiceManager {
  if (!globalVoiceManager) {
    // Default configuration - can be updated via API
    globalVoiceManager = new VoiceManager({
      provider: "elevenlabs",
      enabled: false, // Disabled by default until API key is provided
    });
  }
  return globalVoiceManager;
}

export function initializeVoiceManager(config: VoiceConfig) {
  globalVoiceManager = new VoiceManager(config);
  return globalVoiceManager;
}
