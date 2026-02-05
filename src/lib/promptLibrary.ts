export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  background: string;
  edit: string;
}

const DEFAULT_PRESET_ID = 'core';

const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Ultra-premium, cinematic, hero-grade brand look.',
    background:
      'cinematic lighting, dramatic depth, ultra premium gradients, modern and sharp',
    edit:
      'refined but powerful halo, razor separation, hero-level polish',
  },
  {
    id: 'soft',
    name: 'Soft Airy',
    description: 'Luminous luxury with dreamy softness and glassy gradients.',
    background:
      'luminous and airy, luxury pastels, glassy gradients, serene elegance',
    edit:
      'clean glow with silky separation, ultra smooth and refined',
  },
  {
    id: 'bold',
    name: 'Bold Contrast',
    description: 'Maximum contrast, bold energy, and striking visual punch.',
    background:
      'maximum contrast, deep shadows, bold gradients, intense high-energy mood',
    edit:
      'strong separation, crisp edges, powerful hero silhouette',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Dark, sleek, cinematic intensity with sharp premium highlights.',
    background:
      'dark neutral palette, intense highlights, cinematic minimal mood',
    edit:
      'vivid logo, razor separation against the dark base',
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Calm, balanced, meditative serenity with organic harmony.',
    background:
      'serene harmony, muted earth tones, balanced negative space, calm organic flow',
    edit:
      'gentle separation, soft breathing space around logo, tranquil finish',
  },
  {
    id: 'electric',
    name: 'Electric',
    description: 'High-voltage energy, vivid spectrum bursts, and kinetic motion.',
    background:
      'electric spectrum bursts, high-voltage energy, kinetic motion trails, vivid saturated accents',
    edit:
      'energized glow halo, dynamic separation, vibrant edge lighting',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Warm nostalgic tones, classic elegance, and timeless charm.',
    background:
      'warm sepia undertones, classic film grain, timeless elegance, aged paper texture',
    edit:
      'warm-toned separation, classic emboss feel, nostalgic premium finish',
  },
  {
    id: 'fresh',
    name: 'Fresh',
    description: 'Vibrant, youthful energy with clean modern optimism.',
    background:
      'bright optimistic palette, clean white space, youthful gradients, spring-fresh vibrancy',
    edit:
      'crisp clean separation, bright airy halo, modern optimistic polish',
  },
];

export function getPromptPresets(): PromptPreset[] {
  return PROMPT_PRESETS;
}

export function getPromptPresetIds(): string[] {
  return PROMPT_PRESETS.map((preset) => preset.id);
}

export function getPromptPreset(id?: string): PromptPreset {
  const fallback =
    PROMPT_PRESETS.find((entry) => entry.id === DEFAULT_PRESET_ID) ||
    PROMPT_PRESETS[0];

  if (!id) {
    return fallback;
  }

  const preset = PROMPT_PRESETS.find(
    (entry) => entry.id.toLowerCase() === id.toLowerCase()
  );
  return preset || fallback;
}

export function getDefaultPresetId(): string {
  return DEFAULT_PRESET_ID;
}
