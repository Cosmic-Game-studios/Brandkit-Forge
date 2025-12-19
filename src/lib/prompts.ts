import type { BrandConfig } from '../types.js';
import { getPromptPreset, PromptPreset } from './promptLibrary.js';

const STYLE_TEMPLATES: Record<string, string> = {
  minimal:
    'ultra minimal, large clean planes, razor-smooth gradients, architectural lighting, museum-grade, abstract',
  neon:
    'intense neon glow, saturated spectrum accents, cyberpunk energy, electric haze, deep contrast, abstract',
  clay:
    'hyper polished claymorphism, bold pill forms, studio key light, deep soft shadows, premium 3D, tactile depth',
  blueprint:
    'high contrast blueprint style, razor grid lines, technical overlays, precision geometry, monochrome',
};

function getPresetForConfig(config: BrandConfig): PromptPreset {
  // Check for custom preset first
  if (config.preset && config.customPresets?.[config.preset]) {
    const custom = config.customPresets[config.preset];
    return {
      id: config.preset,
      name: config.preset,
      description: custom.description,
      background: custom.background,
      edit: custom.edit,
    };
  }
  // Fall back to built-in preset
  return getPromptPreset(config.preset);
}

export function buildBackgroundPrompt(
  style: string,
  colors: string[] = [],
  config: BrandConfig
): string {
  const preset = getPresetForConfig(config);
  const customStyle = config.customStyles?.[style];
  const styleDesc = customStyle || STYLE_TEMPLATES[style] || STYLE_TEMPLATES.minimal;
  const colorDesc = colors.length > 0 ? `Primary colors: ${colors.join(', ')}.` : '';

  return [
    'Create an abstract background for a premium brand hero.',
    'Intended use: logo placement background for a launch asset.',
    `Style: ${styleDesc}.`,
    `Mood: ${preset.background}.`,
    colorDesc,
    'Scene: background only, no objects.',
    'Medium: high-end digital gradient design.',
    'Composition: asymmetrical, heavy negative space, safe zone center-left (~40% width).',
    'Details: smooth gradients, clean surfaces, refined lighting, premium finish.',
    'Constraints: no text, letters, logos, icons, watermarks, UI, or people.',
    'Output: high resolution, print-ready, no banding or artifacts.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEditPrompt(config: BrandConfig): string {
  const preset = getPresetForConfig(config);
  const taglinePart = config.tagline
    ? `Text: add the tagline exactly as provided below the logo. Tagline: "${config.tagline}". Use a clean sans-serif font, high legibility, subtle weight, no effects, single line if possible.`
    : 'Text: do not add any text.';

  return [
    'Edit the image to create a premium brand hero.',
    'Change only: logo placement, separation, and optional tagline. Keep everything else the same.',
    'Subject: the provided logo only.',
    'Logo: keep EXACTLY unchanged (shape, colors, proportions, edges).',
    'Placement: centered with generous margins; do not crop.',
    'Background: preserve the provided background; do not alter its color, texture, or layout.',
    'Separation: add a refined glow or soft shadow behind the logo.',
    `Look: ${preset.edit}.`,
    taglinePart,
    'Constraints: no extra symbols, no extra text besides the tagline, no new elements.',
    'Finish: ultra clean, premium, professional brand hero image.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function getStyleTemplates(): Record<string, string> {
  return STYLE_TEMPLATES;
}
