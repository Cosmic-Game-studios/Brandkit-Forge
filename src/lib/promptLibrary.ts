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
