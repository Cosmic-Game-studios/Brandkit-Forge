/**
 * Prompt Preview Utilities
 * 
 * Provides functions for intelligently formatting chip arrays into
 * human-readable prompt strings, grouped by category.
 * 
 * @module promptPreview
 */

import { STYLE_CHIPS, MOOD_CHIPS } from './createConstants';
import type { StyleCategory, MoodCategory } from './createConstants';

/**
 * Maps a style chip to its category
 * 
 * @param chip - The chip name to categorize
 * @returns The category of the chip, or null if not found
 * @internal
 */
function getStyleChipCategory(chip: string): StyleCategory | null {
  for (const [category, chips] of Object.entries(STYLE_CHIPS)) {
    if (chips.includes(chip as any)) {
      return category as StyleCategory;
    }
  }
  return null;
}

/**
 * Maps a mood chip to its category
 * 
 * @param chip - The chip name to categorize
 * @returns The category of the chip, or null if not found
 * @internal
 */
function getMoodChipCategory(chip: string): MoodCategory | null {
  for (const [category, chips] of Object.entries(MOOD_CHIPS)) {
    if (chips.includes(chip as any)) {
      return category as MoodCategory;
    }
  }
  return null;
}

/**
 * Formats an array of style chips into a structured prompt string.
 * Groups chips by category (look, surface, lighting, mood, form) for better readability.
 * 
 * @param chips - Array of style chip names
 * @returns Formatted prompt string with categories, or empty string if no chips
 * 
 * @example
 * ```ts
 * formatStyleChipsToPrompt(['minimal', 'clean planes', 'smooth gradients'])
 * // Returns: "Look: minimal, clean planes, smooth gradients"
 * ```
 */
export function formatStyleChipsToPrompt(chips: string[]): string {
  if (chips.length === 0) return '';

  // Group chips by category
  const grouped: Partial<Record<StyleCategory, string[]>> = {};
  const uncategorized: string[] = [];

  for (const chip of chips) {
    const category = getStyleChipCategory(chip);
    if (category) {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category]!.push(chip);
    } else {
      uncategorized.push(chip);
    }
  }

  // Build formatted string with category labels
  const parts: string[] = [];
  const categoryOrder: StyleCategory[] = ['look', 'surface', 'lighting', 'mood', 'form'];
  
  for (const category of categoryOrder) {
    if (grouped[category] && grouped[category]!.length > 0) {
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
      parts.push(`${categoryLabel}: ${grouped[category]!.join(', ')}`);
    }
  }

  // Append uncategorized chips
  if (uncategorized.length > 0) {
    parts.push(uncategorized.join(', '));
  }

  return parts.join('. ');
}

/**
 * Formats an array of mood chips into a structured prompt string.
 * Groups chips by category for better readability.
 * 
 * @param chips - Array of mood chip names
 * @returns Formatted prompt string with categories, or empty string if no chips
 * 
 * @example
 * ```ts
 * formatMoodChipsToPrompt(['vibrant', 'energetic', 'bold'])
 * // Returns: "Mood: vibrant, energetic, bold"
 * ```
 */
export function formatMoodChipsToPrompt(chips: string[]): string {
  if (chips.length === 0) return '';

  // Group chips by category
  const grouped: Partial<Record<MoodCategory, string[]>> = {};
  const uncategorized: string[] = [];

  for (const chip of chips) {
    const category = getMoodChipCategory(chip);
    if (category) {
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category]!.push(chip);
    } else {
      uncategorized.push(chip);
    }
  }

  // Build formatted string with category labels
  const parts: string[] = [];
  const categoryOrder: MoodCategory[] = ['mood', 'composition', 'lighting', 'color', 'texture'];
  
  for (const category of categoryOrder) {
    if (grouped[category] && grouped[category]!.length > 0) {
      const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
      parts.push(`${categoryLabel}: ${grouped[category]!.join(', ')}`);
    }
  }

  // Append uncategorized chips
  if (uncategorized.length > 0) {
    parts.push(uncategorized.join(', '));
  }

  return parts.join('. ');
}
