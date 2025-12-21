import type { PresetOption } from '../types';

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Ultra-premium, cinematic, hero-grade polish.',
  },
  {
    id: 'soft',
    name: 'Soft Airy',
    description: 'Luminous luxury with dreamy softness.',
  },
  {
    id: 'bold',
    name: 'Bold Contrast',
    description: 'Maximum contrast with bold energy and punch.',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Dark, sleek, cinematic intensity with sharp highlights.',
  },
];

export const MOOD_CHIPS = {
  lighting: ['cinematic', 'soft', 'dramatic', 'natural', 'studio', 'neon', 'golden hour', 'moody'],
  atmosphere: ['premium', 'minimal', 'bold', 'calm', 'energetic', 'dreamy', 'intense', 'elegant'],
  style: ['modern', 'vintage', 'futuristic', 'organic', 'geometric', 'abstract', 'clean', 'textured'],
  depth: ['deep shadows', 'soft shadows', 'flat', 'layered', '3D', 'gradient', 'high contrast', 'low contrast'],
  finish: ['polished', 'matte', 'glossy', 'silky', 'refined', 'sharp', 'smooth', 'crisp'],
} as const;

export const STYLE_CHIPS = {
  look: ['minimal', 'neon', 'clay', 'blueprint', 'retro', 'futuristic', 'organic', 'brutalist'],
  surface: ['clean planes', 'smooth gradients', 'rough texture', 'glass', 'metallic', 'matte', 'holographic', 'iridescent'],
  lighting: ['architectural', 'studio', 'dramatic', 'soft glow', 'rim light', 'ambient', 'spot light', 'diffused'],
  mood: ['museum-grade', 'premium', 'playful', 'corporate', 'artistic', 'tech', 'luxury', 'indie'],
  form: ['abstract', 'geometric', 'fluid', 'angular', 'rounded', 'layered', 'flat', '3D depth'],
} as const;

export const DEFAULT_STYLES = ['minimal', 'neon', 'clay', 'blueprint'] as const;
export const AVAILABLE_STYLES = [...DEFAULT_STYLES];
export const DEFAULT_STYLE_CHIPS = [
  'minimal',
  'clean planes',
  'architectural',
  'premium',
  'abstract',
] as const;

export const DEFAULT_PRESET_BACKGROUND_CHIPS = ['cinematic', 'premium', 'modern'] as const;
export const DEFAULT_PRESET_EDIT_CHIPS = ['polished', 'refined', 'clean'] as const;

export type MoodCategory = keyof typeof MOOD_CHIPS;
export type StyleCategory = keyof typeof STYLE_CHIPS;
