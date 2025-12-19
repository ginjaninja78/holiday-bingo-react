/**
 * AI Voice Announcer System - React Hook
 * 
 * Custom hook for interacting with the announcer system:
 * - Settings management
 * - Announcement generation
 * - Audio playback
 * - Session management
 */

import { useState, useEffect, useRef } from 'react';
import { trpc } from '../../lib/trpc';

export interface AnnouncerSettings {
  enabled: boolean;
  gameIntro: boolean;
  cardAnnouncements: boolean;
  hostNudging: boolean;
  winnerAnnouncements: boolean;
  backgroundMusic: boolean;
  musicVolume: number;
  voiceVolume: number;
  humorLevel: 'professional' | 'sparky' | 'roast';
  nudgeDelay: 0 | 5 | 10 | 15;
  voiceId?: string;
}

export interface AnnouncementRequest {
  type: 'intro' | 'card' | 'winner' | 'nudge' | 'custom';
  imageId?: number;
  playerName?: string;
  customText?: string;
  sessionId?: string;
}

export function useAnnouncer(sessionId?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Query settings
  const { data: settings, refetch: refetchSettings } = trpc.announcer.getSettings.useQuery();

  // Mutations
  const updateSettingsMutation = trpc.announcer.updateSettings.useMutation({
    onSuccess: () => {
      refetchSettings();
    },
  });

  const announceMutation = trpc.announcer.announce.useMutation();
  const startSessionMutation = trpc.announcer.startSession.useMutation();
  const endSessionMutation = trpc.announcer.endSession.useMutation();

  /**
   * Update announcer settings
   */
  const updateSettings = async (updates: Partial<AnnouncerSettings>) => {
    return await updateSettingsMutation.mutateAsync(updates);
  };

  /**
   * Generate and play an announcement
   */
  const announce = async (request: AnnouncementRequest) => {
    try {
      const result = await announceMutation.mutateAsync({
        ...request,
        sessionId: request.sessionId || sessionId,
      });

      if (result.success && result.audioUrl) {
        playAudio(result.audioUrl);
        return result;
      }

      return result;
    } catch (error) {
      console.error('Failed to generate announcement:', error);
      return {
        success: false,
        error: 'Failed to generate announcement',
      };
    }
  };

  /**
   * Play audio from URL
   */
  const playAudio = (audioUrl: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    
    // Apply volume from settings
    if (settings) {
      audio.volume = settings.voiceVolume / 100;
    }

    audio.onplay = () => {
      setIsPlaying(true);
      setCurrentAudio(audioUrl);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.error('Failed to play audio');
      setIsPlaying(false);
      setCurrentAudio(null);
      audioRef.current = null;
    };

    audioRef.current = audio;
    audio.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  };

  /**
   * Stop current audio
   */
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  /**
   * Start game session
   */
  const startSession = async (id: string) => {
    return await startSessionMutation.mutateAsync({ sessionId: id });
  };

  /**
   * End game session
   */
  const endSession = async (id: string) => {
    return await endSessionMutation.mutateAsync({ sessionId: id });
  };

  /**
   * Announce game intro
   */
  const announceIntro = () => {
    return announce({ type: 'intro' });
  };

  /**
   * Announce card reveal
   */
  const announceCard = (imageId: number) => {
    return announce({ type: 'card', imageId });
  };

  /**
   * Announce winner
   */
  const announceWinner = (playerName: string) => {
    return announce({ type: 'winner', playerName });
  };

  /**
   * Nudge host
   */
  const nudgeHost = () => {
    return announce({ type: 'nudge' });
  };

  /**
   * Custom announcement
   */
  const announceCustom = (text: string) => {
    return announce({ type: 'custom', customText: text });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    // State
    settings,
    isPlaying,
    currentAudio,
    isLoading: updateSettingsMutation.isLoading || announceMutation.isLoading,

    // Actions
    updateSettings,
    announce,
    playAudio,
    stopAudio,
    startSession,
    endSession,

    // Convenience methods
    announceIntro,
    announceCard,
    announceWinner,
    nudgeHost,
    announceCustom,
  };
}
