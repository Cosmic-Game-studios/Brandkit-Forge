export type ImageFormat = 'png' | 'webp' | 'jpeg';
export type ImageQuality = 'low' | 'medium' | 'high' | 'auto';
export type BackgroundSize = 'landscape' | 'square' | 'portrait';

export interface PresetOption {
  id: string;
  name: string;
  description: string;
}

export type CustomStyleMap = Record<string, string>;

export interface CustomPreset {
  description: string;
  background: string;
  edit: string;
}

export type CustomPresetMap = Record<string, CustomPreset>;

export interface CostEstimate {
  totalCost: number;
  totalApiCalls: number;
  numStyles: number;
  variants: number;
}

export interface FileInfo {
  path: string;
  url: string;
}

export interface BrandkitManifest {
  timestamp: string;
  input: {
    logo: string;
    name: string;
    tagline?: string;
    colors?: string[];
  };
  config: {
    styles: string[];
    preset?: string;
    n: number;
    format: string;
    quality: string;
  };
  prompts: {
    backgrounds: Record<string, string>;
    edits: Record<string, string>;
  };
  generated: {
    backgrounds: string[];
    heroes: string[];
    icons: string[];
    social: string[];
  };
  outputDir: string;
}

export interface JobResult {
  manifest: BrandkitManifest | null;
  files: FileInfo[];
  outputDir: string;
}
