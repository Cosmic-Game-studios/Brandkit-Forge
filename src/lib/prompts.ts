import type { BrandConfig } from '../types.js';
import { getPromptPreset, PromptPreset } from './promptLibrary.js';

const STYLE_TEMPLATES = {
  minimal:
    'ultra minimal, large clean planes, razor-smooth gradients, architectural lighting, museum-grade, abstract',
  neon:
    'intense neon glow, saturated spectrum accents, cyberpunk energy, electric haze, deep contrast, abstract',
  clay:
    'hyper polished claymorphism, bold pill forms, studio key light, deep soft shadows, premium 3D, tactile depth',
  blueprint:
    'high contrast blueprint style, razor grid lines, technical overlays, precision geometry, monochrome',
} as const;

const DEFAULT_STYLE_KEY = 'minimal';

const BACKGROUND_BASE_LINES = [
  'Create an abstract background for a premium brand hero.',
  'Intended use: brand launch hero background for logo placement.',
];

const BACKGROUND_DETAIL_LINES = [
  'Scene: background only; no objects or subjects.',
  'Medium: high-end digital gradient design.',
  'Composition: asymmetrical with heavy negative space; safe zone center-left (~40% width).',
  'Lighting: refined and studio-grade; avoid harsh hotspots.',
  'Details: smooth gradients, clean surfaces, premium finish.',
  'Constraints: no text, letters, logos, icons, watermarks, UI, or people.',
  'Output: high resolution, print-ready, no banding or artifacts.',
];

const EDIT_BASE_LINES = [
  'Edit the image to produce a premium brand hero.',
  'Change only: logo placement, separation, and optional tagline. Keep everything else unchanged.',
  'Subject: the provided logo only.',
  'Logo: keep EXACTLY unchanged (shape, colors, proportions, edges).',
  'Placement: centered with generous margins; do not crop.',
  'Background: preserve the provided background; do not alter its color, texture, or layout.',
  'Separation: add a refined halo or soft shadow to lift the logo.',
];

const EDIT_DETAIL_LINES = [
  'Constraints: no extra symbols, no extra text besides the tagline, no new elements.',
  'Finish: ultra clean, premium, professional brand hero image.',
];

function buildPrompt(lines: Array<string | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

function normalizeStyleKey(style: string): string {
  return style.trim().toLowerCase();
}

function resolveStyleDescription(
  style: string,
  customStyles?: Record<string, string>
): string {
  if (customStyles?.[style]) {
    return customStyles[style];
  }

  const normalized = normalizeStyleKey(style);
  if (normalized && normalized in STYLE_TEMPLATES) {
    return STYLE_TEMPLATES[normalized as keyof typeof STYLE_TEMPLATES];
  }

  return STYLE_TEMPLATES[DEFAULT_STYLE_KEY];
}

function buildColorLine(colors: string[]): string | undefined {
  const cleaned = colors.map((color) => color.trim()).filter(Boolean);
  return cleaned.length > 0
    ? `Primary colors to emphasize: ${cleaned.join(', ')}.`
    : undefined;
}

function buildTaglineLine(tagline?: string): string {
  const trimmed = tagline?.trim();
  if (trimmed) {
    return `Text: add the tagline exactly as provided below the logo. Tagline: "${trimmed}". Use a clean sans-serif font with high legibility, subtle weight, no effects, single line if possible.`;
  }
  return 'Text: do not add any text.';
}

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
  const styleDesc = resolveStyleDescription(style, config.customStyles);
  const colorLine = buildColorLine(colors);

  return buildPrompt([
    ...BACKGROUND_BASE_LINES,
    `Style: ${styleDesc}.`,
    `Mood: ${preset.background}.`,
    colorLine,
    ...BACKGROUND_DETAIL_LINES,
  ]);
}

export function buildEditPrompt(config: BrandConfig): string {
  const preset = getPresetForConfig(config);
  const taglineLine = buildTaglineLine(config.tagline);

  return buildPrompt([
    ...EDIT_BASE_LINES,
    `Look: ${preset.edit}.`,
    taglineLine,
    ...EDIT_DETAIL_LINES,
  ]);
}

export function getStyleTemplates(): Record<string, string> {
  return { ...STYLE_TEMPLATES };
}
