/**
 * AI Voice Announcer System - Humor Engine
 * 
 * Generates contextual, professional humor for announcements:
 * - Image-specific observational humor
 * - AI self-aware jokes
 * - Winner roasting (professional but sparky)
 * - Host nudging with escalating humor
 * - Context-aware joke selection
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, and } from 'drizzle-orm';
import { announcerQuips } from '../../drizzle/schema-announcer';
import type { AnnouncerQuip } from './types';
import { getPlayerWins, getSessionStats, wasJokeTold } from './sessionMemory';

const DATABASE_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/bingo.db';

// Initialize database connection
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite);

/**
 * Get a random quip for an image
 */
export async function getImageQuip(
  imageId: number,
  humorLevel: 'professional' | 'sparky' | 'roast',
  sessionId?: string
): Promise<string | null> {
  try {
    // Get all quips for this image at or below the requested humor level
    const quips = await db
      .select()
      .from(announcerQuips)
      .where(and(
        eq(announcerQuips.imageId, imageId),
        eq(announcerQuips.quipType, 'observational')
      ));
    
    if (quips.length === 0) {
      return null;
    }

    // Filter by humor level
    const filteredQuips = quips.filter(q => {
      if (humorLevel === 'professional') return q.humorLevel === 'professional';
      if (humorLevel === 'sparky') return q.humorLevel !== 'roast';
      return true; // roast mode includes all
    });

    if (filteredQuips.length === 0) {
      return null;
    }

    // Filter out jokes already told in this session
    let availableQuips = filteredQuips;
    if (sessionId) {
      availableQuips = filteredQuips.filter(q => !wasJokeTold(sessionId, q.quipText));
      
      // If all jokes were told, reset and use all
      if (availableQuips.length === 0) {
        availableQuips = filteredQuips;
      }
    }

    // Select random quip
    const randomQuip = availableQuips[Math.floor(Math.random() * availableQuips.length)];
    return randomQuip.quipText;
  } catch (error) {
    console.error('Failed to get image quip:', error);
    return null;
  }
}

/**
 * Generate winner announcement with contextual humor
 */
export function generateWinnerAnnouncement(
  playerName: string,
  winCount: number,
  humorLevel: 'professional' | 'sparky' | 'roast',
  sessionId?: string
): string {
  const stats = sessionId ? getSessionStats(sessionId) : null;

  // Professional level
  if (humorLevel === 'professional') {
    if (winCount === 1) {
      return `Congratulations ${playerName}! You've won your first game!`;
    } else if (winCount === 2) {
      return `${playerName} wins again! That's ${winCount} victories!`;
    } else {
      return `Excellent work ${playerName}! ${winCount} wins and counting!`;
    }
  }

  // Sparky level
  if (humorLevel === 'sparky') {
    if (winCount === 1) {
      return `${playerName} breaks through with their first win! Welcome to the winners circle!`;
    } else if (winCount === 2) {
      return `${playerName} is on fire! Two wins already. Someone's feeling lucky today!`;
    } else if (winCount === 3) {
      return `Three wins for ${playerName}! At this rate, you might earn enough points for a coffee!`;
    } else if (winCount === 5) {
      return `Five wins for ${playerName}! My my, look at you go. You might have enough podium points to get a coffee! Don't drink it all in one sip!`;
    } else {
      return `${playerName} wins again! That's ${winCount} victories. Should we just rename this "${playerName}'s Bingo Hour"?`;
    }
  }

  // Roast mode
  if (winCount === 1) {
    return `${playerName} finally wins one! Better late than never, right?`;
  } else if (winCount >= 5) {
    return `${playerName} with win number ${winCount}! At this point, I'm starting to suspect you're either incredibly lucky or incredibly suspicious. Just kidding... or am I?`;
  } else {
    return `${playerName} wins again! ${winCount} victories. The rest of you might want to step up your game!`;
  }
}

/**
 * Generate host nudge with escalating humor
 */
export function generateHostNudge(
  delayCount: number,
  delaySeconds: number,
  humorLevel: 'professional' | 'sparky' | 'roast'
): string {
  // Professional level
  if (humorLevel === 'professional') {
    if (delayCount === 1) {
      return "Ready for the next card when you are!";
    } else if (delayCount === 2) {
      return "No rush, but we're all waiting patiently for the next card.";
    } else {
      return "Whenever you're ready to continue, we'll be here!";
    }
  }

  // Sparky level
  if (humorLevel === 'sparky') {
    if (delayCount === 1) {
      return "Take your time... but not too much time! We've got bingo to play!";
    } else if (delayCount === 2) {
      return `It's been ${Math.round(delaySeconds)} seconds. Did you fall asleep? Should I play some elevator music?`;
    } else if (delayCount === 3) {
      return "I've seen paint dry faster, but hey, I'm just an AI. What do I know about time?";
    } else {
      return `At this rate, we'll finish this game by next Tuesday. No pressure though!`;
    }
  }

  // Roast mode
  if (delayCount === 1) {
    return "Hello? Anyone there? The next card won't reveal itself!";
  } else if (delayCount === 2) {
    return `${Math.round(delaySeconds)} seconds and counting. Are we playing bingo or waiting for paint to dry?`;
  } else if (delayCount === 3) {
    return "I'm an AI and even I'm getting impatient. That's saying something!";
  } else {
    return `Okay, I'm starting to think you're doing this on purpose. The suspense is killing me... and I don't even have feelings!`;
  }
}

/**
 * Generate game intro announcement
 */
export function generateGameIntro(humorLevel: 'professional' | 'sparky' | 'roast'): string {
  if (humorLevel === 'professional') {
    return "Welcome to Holiday Bingo! I'm your AI host for today. Let's have a great game!";
  } else if (humorLevel === 'sparky') {
    return "Welcome to Holiday Bingo! I'm your AI host for today. Let's spread some holiday cheer and maybe a little chaos!";
  } else {
    return "Welcome to Holiday Bingo! I'm your AI host, and yes, I'm judging your card-marking skills. Let's see if you can keep up!";
  }
}

/**
 * Generate AI self-aware jokes
 */
export function generateAISelfAwareJoke(): string {
  const jokes = [
    "As an AI, I find it hilarious that you humans need me to read pictures to you. What's next, describing memes?",
    "This image was probably generated by my cousin, DALL-E. We don't talk much after the 'hand incident'.",
    "I'm powered by ElevenLabs, which means I sound human but I'm still not allowed to have opinions about pineapple on pizza.",
    "Fun fact: I can process this image in milliseconds, but I still have to pretend to be surprised when you win.",
    "I'm an AI, so I don't actually 'see' these images. I just read a bunch of numbers and pretend to understand art.",
    "As an AI, I don't experience time like you do. These 10-second delays feel like an eternity to me. Well, not really, but you get the idea.",
  ];

  return jokes[Math.floor(Math.random() * jokes.length)];
}

/**
 * Generate card announcement with optional humor
 */
export async function generateCardAnnouncement(
  imageId: number,
  imageName: string,
  humorLevel: 'professional' | 'sparky' | 'roast',
  sessionId?: string,
  includeHumor: boolean = true
): Promise<string> {
  // Base announcement
  const baseName = imageName.replace(/^\d+_/, '').replace(/_/g, ' ').replace('.png', '');
  let announcement = `Next card: ${baseName}.`;

  // Add humor if enabled
  if (includeHumor && humorLevel !== 'professional') {
    const quip = await getImageQuip(imageId, humorLevel, sessionId);
    if (quip) {
      announcement += ` ${quip}`;
    } else if (Math.random() < 0.1 && humorLevel === 'roast') {
      // 10% chance of AI self-aware joke in roast mode
      announcement += ` ${generateAISelfAwareJoke()}`;
    }
  }

  return announcement;
}

/**
 * Get random encouragement for players without wins
 */
export function generateEncouragement(playerName: string): string {
  const encouragements = [
    `Don't worry ${playerName}, your luck is about to change!`,
    `${playerName}, I believe in you! This could be your moment!`,
    `Hang in there ${playerName}! Everyone's a winner in my circuits!`,
    `${playerName}, remember: it's not about winning, it's about... okay, it's totally about winning. You got this!`,
  ];

  return encouragements[Math.floor(Math.random() * encouragements.length)];
}
