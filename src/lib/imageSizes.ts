import type { BrandConfig } from '../types.js';

export type ImageSize = '1536x1024' | '1024x1024' | '1024x1536';

export type HeroSizeType = 'landscape' | 'portrait' | 'square';

export interface HeroSizeOption {
  type: HeroSizeType;
  size: ImageSize;
  filename: string;
}

const HERO_SIZES: Record<HeroSizeType, HeroSizeOption> = {
  landscape: {
    type: 'landscape',
    size: '1536x1024',
    filename: 'hero-landscape.png',
  },
  portrait: {
    type: 'portrait',
    size: '1024x1536',
    filename: 'hero-portrait.png',
  },
  square: {
    type: 'square',
    size: '1024x1024',
    filename: 'hero-square.png',
  },
};

export const SIZE_DIMENSIONS: Record<ImageSize, [number, number]> = {
  '1536x1024': [1536, 1024],
  '1024x1024': [1024, 1024],
  '1024x1536': [1024, 1536],
};

export function getBackgroundSize(config: BrandConfig): ImageSize {
  switch (config.backgroundSize) {
    case 'portrait':
      return HERO_SIZES.portrait.size;
    case 'square':
      return HERO_SIZES.square.size;
    case 'landscape':
    default:
      return HERO_SIZES.landscape.size;
  }
}

export function getHeroSizes(config: BrandConfig): HeroSizeOption[] {
  const sizes: HeroSizeOption[] = [HERO_SIZES.square];
  if (config.backgroundSize === 'portrait') {
    sizes.push(HERO_SIZES.portrait);
  } else if (config.backgroundSize === 'landscape' || !config.backgroundSize) {
    sizes.push(HERO_SIZES.landscape);
  }
  return sizes;
}
