export interface BrandConfig {
  logoPath: string;
  name: string;
  tagline?: string;
  colors?: string[];
  styles: string[];
  preset?: string;
  customStyles?: Record<string, string>; // Custom style name -> prompt
  customPresets?: Record<string, { description: string; background: string; edit: string }>; // Custom preset name -> config
  n: number;
  outputDir: string;
  format: 'png' | 'webp' | 'jpeg';
  quality: 'low' | 'medium' | 'high' | 'auto';
  dryRun: boolean;
  cache: boolean;
  apiKey?: string; // Optional API key from frontend
  demoMode?: boolean; // Demo mode uses placeholder images instead of API
  backgroundSize?: 'landscape' | 'square' | 'portrait'; // Image orientation
  transparency?: boolean; // PNG transparency for hero images
  compression?: number; // JPEG compression quality (50-100)
}

export interface StylePrompt {
  style: string;
  prompt: string;
}

export interface GeneratedImage {
  path: string;
  style: string;
  variant: number;
  type: 'background' | 'hero-landscape' | 'hero-square';
  prompt?: string;
  parameters?: Record<string, unknown>;
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

export interface CacheEntry {
  hash: string;
  path: string;
  timestamp: string;
  config: Record<string, unknown>;
}

export interface CostInfo {
  totalCost: number;
  apiCalls: number;
  breakdown: {
    backgrounds: number;
    heroes: number;
  };
}
