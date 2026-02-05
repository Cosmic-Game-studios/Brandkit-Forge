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
  {
    id: 'zen',
    name: 'Zen',
    description: 'Calm, balanced, meditative serenity with organic harmony.',
  },
  {
    id: 'electric',
    name: 'Electric',
    description: 'High-voltage energy, vivid spectrum bursts, and kinetic motion.',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Warm nostalgic tones, classic elegance, and timeless charm.',
  },
  {
    id: 'fresh',
    name: 'Fresh',
    description: 'Vibrant, youthful energy with clean modern optimism.',
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
  look: ['minimal', 'neon', 'clay', 'blueprint', 'gradient', 'retro', 'glassmorphism', 'watercolor', 'futuristic', 'organic', 'brutalist'],
  surface: ['clean planes', 'smooth gradients', 'rough texture', 'glass', 'metallic', 'matte', 'holographic', 'iridescent', 'frosted', 'watercolor wash'],
  lighting: ['architectural', 'studio', 'dramatic', 'soft glow', 'rim light', 'ambient', 'spot light', 'diffused', 'golden hour', 'electric'],
  mood: ['museum-grade', 'premium', 'playful', 'corporate', 'artistic', 'tech', 'luxury', 'indie', 'zen', 'retro-futuristic'],
  form: ['abstract', 'geometric', 'fluid', 'angular', 'rounded', 'layered', 'flat', '3D depth', 'organic flow', 'paint bleeds'],
} as const;

export const DEFAULT_STYLES = ['minimal', 'neon', 'clay', 'blueprint'] as const;
export const AVAILABLE_STYLES = [
  ...DEFAULT_STYLES,
  'gradient', 'retro', 'glassmorphism', 'watercolor',
] as const;
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
