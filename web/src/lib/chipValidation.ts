/**
 * Chip Validation Utilities
 * 
 * Provides functions for validating chip combinations and detecting
 * incompatible chip pairs that may conflict with each other.
 * 
 * @module chipValidation
 */

import { STYLE_CHIPS, MOOD_CHIPS } from './createConstants';

/**
 * Defines incompatible style chip combinations.
 * Chips in the same array are mutually exclusive.
 * 
 * @internal
 */
const INCOMPATIBLE_STYLE_CHIPS: string[][] = [
  ['minimal', 'textured', 'rough texture'], // Minimal conflicts with textured
  ['flat', '3D depth', 'layered'], // Flat conflicts with depth
  ['clean planes', 'rough texture'], // Clean conflicts with rough
  ['matte', 'glossy', 'holographic'], // Different finish types
];

/**
 * Defines incompatible mood chip combinations.
 * Chips in the same array are mutually exclusive.
 * 
 * @internal
 */
const INCOMPATIBLE_MOOD_CHIPS: string[][] = [
  ['flat', '3D', 'layered'], // Flat conflicts with depth
  ['high contrast', 'low contrast'], // Contrast levels conflict
  ['deep shadows', 'soft shadows', 'flat'], // Shadow types conflict
  ['minimal', 'textured'], // Minimal conflicts with textured
];

/**
 * Validation result containing warnings about incompatible chips
 */
export interface ValidationResult {
  /** Whether the chip combination is valid (no warnings) */
  isValid: boolean;
  /** Array of warnings about incompatible chip combinations */
  warnings: Array<{
    /** Array of conflicting chip names */
    chips: string[];
    /** Human-readable reason for the warning */
    reason: string;
  }>;
}

/**
 * Validates a set of style chips for incompatibilities.
 * Checks if any incompatible chip combinations are present.
 * 
 * @param chips - Array of style chip names to validate
 * @returns Validation result with warnings about incompatible combinations
 * 
 * @example
 * ```ts
 * const result = validateStyleChips(['minimal', 'textured']);
 * // Returns: { isValid: false, warnings: [{ chips: ['minimal', 'textured'], reason: '...' }] }
 * ```
 */
export function validateStyleChips(chips: string[]): ValidationResult {
  const warnings: Array<{ chips: string[]; reason: string }> = [];

  for (const incompatibleGroup of INCOMPATIBLE_STYLE_CHIPS) {
    const found = incompatibleGroup.filter((chip) => chips.includes(chip));
    if (found.length > 1) {
      warnings.push({
        chips: found,
        reason: `These properties may conflict: ${found.join(', ')}`,
      });
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Validates a set of mood chips for incompatibilities.
 * Checks if any incompatible chip combinations are present.
 * 
 * @param chips - Array of mood chip names to validate
 * @returns Validation result with warnings about incompatible combinations
 * 
 * @example
 * ```ts
 * const result = validateMoodChips(['high contrast', 'low contrast']);
 * // Returns: { isValid: false, warnings: [{ chips: [...], reason: '...' }] }
 * ```
 */
export function validateMoodChips(chips: string[]): ValidationResult {
  const warnings: Array<{ chips: string[]; reason: string }> = [];

  for (const incompatibleGroup of INCOMPATIBLE_MOOD_CHIPS) {
    const found = incompatibleGroup.filter((chip) => chips.includes(chip));
    if (found.length > 1) {
      warnings.push({
        chips: found,
        reason: `These properties may conflict: ${found.join(', ')}`,
      });
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Incompatibility check result
 */
export interface IncompatibilityResult {
  /** Whether the chip is incompatible with the current selection */
  incompatible: boolean;
  /** Array of chip names that conflict with the checked chip */
  conflictingChips: string[];
}

/**
 * Checks if a specific chip is incompatible with the current selection.
 * 
 * @param chip - The chip to check for incompatibility
 * @param currentChips - Array of currently selected chips
 * @param type - Type of chips ('style' or 'mood')
 * @returns Incompatibility result with conflicting chips if any
 * 
 * @example
 * ```ts
 * const result = isChipIncompatible('minimal', ['textured'], 'style');
 * // Returns: { incompatible: true, conflictingChips: ['textured'] }
 * ```
 */
export function isChipIncompatible(
  chip: string,
  currentChips: string[],
  type: 'style' | 'mood'
): IncompatibilityResult {
  const incompatibleGroups =
    type === 'style' ? INCOMPATIBLE_STYLE_CHIPS : INCOMPATIBLE_MOOD_CHIPS;

  for (const group of incompatibleGroups) {
    if (group.includes(chip)) {
      const conflicting = group.filter((c) => c !== chip && currentChips.includes(c));
      if (conflicting.length > 0) {
        return {
          incompatible: true,
          conflictingChips: conflicting,
        };
      }
    }
  }

  return {
    incompatible: false,
    conflictingChips: [],
  };
}
