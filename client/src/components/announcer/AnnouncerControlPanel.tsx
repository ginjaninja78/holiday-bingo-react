/**
 * AI Voice Announcer System - Control Panel
 * 
 * UI for configuring and controlling the announcer system:
 * - Enable/disable features
 * - Adjust volumes
 * - Set humor level
 * - Configure nudge delay
 * - Test announcements
 * - View cache stats
 */

import React, { useState } from 'react';
import { useAnnouncer } from '../../hooks/announcer/useAnnouncer';
import { trpc } from '../../lib/trpc';

export function AnnouncerControlPanel() {
  const { settings, updateSettings, isLoading, announceIntro, announceCustom } = useAnnouncer();
  const [testText, setTestText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: cacheStats } = trpc.announcer.getCacheStats.useQuery();
  const { data: health } = trpc.announcer.health.useQuery();
  const clearCacheMutation = trpc.announcer.clearCache.useMutation();

  if (!settings) {
    return <div className="p-4">Loading announcer settings...</div>;
  }

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    await updateSettings({ [key]: value });
  };

  const handleVolumeChange = async (key: 'musicVolume' | 'voiceVolume', value: number) => {
    await updateSettings({ [key]: value });
  };

  const handleHumorLevelChange = async (level: 'professional' | 'sparky' | 'roast') => {
    await updateSettings({ humorLevel: level });
  };

  const handleNudgeDelayChange = async (delay: 0 | 5 | 10 | 15) => {
    await updateSettings({ nudgeDelay: delay });
  };

  const handleTestIntro = () => {
    announceIntro();
  };

  const handleTestCustom = () => {
    if (testText.trim()) {
      announceCustom(testText);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear the audio cache? This will require regenerating all announcements.')) {
      await clearCacheMutation.mutateAsync();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🎙️ AI Voice Announcer</h2>
        <label className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm font-medium text-gray-700">Master Enable</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleToggle('enabled', e.target.checked)}
            className="w-5 h-5"
            disabled={isLoading}
          />
        </label>
      </div>

      {/* System Health */}
      {health && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">System Status</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${health.elevenlabsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              ElevenLabs
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${health.settingsLoaded ? 'bg-green-500' : 'bg-red-500'}`} />
              Settings
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${health.cacheWorking ? 'bg-green-500' : 'bg-red-500'}`} />
              Cache
            </div>
          </div>
        </div>
      )}

      {/* Feature Toggles */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Features</h3>
        <div className="space-y-2">
          {[
            { key: 'gameIntro', label: 'Game Introduction' },
            { key: 'cardAnnouncements', label: 'Card Announcements' },
            { key: 'winnerAnnouncements', label: 'Winner Announcements' },
            { key: 'hostNudging', label: 'Host Nudging' },
            { key: 'backgroundMusic', label: 'Background Music' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={settings[key as keyof typeof settings] as boolean}
                onChange={(e) => handleToggle(key as keyof typeof settings, e.target.checked)}
                disabled={!settings.enabled || isLoading}
                className="w-4 h-4"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Volume Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Volume</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm text-gray-700 mb-1">
              <span>Voice Volume</span>
              <span className="font-mono">{settings.voiceVolume}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.voiceVolume}
              onChange={(e) => handleVolumeChange('voiceVolume', parseInt(e.target.value))}
              disabled={!settings.enabled || isLoading}
              className="w-full"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-sm text-gray-700 mb-1">
              <span>Music Volume</span>
              <span className="font-mono">{settings.musicVolume}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) => handleVolumeChange('musicVolume', parseInt(e.target.value))}
              disabled={!settings.enabled || !settings.backgroundMusic || isLoading}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Humor Level */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Humor Level</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'professional', label: 'Professional', emoji: '🎩' },
            { value: 'sparky', label: 'Sparky', emoji: '✨' },
            { value: 'roast', label: 'Roast', emoji: '🔥' },
          ].map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => handleHumorLevelChange(value as any)}
              disabled={!settings.enabled || isLoading}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.humorLevel === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!settings.enabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Nudge Delay */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Host Nudge Delay</h3>
        <select
          value={settings.nudgeDelay}
          onChange={(e) => handleNudgeDelayChange(parseInt(e.target.value) as any)}
          disabled={!settings.enabled || !settings.hostNudging || isLoading}
          className="w-full p-2 border rounded-lg"
        >
          <option value="0">Disabled</option>
          <option value="5">5 seconds</option>
          <option value="10">10 seconds</option>
          <option value="15">15 seconds</option>
        </select>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Announcements</h3>
        <div className="space-y-2">
          <button
            onClick={handleTestIntro}
            disabled={!settings.enabled || isLoading}
            className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Game Intro
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter custom text..."
              disabled={!settings.enabled || isLoading}
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={handleTestCustom}
              disabled={!settings.enabled || !testText.trim() || isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Settings
        </button>
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            {/* Cache Stats */}
            {cacheStats && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Cache Statistics</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Entries: {cacheStats.totalEntries}</div>
                  <div>Total Size: {(cacheStats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                  <div>Oldest Entry: {cacheStats.oldestEntry ? new Date(cacheStats.oldestEntry).toLocaleDateString() : 'N/A'}</div>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={clearCacheMutation.isLoading}
                  className="mt-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Clear Cache
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
