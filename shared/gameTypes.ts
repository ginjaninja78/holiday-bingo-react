/**
 * Game-specific types used across client and server
 */

export interface ImageMetadata {
  id: number;
  filename: string;
  path: string;
  description: string;
  category: string;
}

export interface PlayerInfo {
  id: number;
  uuid: string;
  name: string;
  score: number;
  totalBingos: number;
  isActive: boolean;
}

export interface GameSessionInfo {
  id: number;
  sessionCode: string;
  status: "waiting" | "active" | "paused" | "ended";
  currentRound: number;
  hostId: number;
}

export interface BingoCardData {
  id: number;
  playerId: number;
  roundNumber: number;
  imageIds: number[][];
  marked: boolean[][];
}

export interface CalledImageInfo {
  imageId: number;
  calledAt: Date;
  calledOrder: number;
}

export interface BingoClaimInfo {
  id: number;
  playerId: number;
  playerName: string;
  claimType: string;
  verified: boolean;
  claimedAt: Date;
}

export interface WinningPattern {
  type: "line" | "diagonal" | "blackout" | "custom";
  name: string;
  positions?: [number, number][];
}

// WebSocket message types
export type WSMessageType =
  | "player_joined"
  | "player_left"
  | "image_called"
  | "tile_marked"
  | "bingo_claimed"
  | "bingo_verified"
  | "round_started"
  | "round_ended"
  | "game_reset"
  | "scoreboard_updated";

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
  timestamp: number;
}

// AI Voice types
export interface VoiceConfig {
  provider: "elevenlabs" | "hume" | "openai";
  voiceId?: string;
  enabled: boolean;
}

export interface VoiceAnnouncementRequest {
  text: string;
  imageDescription?: string;
}
