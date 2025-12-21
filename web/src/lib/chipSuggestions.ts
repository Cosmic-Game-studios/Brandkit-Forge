/**
 * Chip Suggestions Utilities
 * 
 * Provides functions for suggesting compatible chips based on
 * currently selected chips, using compatibility matrices.
 * 
 * @module chipSuggestions
 */

import { STYLE_CHIPS, MOOD_CHIPS } from './createConstants';

/**
 * Defines chip compatibility relationships for style chips.
 * Maps each chip to an array of chips that work well together.
 * 
 * @internal
 */
const STYLE_CHIP_COMPATIBILITY: Record<string, string[]> = {
  minimal: ['clean planes', 'architectural', 'premium', 'abstract'],
  neon: ['holographic', 'iridescent', 'dramatic', 'tech'],
  clay: ['soft glow', 'rounded', 'premium', '3D depth'],
  blueprint: ['geometric', 'angular', 'tech', 'clean'],
  retro: ['vintage', 'warm', 'textured'],
  futuristic: ['holographic', 'metallic', 'tech', 'geometric'],
  organic: ['fluid', 'rounded', 'natural', 'soft'],
  brutalist: ['geometric', 'angular', 'high contrast', 'sharp'],
  'clean planes': ['minimal', 'architectural', 'premium'],
  'smooth gradients': ['minimal', 'premium', 'soft'],
  'rough texture': ['organic', 'vintage', 'warm'],
  glass: ['premium', 'refined', 'crisp'],
  metallic: ['futuristic', 'tech', 'polished'],
  matte: ['minimal', 'soft', 'calm'],
  holographic: ['neon', 'futuristic', 'tech'],
  iridescent: ['neon', 'premium', 'luxury'],
  architectural: ['minimal', 'geometric', 'clean'],
  studio: ['premium', 'polished', 'refined'],
  dramatic: ['neon', 'bold', 'intense'],
  'soft glow': ['clay', 'organic', 'calm'],
  'rim light': ['dramatic', 'bold', 'intense'],
  ambient: ['soft', 'calm', 'natural'],
  'spot light': ['dramatic', 'bold', 'focused'],
  diffused: ['soft', 'calm', 'gentle'],
  'museum-grade': ['minimal', 'premium', 'refined'],
  premium: ['minimal', 'polished', 'refined'],
  playful: ['organic', 'rounded', 'soft'],
  corporate: ['minimal', 'clean', 'professional'],
  artistic: ['organic', 'fluid', 'creative'],
  tech: ['futuristic', 'geometric', 'sharp'],
  luxury: ['premium', 'polished', 'refined'],
  indie: ['organic', 'artistic', 'creative'],
  abstract: ['minimal', 'geometric', 'fluid'],
  geometric: ['minimal', 'tech', 'sharp'],
  fluid: ['organic', 'artistic', 'soft'],
  angular: ['brutalist', 'tech', 'sharp'],
  rounded: ['clay', 'organic', 'soft'],
  layered: ['3D depth', 'premium', 'refined'],
  flat: ['minimal', 'clean', 'simple'],
  '3D depth': ['clay', 'premium', 'layered'],
};

/**
 * Defines chip compatibility relationships for mood chips.
 * Maps each chip to an array of chips that work well together.
 * 
 * @internal
 */
const MOOD_CHIP_COMPATIBILITY: Record<string, string[]> = {
  cinematic: ['dramatic', 'premium', 'polished', 'refined'],
  soft: ['calm', 'dreamy', 'elegant', 'smooth'],
  dramatic: ['cinematic', 'intense', 'bold', 'sharp'],
  natural: ['soft', 'calm', 'organic', 'elegant'],
  studio: ['premium', 'polished', 'refined', 'clean'],
  neon: ['bold', 'intense', 'energetic', 'sharp'],
  'golden hour': ['warm', 'soft', 'elegant', 'dreamy'],
  moody: ['dramatic', 'intense', 'deep shadows', 'polished'],
  premium: ['cinematic', 'polished', 'refined', 'elegant'],
  minimal: ['clean', 'smooth', 'crisp', 'refined'],
  bold: ['dramatic', 'intense', 'energetic', 'sharp'],
  calm: ['soft', 'dreamy', 'elegant', 'smooth'],
  energetic: ['bold', 'intense', 'neon', 'sharp'],
  dreamy: ['soft', 'calm', 'elegant', 'smooth'],
  intense: ['dramatic', 'bold', 'neon', 'sharp'],
  elegant: ['premium', 'polished', 'refined', 'smooth'],
  modern: ['minimal', 'clean', 'sharp', 'crisp'],
  vintage: ['warm', 'textured', 'soft', 'calm'],
  futuristic: ['neon', 'bold', 'sharp', 'crisp'],
  organic: ['soft', 'calm', 'natural', 'smooth'],
  geometric: ['minimal', 'clean', 'sharp', 'crisp'],
  abstract: ['minimal', 'modern', 'clean', 'refined'],
  clean: ['minimal', 'modern', 'smooth', 'crisp'],
  textured: ['vintage', 'warm', 'organic', 'natural'],
  'deep shadows': ['dramatic', 'moody', 'intense', 'polished'],
  'soft shadows': ['soft', 'calm', 'elegant', 'smooth'],
  flat: ['minimal', 'clean', 'simple', 'crisp'],
  layered: ['3D', 'premium', 'refined', 'polished'],
  '3D': ['layered', 'premium', 'refined', 'polished'],
  gradient: ['soft', 'smooth', 'elegant', 'dreamy'],
  'high contrast': ['bold', 'dramatic', 'intense', 'sharp'],
  'low contrast': ['soft', 'calm', 'elegant', 'smooth'],
  polished: ['premium', 'cinematic', 'refined', 'sharp'],
  matte: ['soft', 'calm', 'minimal', 'smooth'],
  glossy: ['premium', 'polished', 'refined', 'crisp'],
  silky: ['soft', 'elegant', 'smooth', 'dreamy'],
  refined: ['premium', 'polished', 'elegant', 'sharp'],
  sharp: ['bold', 'dramatic', 'intense', 'crisp'],
  smooth: ['soft', 'calm', 'elegant', 'dreamy'],
  crisp: ['minimal', 'clean', 'modern', 'sharp'],
};

/**
 * Gets suggested chips based on currently selected chips.
 * Uses compatibility matrices to find chips that work well with the selection.
 * 
 * @param selectedChips - Array of currently selected chip names
 * @param type - Type of chips ('style' or 'mood')
 * @param limit - Maximum number of suggestions to return (default: 5)
 * @returns Array of suggested chip names, sorted by compatibility score
 * 
 * @example
 * ```ts
 * const suggestions = getSuggestedChips(['minimal'], 'style', 3);
 * // Returns: ['clean planes', 'architectural', 'premium']
 * ```
 */
export function getSuggestedChips(
  selectedChips: string[],
  type: 'style' | 'mood',
  limit: number = 5
): string[] {
  if (selectedChips.length === 0) return [];

  const compatibilityMap = type === 'style' ? STYLE_CHIP_COMPATIBILITY : MOOD_CHIP_COMPATIBILITY;
  const allChips = type === 'style' 
    ? Object.values(STYLE_CHIPS).flat()
    : Object.values(MOOD_CHIPS).flat();

  // Count compatibility scores
  const scores: Record<string, number> = {};

  for (const selectedChip of selectedChips) {
    const compatible = compatibilityMap[selectedChip] || [];
    for (const chip of compatible) {
      if (!selectedChips.includes(chip) && allChips.includes(chip)) {
        scores[chip] = (scores[chip] || 0) + 1;
      }
    }
  }

  // Sort by score and return top suggestions
  const suggestions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([chip]) => chip);

  return suggestions;
}

/**
 * Gets the compatibility score for a chip with the current selection.
 * Higher scores indicate better compatibility.
 * 
 * @param chip - The chip to check compatibility for
 * @param selectedChips - Array of currently selected chips
 * @param type - Type of chips ('style' or 'mood')
 * @returns Compatibility score (number of selected chips that are compatible)
 * 
 * @example
 * ```ts
 * const score = getChipCompatibilityScore('clean planes', ['minimal'], 'style');
 * // Returns: 1 (minimal is compatible with clean planes)
 * ```
 */
export function getChipCompatibilityScore(
  chip: string,
  selectedChips: string[],
  type: 'style' | 'mood'
): number {
  if (selectedChips.length === 0) return 0;
  if (selectedChips.includes(chip)) return 0;

  const compatibilityMap = type === 'style' ? STYLE_CHIP_COMPATIBILITY : MOOD_CHIP_COMPATIBILITY;
  const compatible = compatibilityMap[chip] || [];

  // Count how many selected chips are compatible with this chip
  return selectedChips.filter((selected) => compatible.includes(selected)).length;
}
