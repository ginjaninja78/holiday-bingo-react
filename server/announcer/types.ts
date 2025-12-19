/**
 * AI Voice Announcer System - TypeScript Type Definitions
 * 
 * Modular, standalone types for the Holiday Bingo announcer feature.
 * These types are completely independent of core game types.
 */

// ==================== Settings ====================

export interface AnnouncerSettings {
  id?: number;
  userId?: string;
  enabled: boolean;
  gameIntro: boolean;
  cardAnnouncements: boolean;
  hostNudging: boolean;
  winnerAnnouncements: boolean;
  backgroundMusic: boolean;
  musicVolume: number; // 0-100
  voiceVolume: number; // 0-100
  humorLevel: 'professional' | 'sparky' | 'roast';
  nudgeDelay: 5 | 10 | 15 | 0; // 0 = never
  voiceId?: string;
  createdAt?: number;
  updatedAt?: number;
}

// ==================== Humor & Quips ====================

export interface AnnouncerQuip {
  id?: number;
  imageId: number;
  quipText: string;
  quipType: 'observational' | 'ai-selfaware' | 'contextual' | 'winner' | 'nudge';
  humorLevel: 'professional' | 'sparky' | 'roast';
  createdAt?: number;
}

// ==================== Audio Cache ====================

export interface AudioCacheEntry {
  id?: number;
  textHash: string;
  voiceId: string;
  audioFilePath: string;
  fileSize: number;
  durationMs: number;
  createdAt?: number;
  lastUsedAt?: number;
  useCount: number;
}

// ==================== Session Memory ====================

export interface SessionMemoryEvent {
  id?: number;
  sessionId: string;
  eventType: 'game_start' | 'game_end' | 'card_reveal' | 'player_win' | 'host_delay' | 'joke_told';
  eventData?: string; // JSON string
  timestamp?: number;
}

export interface SessionContext {
  sessionId: string;
  gameStartTime: number;
  playerWins: Map<string, number>;
  cardsRevealed: number[];
  jokesTold: string[];
  hostDelayCount: number;
  lastActivityTime: number;
}

// ==================== ElevenLabs API ====================

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export interface ElevenLabsGenerateRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
  };
}

export interface ElevenLabsGenerateResponse {
  audio: Buffer;
  contentType: string;
}

// ==================== Announcer Service ====================

export interface AnnouncementRequest {
  type: 'intro' | 'card' | 'winner' | 'nudge' | 'custom';
  imageId?: number;
  playerName?: string;
  customText?: string;
  sessionId?: string;
}

export interface AnnouncementResponse {
  success: boolean;
  audioPath?: string;
  audioUrl?: string;
  text?: string;
  cached: boolean;
  error?: string;
}

// ==================== Music Player ====================

export interface MusicTrack {
  id: string;
  name: string;
  filePath: string;
  mood: 'ambient' | 'upbeat' | 'celebratory';
  durationMs: number;
}

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTrack?: MusicTrack;
  volume: number;
  queue: MusicTrack[];
}

// ==================== API Responses ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
