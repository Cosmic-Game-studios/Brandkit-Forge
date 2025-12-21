import type { BrandConfig } from '../types.js';
import { getDefaultPresetId } from './promptLibrary.js';
import { getDefaultStyles, parseStyles } from './styles.js';

const FORMAT_OPTIONS = new Set<BrandConfig['format']>(['png', 'webp', 'jpeg']);
const QUALITY_OPTIONS = new Set<BrandConfig['quality']>([
  'low',
  'medium',
  'high',
  'auto',
]);
const SIZE_OPTIONS = new Set<NonNullable<BrandConfig['backgroundSize']>>([
  'landscape',
  'square',
  'portrait',
]);

const DEFAULT_CONFIG = {
  n: 2,
  format: 'png' as const,
  quality: 'high' as const,
  dryRun: false,
  cache: true,
  demoMode: false,
  backgroundSize: 'landscape' as const,
  transparency: false,
  compression: 85,
};

export interface ConfigInput {
  name: string;
  tagline?: string;
  colors?: string[] | string;
  styles?: string[] | string;
  preset?: string;
  customStyles?: Record<string, string>;
  customPresets?: Record<string, { description: string; background: string; edit: string }>;
  n?: number | string;
  format?: string;
  quality?: string;
  dryRun?: boolean;
  cache?: boolean;
  apiKey?: string;
  demoMode?: boolean;
  backgroundSize?: string;
  transparency?: boolean;
  compression?: number;
}

export type NormalizedConfig = Omit<BrandConfig, 'logoPath' | 'outputDir'>;

function normalizeStringArray(value?: string[] | string): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeTagline(tagline?: string): string | undefined {
  const trimmed = tagline?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveColors(colors?: string[] | string): string[] {
  return normalizeStringArray(colors);
}

function resolveStyles(styles?: string[] | string): string[] {
  if (Array.isArray(styles)) {
    const normalized = normalizeStringArray(styles);
    return normalized.length > 0 ? normalized : getDefaultStyles();
  }

  const parsed = parseStyles(styles);
  return parsed.length > 0 ? parsed : getDefaultStyles();
}

function resolveNumber(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function resolveFormat(format?: string): BrandConfig['format'] {
  if (format && FORMAT_OPTIONS.has(format as BrandConfig['format'])) {
    return format as BrandConfig['format'];
  }
  return DEFAULT_CONFIG.format;
}

function resolveQuality(quality?: string): BrandConfig['quality'] {
  if (quality && QUALITY_OPTIONS.has(quality as BrandConfig['quality'])) {
    return quality as BrandConfig['quality'];
  }
  return DEFAULT_CONFIG.quality;
}

function resolveBackgroundSize(size?: string): NonNullable<BrandConfig['backgroundSize']> {
  if (size && SIZE_OPTIONS.has(size as NonNullable<BrandConfig['backgroundSize']>)) {
    return size as NonNullable<BrandConfig['backgroundSize']>;
  }
  return DEFAULT_CONFIG.backgroundSize;
}

function resolveCompression(compression?: number): number {
  if (typeof compression !== 'number' || !Number.isFinite(compression)) {
    return DEFAULT_CONFIG.compression;
  }
  if (compression < 50) {
    return 50;
  }
  if (compression > 100) {
    return 100;
  }
  return Math.round(compression);
}

function normalizeCustomStyles(
  customStyles?: Record<string, string>
): Record<string, string> | undefined {
  if (!customStyles || Object.keys(customStyles).length === 0) {
    return undefined;
  }
  return customStyles;
}

function normalizeCustomPresets(
  customPresets?: Record<string, { description: string; background: string; edit: string }>
): Record<string, { description: string; background: string; edit: string }> | undefined {
  if (!customPresets || Object.keys(customPresets).length === 0) {
    return undefined;
  }
  return customPresets;
}

export function normalizeConfig(input: ConfigInput): NormalizedConfig {
  const name = input.name?.trim ? input.name.trim() : '';
  const preset = input.preset?.trim();

  return {
    name,
    tagline: normalizeTagline(input.tagline),
    colors: resolveColors(input.colors),
    styles: resolveStyles(input.styles),
    preset: preset || getDefaultPresetId(),
    customStyles: normalizeCustomStyles(input.customStyles),
    customPresets: normalizeCustomPresets(input.customPresets),
    n: resolveNumber(input.n, DEFAULT_CONFIG.n),
    format: resolveFormat(input.format),
    quality: resolveQuality(input.quality),
    dryRun: input.dryRun ?? DEFAULT_CONFIG.dryRun,
    cache: input.cache ?? DEFAULT_CONFIG.cache,
    apiKey: input.apiKey?.trim() || undefined,
    demoMode: input.demoMode ?? DEFAULT_CONFIG.demoMode,
    backgroundSize: resolveBackgroundSize(input.backgroundSize),
    transparency: input.transparency ?? DEFAULT_CONFIG.transparency,
    compression: resolveCompression(input.compression),
  };
}

export function getDefaultConfig(): typeof DEFAULT_CONFIG {
  return { ...DEFAULT_CONFIG };
}
